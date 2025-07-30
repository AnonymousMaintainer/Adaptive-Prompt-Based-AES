import logging
import time
from typing import Any, List
from io import BytesIO
from contextlib import contextmanager

from fastapi import HTTPException, status
from sqlmodel import select
import requests

from ..core import security
from ..models import exam_model, project_model, user_model
from ..schemas import exam_schema
from .ai_evaluation import evaluate_exam, extract_exam_metadata
from .aws_s3 import generate_presigned_url
from ..utils.email_util import send_email_notification
from ..core.vectordb import get_similar_exams


# Configure logging
logger = logging.getLogger(__name__)

# Constants
BATCH_SIZE = 5  # Number of exams to process in parallel
RATE_LIMIT_DELAY = 3  # Seconds to wait between API calls
MAX_RETRIES = 3  # Maximum number of retries for failed evaluations
RETRY_DELAY = 5  # Base delay for retries in seconds
MAX_RETRY_DELAY = 60  # Maximum delay between retries in seconds
TOP_K = 3  # Number of similar exams to retrieve

@contextmanager
def managed_bytesio():
    """Context manager for BytesIO objects to ensure proper cleanup."""
    bio = BytesIO()
    try:
        yield bio
    finally:
        bio.close()

async def generate_fewshot_prompt(exam_text: str, top_k: int = 5) -> str:
    results = get_similar_exams(query_text=exam_text, n_results=top_k)

    prompt = ''
    for i in range(len(results['documents'][0])):
        doc = results['documents'][0][i]
        metadata = results['metadatas'][0][i]
        similarity = results['distances'][0][i]

        prompt += (
            f"Similar Example {i + 1} with Your Past Evaluation:\n"
            f"{doc}\n"
            f"{metadata}\n"
            f"-------------------------------------------\n"
        )

    return prompt

async def process_exam_with_retry(
    session: Any,
    exam: exam_model.Exam,
    project: project_model.Project,
    evaluation_type: exam_schema.EvaluationTypeEnum = exam_schema.EvaluationTypeEnum.full,
    retry_count: int = 0
) -> bool:
    """
    Process a single exam with retry logic.
    
    Args:
        session: Database session
        exam: Exam to process
        project: Project containing the exam
        evaluation_type: Type of evaluation to perform (full or ai_only)
        retry_count: Current retry attempt number
        
    Returns:
        bool: True if processing succeeded, False otherwise
    """
    try:
        # Get image from S3
        image_url = generate_presigned_url(exam.exam_image_url)
        
        # Download image data with proper resource management
        with managed_bytesio() as image_data:
            response = requests.get(image_url)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to download image from S3"
                )
            image_data.write(response.content)
            image_data.seek(0)
            
            # Extract metadata and text only if doing full evaluation
            if evaluation_type == exam_schema.EvaluationTypeEnum.full:
                metadata = await extract_exam_metadata(image_data, session)
                
                # Update exam with metadata
                exam.student_id = metadata.student_id
                exam.student_section = metadata.section
                exam.student_seat = metadata.seat
                exam.student_room = metadata.room
                exam.exam_extracted_text = metadata.extracted_exam_text

            # Evaluate exam using existing text or newly extracted text
            evaluation = await evaluate_exam(
                retrieved_exam=await generate_fewshot_prompt(exam.exam_extracted_text,top_k=TOP_K),
                exam_text=exam.exam_extracted_text,
                task_id=project.task_id,
                session=session
            )
            
            # Update exam with evaluation results
            exam.exam_improved_text = evaluation.improved_text
            exam.scoring_justification = evaluation.scoring_justification
            exam.score_task_completion = evaluation.score_task_completion
            exam.score_organization = evaluation.score_organization
            exam.score_style_language_expression = evaluation.score_style_language_expression
            exam.score_structural_variety_accuracy = evaluation.score_structural_variety_accuracy
            exam.ai_comment = evaluation.ai_comment


            # Automatically adds embedding into ChromaDB
            # try:
            #     add_exam_to_chroma(
            #         exam_id=exam.id,
            #         text=exam.exam_extracted_text,
            #     )
            #     exam.is_embedded = True
            # except Exception as vector_error:
            #     logger.warning(f"ChromaDB insert failed for exam {exam.id}: {vector_error}")

            
            # Mark as processed
            exam.status = exam_schema.StatusEnum.processed
            session.add(exam)
            session.commit()


            
            return True
            
    except Exception as e:
        logger.error(f"Failed to process exam {exam.id} (attempt {retry_count + 1}/{MAX_RETRIES}): {str(e)}")
        
        if retry_count < MAX_RETRIES - 1:
            # Calculate exponential backoff delay
            delay = min(RETRY_DELAY * (2 ** retry_count), MAX_RETRY_DELAY)
            logger.info(f"Retrying exam {exam.id} in {delay} seconds...")
            time.sleep(delay)
            return await process_exam_with_retry(session, exam, project, evaluation_type, retry_count + 1)
        else:
            exam.status = exam_schema.StatusEnum.failed
            session.add(exam)
            session.commit()
            return False

