from fastapi import APIRouter
from sqlmodel import select

from ...core import database, security
from ...models import exam_model
from ...schemas import stat_schema

router = APIRouter(
    prefix='/stats',
    tags=['stats']
)

@router.get("/project/all", response_model=stat_schema.ExamStatsResponse)
async def get_exam_stats_all_projects(
    current_user: security.UserDep,
    session: database.SessionDep,
) -> stat_schema.ExamStatsResponse:
    """
    Get exam statistics for all projects of the current teacher.
    """
    user_id = current_user.id

    exams = session.exec(
        select(exam_model.Exam).where(exam_model.Exam.user_id == user_id)
    ).all()

    total_exams = 0
    pending_exams = 0
    completed_exams = 0
    score_distribution = [0] * 10

    for exam in exams:
        total_exams += 1

        if exam.status == "pending":
            pending_exams += 1
        elif exam.status == "processed":
            completed_exams += 1

        if exam.score is not None:
            bucket = min(int(exam.score), 9)
            score_distribution[bucket] += 1

    return stat_schema.ExamStatsResponse(
        total_exams=total_exams,
        pending_exams=pending_exams,
        completed_exams=completed_exams,
        score_distribution=score_distribution,
    )