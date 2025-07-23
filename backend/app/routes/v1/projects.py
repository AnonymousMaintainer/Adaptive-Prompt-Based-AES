from typing import List, Optional
from io import BytesIO

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlmodel import select
from datetime import datetime

from ...core import database, security
from ...models import project_model, task_model, exam_model
from ...schemas import project_schema, exam_schema
from ...services import aws_s3, background_helper, pdf_processor
from ...utils import report_generator, csv_generator

import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/projects',
    tags=['projects']
)

@router.get('/', response_model=List[project_schema.ProjectRead])
def get_projects(
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Get all projects for the current user.
    """
    statement = select(project_model.Project).where(project_model.Project.user_id == current_user.id)
    projects = session.exec(statement).all()
    return projects

@router.post('/', response_model=project_schema.ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project: project_schema.ProjectCreate,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Create a new project for the current user.
    """
    task = session.get(task_model.Task, project.task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"Task with id {project.task_id} does not exist"
        )
    # Create a new Project instance from the request data
    db_project = project_model.Project(
        project_name=project.project_name,
        course_name=project.course_name,
        section=project.section,
        task_id=project.task_id,
        user_id=current_user.id 
    )
    
    # Add and commit to database
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    
    return db_project

@router.get('/{project_id}', response_model=project_schema.ProjectRead)
def get_project(
    project_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Get a specific project by ID for the current user.
    """
    statement = select(project_model.Project).where(
        project_model.Project.id == project_id,
        project_model.Project.user_id == current_user.id
    )
    project = session.exec(statement).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    return project

@router.put('/{project_id}', response_model=project_schema.ProjectRead)
def update_project(
    project_id: int,
    project_update: project_schema.ProjectUpdate,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Update an existing project for the current user.
    """
    # Get the existing project
    statement = select(project_model.Project).where(
        project_model.Project.id == project_id,
        project_model.Project.user_id == current_user.id
    )
    db_project = session.exec(statement).first()
    
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # If task_id is being updated, verify the new task exists
    if project_update.task_id is not None:
        task = session.get(task_model.Task, project_update.task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with id {project_update.task_id} does not exist"
            )
    
    # Update only the fields that are provided
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    # Commit changes
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    
    return db_project

@router.delete('/{project_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Delete a project and all its associated exams for the current user.
    """
    # Get the project
    statement = select(project_model.Project).where(
        project_model.Project.id == project_id,
        project_model.Project.user_id == current_user.id
    )
    db_project = session.exec(statement).first()
    
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    try:
        # Delete all associated exams from S3
        await aws_s3.delete_project_exams(current_user.id, project_id)
        
        # Delete all associated exams from database
        exams = session.exec(
            select(exam_model.Exam)
            .where(exam_model.Exam.project_id == project_id)
        ).all()
        
        for exam in exams:
            session.delete(exam)
        
        # Delete the project
        session.delete(db_project)
        session.commit()
        
    except Exception as e:
        logger.error(f"Failed to delete project {project_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project and associated exams"
        )
    
    return None

@router.get('/{project_id}/exams/download/pdf', status_code=status.HTTP_204_NO_CONTENT)
async def download_multiple_exams_pdf(
    project_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Download all exams for a specific project.
    """
    project_statement = select(project_model.Project).where(
        (project_model.Project.id == project_id) &
        (project_model.Project.user_id == current_user.id)
    )
    project = session.exec(project_statement).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found or you do not have access"
        )
    
    exam_statement = select(exam_model.Exam).where(
        (exam_model.Exam.project_id == project_id) &
        (exam_model.Exam.status == exam_schema.StatusEnum.processed)
    )
    exams = session.exec(exam_statement).all()

    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No exams found for project with ID {project_id}"
        )

    final_pdf = await report_generator.generate_exam_pdf(exams)

    return StreamingResponse(
        final_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=project_{project_id}_grading_report.pdf"}
    )


@router.get('/{project_id}/exams/download/csv', status_code=status.HTTP_204_NO_CONTENT)
async def download_multiple_exams_csv(
    project_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Download all exams for a specific project.
    """
    project_statement = select(project_model.Project).where(
        (project_model.Project.id == project_id) &
        (project_model.Project.user_id == current_user.id)
    )
    project = session.exec(project_statement).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found or you do not have access"
        )
    
    exam_statement = select(exam_model.Exam).where(
        (exam_model.Exam.project_id == project_id) &
        (exam_model.Exam.status == exam_schema.StatusEnum.processed)
    )
    exams = session.exec(exam_statement).all()

    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No exams found for project with ID {project_id}"
        )

    csv_file = await csv_generator.generate_csv(exams)

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=project_{project_id}_grading_report.csv"}
    )

@router.get("/{project_id}/exams/{exam_id}/download/pdf", status_code=status.HTTP_200_OK)
async def download_single_exam_pdf(
    project_id: int,
    exam_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Download a single exam (image + report) as a 2-page PDF.
    """
    project = session.exec(
        select(project_model.Project).where(
            (project_model.Project.id == project_id) &
            (project_model.Project.user_id == current_user.id)
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    exam = session.exec(
        select(exam_model.Exam).where(
            (exam_model.Exam.id == exam_id) &
            (exam_model.Exam.project_id == project_id) &
            (exam_model.Exam.status == exam_schema.StatusEnum.processed)
        )
    ).first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    final_pdf = await report_generator.generate_exam_pdf([exam])

    return StreamingResponse(
        final_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=exam_{exam_id}_grading_report.pdf"}
    )

@router.get("/{project_id}/exams/{exam_id}/download/csv", status_code=status.HTTP_200_OK)
async def download_single_exam_csv(
    project_id: int,
    exam_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Download a single exam (image + report) as a 2-page PDF.
    """
    project = session.exec(
        select(project_model.Project).where(
            (project_model.Project.id == project_id) &
            (project_model.Project.user_id == current_user.id)
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    exam = session.exec(
        select(exam_model.Exam).where(
            (exam_model.Exam.id == exam_id) &
            (exam_model.Exam.project_id == project_id) &
            (exam_model.Exam.status == exam_schema.StatusEnum.processed)
        )
    ).first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    csv_file = await csv_generator.generate_csv([exam])

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=project_{project_id}_grading_report.csv"}
    )

@router.post('/{project_id}/exams/upload_and_evaluate', response_model=List[exam_schema.ExamInDB])
async def upload_and_evaluate_exams(
    project_id: int,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Upload multiple exam PDFs, convert each page to images, store in S3, and queue for evaluation.
    Each page of the PDF will be processed and evaluated independently.
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    created_exams = []
    
    for file in files:
        if not file.content_type == "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} is not a PDF"
            )
        
        try:
            # Read file content
            file_content = await file.read()
            pdf_file = BytesIO(file_content)
            
            # Process PDF and get pages
            processed_pages = await pdf_processor.process_pdf(pdf_file)
            
            # Process each page
            for page_number, page_image in processed_pages:
                try:
                    # Create exam record first
                    exam = exam_model.Exam(
                        project_id=project_id,
                        user_id=current_user.id,
                        page=page_number,
                        total_pages=len(processed_pages),
                        status=exam_schema.StatusEnum.pending,
                        is_embedded=False,
                        source=exam_schema.SourceEnum.internal,
                        exam_image_url=None,  # Will be set after S3 upload
                        created_at=datetime.now().isoformat(),
                        updated_at=datetime.now().isoformat()
                    )
                    
                    # Add and commit to ensure exam is persisted
                    session.add(exam)
                    session.commit()
                    session.refresh(exam)
                    
                    # Create BytesIO from image bytes
                    image_file = BytesIO(page_image)
                    
                    try:
                        # Upload page to S3 using the exam ID
                        s3_key = await aws_s3.upload_exam_image(
                            file=image_file,
                            user_id=current_user.id,
                            project_id=project_id,
                            exam_id=exam.id,
                            page_number=page_number
                        )
                        
                        # Update exam with S3 key
                        exam.exam_image_url = s3_key
                        session.add(exam)
                        session.commit()
                        session.refresh(exam)
                        
                        created_exams.append(exam)
                        
                    except Exception as e:
                        # If S3 upload fails, clean up the exam record
                        logger.error(f"Failed to upload to S3 for exam {exam.id}: {str(e)}")
                        session.delete(exam)
                        session.commit()
                        raise
                    
                except Exception as e:
                    logger.error(f"Failed to process page {page_number}: {str(e)}")
                    # Continue with other pages even if one fails
                    continue
            
            # Queue background evaluation for all pages
            background_tasks.add_task(
                background_helper.evaluate_project_exams,
                session,
                project_id,
                current_user
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process exam {file.filename}: {str(e)}"
            )
    
    return created_exams

@router.get('/{project_id}/exams/', response_model=List[exam_schema.ExamInDB])
async def list_project_exams(
    project_id: int,
    status: Optional[exam_schema.StatusEnum] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    List all exams for a project with optional filtering and pagination.
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Build query
    query = select(exam_model.Exam).where(exam_model.Exam.project_id == project_id)
    
    if status:
        query = query.where(exam_model.Exam.status == status)
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    exams = session.exec(query).all()
    return exams

@router.get('/{project_id}/exams/{exam_id}', response_model=exam_schema.ExamInDB)
async def get_exam_details(
    project_id: int,
    exam_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Get detailed information about a specific exam.
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Get exam details
    exam = session.exec(
        select(exam_model.Exam)
        .where(exam_model.Exam.id == exam_id)
        .where(exam_model.Exam.project_id == project_id)
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with ID {exam_id} not found"
        )
    
    # Generate presigned URL for image
    exam.exam_image_url = aws_s3.generate_presigned_url(exam.exam_image_url)
    
    return exam

@router.put('/{project_id}/exams/{exam_id}', response_model=exam_schema.ExamInDB)
async def update_exam(
    project_id: int,
    exam_id: int,
    exam_update: exam_schema.ExamInDB,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Update exam details manually.
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Get exam
    exam = session.exec(
        select(exam_model.Exam)
        .where(exam_model.Exam.id == exam_id)
        .where(exam_model.Exam.project_id == project_id)
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with ID {exam_id} not found"
        )
    
    # Update exam fields
    update_data = exam_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(exam, key, value)
    
    exam.updated_at = datetime.utcnow()
    
    session.add(exam)
    session.commit()
    session.refresh(exam)
    
    return exam

@router.put('/{project_id}/exams/{exam_id}/evaluate', response_model=exam_schema.ExamInDB)
async def re_evaluate_exam(
    project_id: int,
    exam_id: int,
    background_tasks: BackgroundTasks,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep,
    evaluation_type: exam_schema.EvaluationTypeEnum = exam_schema.EvaluationTypeEnum.full
):
    """
    Trigger re-evaluation of a specific exam.
    
    Args:
        project_id: ID of the project
        exam_id: ID of the exam to re-evaluate
        background_tasks: FastAPI background tasks
        current_user: Current authenticated user
        session: Database session
        evaluation_type: Type of evaluation to perform (full or ai_only)
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Get exam
    exam = session.exec(
        select(exam_model.Exam)
        .where(exam_model.Exam.id == exam_id)
        .where(exam_model.Exam.project_id == project_id)
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with ID {exam_id} not found"
        )
    
    # Reset exam status
    exam.status = exam_schema.StatusEnum.pending
    
    # Reset fields based on evaluation type
    if evaluation_type == exam_schema.EvaluationTypeEnum.full:
        # Reset all fields for full evaluation
        exam.student_id = None
        exam.student_section = None
        exam.student_seat = None
        exam.student_room = None
        exam.exam_extracted_text = None
    
    # Reset AI evaluation fields for both types
    exam.exam_improved_text = None
    exam.scoring_justification = None
    exam.score_task_completion = None
    exam.score_organization = None
    exam.score_style_language_expression = None
    exam.score_structural_variety_accuracy = None
    exam.ai_comment = None
    exam.updated_at = datetime.utcnow()
    
    session.add(exam)
    session.commit()
    
    # Queue re-evaluation
    background_tasks.add_task(
        background_helper.process_exam_batch,
        session,
        project_id,
        [exam_id],
        evaluation_type
    )
    
    return exam

@router.delete('/{project_id}/exams/{exam_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
    project_id: int,
    exam_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    """
    Delete a specific exam and its associated image from S3.
    """
    # Verify project exists and user has access
    project = session.exec(
        select(project_model.Project)
        .where(project_model.Project.id == project_id)
        .where(project_model.Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Get exam
    exam = session.exec(
        select(exam_model.Exam)
        .where(exam_model.Exam.id == exam_id)
        .where(exam_model.Exam.project_id == project_id)
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with ID {exam_id} not found"
        )
    
    try:
        # Delete exam image from S3
        if exam.exam_image_url:
            await aws_s3.delete_exam_image(exam.exam_image_url)
        
        # Delete exam from database
        session.delete(exam)
        session.commit()
        
    except Exception as e:
        logger.error(f"Failed to delete exam {exam_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete exam"
        )
    
    return None 