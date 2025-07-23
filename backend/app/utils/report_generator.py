from io import BytesIO
from typing import List
from PIL import Image
import fitz

from ..models.exam_model import Exam
from ..services import aws_s3

CSS_STYLE = """
    * { font-family: sans-serif; font-size: 12px; }
    h1 { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    h2 { font-size: 18px; font-weight: bold; margin-bottom: 6px; }
    h3 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
    p { font-size: 12px; line-height: 1.8; margin-bottom: 8px; }
    ul { margin-left: 20px; }
    li { margin-bottom: 2px; }
"""
RECT_START = (50, 50, 550, 750)


async def generate_exam_pdf(exams: List[Exam]) -> BytesIO:
    doc = fitz.open()
    image_page_number = 1

    for exam in exams:
        if not exam.exam_image_url:
            continue

        # Download and render image page
        image_key = exam.exam_image_url
        image_bytes = await aws_s3.download_image(image_key)

        if image_bytes:
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_stream = BytesIO()
            img.save(img_stream, format="PNG")
            img_stream.seek(0)

            # Add image page
            img_page = doc.new_page()
            img_page.insert_image(img_page.rect, stream=img_stream.getvalue())

        # Preprocess text fields to safely insert into HTML
        extracted_text = (exam.exam_extracted_text or "-").replace("\n", "<br>")
        improved_text = (exam.exam_improved_text or "-").replace("\n", "<br>")
        justification = (exam.scoring_justification or "-").replace("\n", "<br>")
        ai_comment = (exam.ai_comment or "-").replace("\n", "<br>")

        # Add report page
        html_content = f"""
        <h1>Page {image_page_number}</h1>
        <ul>
            <li><b>Student ID:</b> {exam.student_id or '-'}</li>
            <li><b>Section:</b> {exam.student_section or '-'} | 
                <b>Seat:</b> {exam.student_seat or '-'} | 
                <b>Room:</b> {exam.student_room or '-'}</li>
        </ul>

        <hr>

        <h2>Extracted Exam Text</h2>
        <p><i>{extracted_text}</i></p>

        <hr>

        <h2>Improved Text</h2>
        <p><i>{improved_text}</i></p>

        <hr>

        <h2>Scoring Justification</h2>
        <p>{justification}</p>

        <hr>

        <h2>Scores</h2>
        <ul>
            <li><b>Task Completion:</b> {exam.score_task_completion or '-'}</li>
            <li><b>Organization:</b> {exam.score_organization or '-'}</li>
            <li><b>Style & Expression:</b> {exam.score_style_language_expression or '-'}</li>
            <li><b>Variety & Accuracy:</b> {exam.score_structural_variety_accuracy or '-'}</li>
        </ul>

        <hr>

        <h2>AI Comment</h2>
        <p>{ai_comment}</p>
        """

        report_page = doc.new_page()
        report_page.insert_htmlbox(fitz.Rect(*RECT_START), html_content, css=CSS_STYLE)
        image_page_number += 1

    final_pdf = BytesIO()
    doc.save(final_pdf)
    doc.close()
    final_pdf.seek(0)
    return final_pdf