async def process_exam_batch(
    session: Any,
    project_id: int,
    exam_ids: List[int],
    evaluation_type: exam_schema.EvaluationTypeEnum = exam_schema.EvaluationTypeEnum.full
) -> None:
    """
    Process a batch of exams in parallel.
    
    Args:
        session: Database session
        project_id: ID of the project
        exam_ids: List of exam IDs to process
        evaluation_type: Type of evaluation to perform (full or ai_only)
        
    Raises:
        HTTPException: If processing fails
    """
    try:
        # Get all exams in the batch
        exams = session.exec(
            select(exam_model.Exam)
            .where(exam_model.Exam.id.in_(exam_ids))
            .where(exam_model.Exam.status == exam_schema.StatusEnum.pending)
        ).all()
        
        # Get project for task_id
        project = session.exec(
            select(project_model.Project)
            .where(project_model.Project.id == project_id)
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        for exam in exams:
            try:
                # Update status to processing
                exam.status = exam_schema.StatusEnum.processing
                session.add(exam)
                session.commit()
                
                # Process exam with retry logic
                success = await process_exam_with_retry(session, exam, project, evaluation_type)
                
                if success:
                    # Respect rate limits only on successful processing
                    time.sleep(RATE_LIMIT_DELAY)
                
            except Exception as e:
                logger.error(f"Failed to process exam {exam.id}: {str(e)}")
                exam.status = exam_schema.StatusEnum.failed
                session.add(exam)
                session.commit()
                
    except Exception as e:
        logger.error(f"Failed to process exam batch: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process exam batch"
        )


async def evaluate_project_exams(
    session: Any,
    project_id: int,
    current_user: security.UserDep = security.UserDep
) -> None:
    """
    Queue background tasks to evaluate all pending exams in a project.
    
    Args:
        session: Database session
        project_id: ID of the project
        
    Raises:
        HTTPException: If task queuing fails
    """
    try:
        # Get all pending exams for the project
        pending_exams = session.exec(
            select(exam_model.Exam)
            .where(exam_model.Exam.project_id == project_id)
            .where(exam_model.Exam.status == exam_schema.StatusEnum.pending)
        ).all()
        
        if not pending_exams:
            return
        
        # Split exams into batches
        exam_ids = [exam.id for exam in pending_exams]
        batches = [
            exam_ids[i:i + BATCH_SIZE]
            for i in range(0, len(exam_ids), BATCH_SIZE)
        ]
        
        # Process each batch directly instead of queuing as background tasks
        for batch in batches:
            # We'll process this batch directly
            await process_exam_batch(
                session,
                project_id,
                batch
            )
            
        logger.info(f"Processed {len(batches)} batches for project {project_id}")

        # After batch processing, check if all exams are now processed
        statement = select(exam_model.Exam).where(
            exam_model.Exam.project_id == project_id
        )
        all_exams = session.exec(statement).all()

        if all(exam.status == exam_schema.StatusEnum.processed for exam in all_exams):
            statement = select(project_model.Project).where(
                project_model.Project.id == project_id
            )
            project = session.exec(statement).first()

            if project:
                user = current_user
                if user and user.email:
                    send_email_notification(
                        to_email=user.email,
                        subject=f"All Exams Evaluated for Project: {project.project_name}",
                        body=(
                            f"Dear {user.username},\n\n"
                            f"We’re pleased to inform you that all {len(all_exams)} exams in your project \"{project.project_name}\" "
                            f"have been successfully evaluated.\n\n"
                            f"You can now review the results in your dashboard.\n\n"
                            f"Thank you for using our platform.\n\n"
                        )
                    )
        
    except Exception as e:
        logger.error(f"Failed to process exam evaluation tasks: {str(e)}")
        # Don't raise HTTPException here since this is a background task
        # Just log the error and continue