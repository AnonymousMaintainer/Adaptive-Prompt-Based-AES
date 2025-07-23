from typing import List
from io import StringIO
import logging
import csv

from app.models.exam_model import Exam

logger = logging.getLogger(__name__)


async def generate_csv(exams: List[Exam]) -> StringIO:
    """
    Generate a CSV report for a list of exams.

    Args:
        exams (List[Exam]): A list of processed exam objects.

    Returns:
        StringIO: A file-like object containing the CSV content.
    """
    output = StringIO()
    writer = csv.writer(output)

    try:
        # Header row
        writer.writerow([
            "Exam ID", "Student ID", "Section", "Seat", "Room",
            "Page", "Score - Task Completion", "Score - Organization",
            "Score - Style & Expression", "Score - Variety & Accuracy",
            "Scoring Justification", "AI Comment", "Created At"
        ])
    
        for exam in exams:
            writer.writerow([
                exam.id,
                exam.student_id or "-",
                exam.student_section or "-",
                exam.student_seat or "-",
                exam.student_room or "-",
                exam.page,
                exam.score_task_completion or "",
                exam.score_organization or "",
                exam.score_style_language_expression or "",
                exam.score_structural_variety_accuracy or "",
                (exam.scoring_justification or "-").replace('"', "'"),
                (exam.ai_comment or "-").replace('"', "'"),
                exam.created_at.strftime("%Y-%m-%d %H:%M:%S") if exam.created_at else ""
            ])

        logger.info(f"✅ CSV generation successful for {len(exams)} exams.")
    except Exception as e:
        logger.error(f"❌ CSV generation failed: {e}")
        raise

    output.seek(0)
    return output