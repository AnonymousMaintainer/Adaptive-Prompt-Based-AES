from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from ...core import database, security
from ...schemas import vector_schema
from ...models import exam_model
from ...schemas import user_schema, exam_schema
from ...core.vectordb import chroma_client, essay_collection, build_collection

import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/vector',
    tags=['vector']
)


@router.get("/documents")
def list_collection_documents(
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    # Only admin users can access
    if current_user.role != user_schema.RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource."
        )
    collection = chroma_client.get_collection("essays")
    results = collection.get()
    
    return {
        "count": len(results["ids"]),
        "exam_ids": [int(doc_id) for doc_id in results["ids"]]
    }


@router.get("/overview", response_model=vector_schema.VectorExamStatusOverview)
def get_vector_exam_status_overview(
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    # Only admin users can access
    if current_user.role != user_schema.RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource."
        )

    statement = select(exam_model.Exam).where(exam_model.Exam.is_embedded == True)
    embedded_exams = session.exec(statement).all()

    embedded_metadata = [
        vector_schema.VectorExamMetadata(
            exam_id=e.id,
            student_id=e.student_id,
            project_id=e.project_id,
            score=e.score,
            created_at=e.created_at,
            is_embedded=True,
            source=e.source,
        )
        for e in embedded_exams
    ]

    # Fetch not embedded exams
    not_embedded_exams = session.exec(
        select(exam_model.Exam).where(exam_model.Exam.is_embedded == False)
    ).all()

    not_embedded_metadata = [
        vector_schema.VectorExamMetadata(
            exam_id=e.id,
            student_id=e.student_id,
            project_id=e.project_id,
            score=e.score,
            created_at=e.created_at,
            is_embedded=False,
            source=e.source,
        )
        for e in not_embedded_exams
    ]

    return vector_schema.VectorExamStatusOverview(
        embedded=vector_schema.VectorExamSummary(
            total=len(embedded_metadata),
            exams=embedded_metadata,
        ),
        not_embedded=vector_schema.VectorExamSummary(
            total=len(not_embedded_metadata),
            exams=not_embedded_metadata,
        ),
    )


@router.post("/embed/batch", response_model=vector_schema.EmbedBatchResponse)
def embed_batch_exams(
    request: vector_schema.EmbedBatchRequest,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    # Only admin users can access
    if current_user.role != user_schema.RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource."
        )

    results: List[vector_schema.EmbedResult] = []
    updated_exams = []

    for exam_id in request.exam_ids:
        exam = session.exec(select(exam_model.Exam).where(exam_model.Exam.id == exam_id)).first()

        if not exam:
            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.failed,
                detail="Not found"
            ))
            continue

        if not exam.exam_extracted_text:
            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.failed,
                detail="Missing extracted text"
            ))
            continue

        if exam.status != exam_schema.StatusEnum.processed:
            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.processed,
                detail="Exam is not processed"
            ))
            continue

        if exam.is_embedded and not request.overwrite:
            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.skipped,
                detail="Already embedded"
            ))
            continue

        metadata = {
            "score_task_completion": exam.score_task_completion,
            "score_organization": exam.score_organization,
            "score_style_language_expression": exam.score_style_language_expression,
            "score_structural_variety_accuracy": exam.score_structural_variety_accuracy,
        }

        try:
            build_collection(exam_id=exam.id, text=exam.exam_extracted_text, metadata=metadata)
            exam.is_embedded = True
            updated_exams.append(exam)

            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.embedded,
                detail="Success"
            ))

        except Exception as e:
            results.append(vector_schema.EmbedResult(
                exam_id=exam_id,
                status=vector_schema.EmbedStatusEnum.failed,
                detail=str(e)
            ))

        # Batch update
        for exam in updated_exams:
            session.add(exam)
        session.commit()


    return vector_schema.EmbedBatchResponse(results=results)


@router.delete("/delete/{exam_id}", status_code=200)
def delete_vector_by_exam_id(
    exam_id: int,
    current_user: security.UserDep = security.UserDep,
    session: database.SessionDep = database.SessionDep
):
    # Only admin users can access
    if current_user.role != user_schema.RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource."
        )

    # Lookup in SQL
    statement = select(exam_model.Exam).where(exam_model.Exam.id == exam_id)
    exam = session.exec(statement).first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if not exam.is_embedded:
        raise HTTPException(status_code=400, detail="Exam is not embedded")

    # Delete from ChromaDB
    try:
        essay_collection.delete(ids=[exam.id])
        exam.is_embedded = False
        exam.hashed_id = None
        session.add(exam)
        session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from ChromaDB: {e}")

    return {"message": f"Vector for exam {exam_id} deleted successfully from ChromaDB and SQL updated."}

