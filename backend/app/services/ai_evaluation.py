import base64
import logging
import time
from typing import Any, BinaryIO
from io import BytesIO
from textwrap import dedent
from fastapi import HTTPException, status

import instructor
import numpy as np
from openai import OpenAI
from PIL import Image, ImageFilter
from pydantic import BaseModel, Field
from sqlmodel import select

from ..core.config import settings
from ..models import task_model
from ..schemas import exam_schema

# Configure logging
logger = logging.getLogger(__name__)

# Initialize OpenAI client with instructor
client = instructor.from_openai(OpenAI(api_key=settings.OPENAI_API_KEY))



def preprocess_image(image_pil: Image.Image) -> Image.Image:
    """
    Preprocess Image to remove red marks, enhance text for OCR.
    
    Args:
        image_pil: PIL Image to preprocess
        
    Returns:
        Image.Image: Preprocessed image optimized for OCR
    """
    x = image_pil.copy()

    # Convert the image to an RGB array for color manipulation
    x = np.array(x)
    
    # Check if the image is already grayscale (2D array)
    if len(x.shape) == 2:
        # Image is already grayscale, just normalize it
        mean = np.mean(x)
        std = np.std(x)
        if std > 0:  # Avoid division by zero
            x = (x - mean) / std  # Standard normal distribution
    else:
        # Image is RGB, normalize each channel
        for i in range(3):  # Iterate over R, G, B channels
            channel = x[:, :, i]
            mean = np.mean(channel)
            std = np.std(channel)
            if std > 0:  # Avoid division by zero
                x[:, :, i] = (channel - mean) / std  # Standard normal distribution

    # Scale normalized values back to 0-255 range
    x = np.clip((x - x.min()) / (x.max() - x.min()) * 255, 0, 255).astype(np.uint8)

    # Convert back to PIL image
    # Ensure the data type is uint8 before converting back to PIL Image
    x = x.astype(np.uint8)
    x = Image.fromarray(x)

    # Convert to grayscale to reduce complexity and enhance text contrast
    x = x.convert("L")

    # Apply binary thresholding to make text stand out (binarization)
    x = x.point(lambda x: 0 if x < 128 else 255, '1')

    # Invert colors (flip black and white)
    x = x.point(lambda val: 255 - val)

    # Apply noise reduction filter
    x = x.filter(ImageFilter.MedianFilter(size=3))

    return x


def PIL_to_base64(image: Image.Image) -> str:
    """
    Convert PIL Image to base64 string.
    
    Args:
        image: PIL Image to convert
        
    Returns:
        str: Base64 encoded image string
    """
    # Save the preprocessed image to a BytesIO buffer in PNG format
    buffer = BytesIO()
    image.save(buffer, format="PNG")

    # Get base64 encoded image
    image = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return image


class ExamModel(BaseModel):
    """Model for structured exam metadata extracted from OCR."""
    student_id: str = Field(..., description="A unique identifier for the student on the top right")
    section: str
    seat: str
    room: str 
    extracted_exam_text: str = Field(..., description="The extracted text content of the student's exam from the image.")
    confidence_score: float = Field(..., description="The confidence score 0-1 of the extracted text. A lower score indicates higher noise levels or poor handwriting in the exam.")


class StructuredAnalyzeResponse(BaseModel):
    scoring_justification: str 
    score_task_completion: float
    score_organization: float
    score_style_language_expression: float
    score_structural_variety_accuracy: float
    improved_text: str 
    ai_comment: str


def retry_inference(func: Any, *args: Any, retries: int = settings.OPENAI_MAX_RETRIES, delay: int = settings.OPENAI_RETRY_DELAY, **kwargs: Any) -> Any:
    """
    Retry mechanism for AI inference calls.
    
    Args:
        func: The function to retry
        *args: Positional arguments for the function
        retries: Number of retry attempts
        delay: Delay between retries in seconds
        **kwargs: Keyword arguments for the function
        
    Returns:
        The result of the function call
        
    Raises:
        Exception: If all retries fail
    """
    for attempt in range(retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt < retries - 1:
                logger.warning(f"Error in AI inference: {str(e)}. Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logger.error(f"All retries failed for AI inference: {str(e)}")
                raise


async def extract_exam_metadata(image_data: BinaryIO, session: Any) -> ExamModel:
    """
    Extract structured metadata from exam image using OCR.
    
    Args:
        image_data: The exam image file
        session: Database session
        
    Returns:
        ExamMetadata: Structured exam metadata
        
    Raises:
        HTTPException: If OCR extraction fails
    """
    try:
        # Convert image to PIL Image
        image_pil = Image.open(image_data)
        
        # Preprocess image for better OCR
        processed_image = preprocess_image(image_pil)
        
        # Convert to base64
        base64_image = PIL_to_base64(processed_image)
        
        # OCR system prompt
        system_prompt = """You are an Exam OCR system. You will be given an exam image and your task is to extract exam email text from the scanned student exam."""
        
        # Extract structured data
        exam_metadata = retry_inference(
            client.chat.completions.create,
            model=settings.OCR_MODEL_NAME,
            response_model=ExamModel,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}},
                ]},
            ],
        )
        
        return exam_metadata
        
    except Exception as e:
        logger.error(f"Failed to extract exam metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract exam metadata from image"
        )


async def evaluate_exam(
    retrieved_exam: str,
    exam_text: str,
    task_id: int,
    session: Any
) -> StructuredAnalyzeResponse:
    """
    Evaluate exam text using AI based on task rubrics.
    
    Args:
        exam_text: The extracted exam text
        task_id: ID of the task containing rubrics
        session: Database session
        
    Returns:
        StructuredAnalyzeResponse: AI evaluation results
        
    Raises:
        HTTPException: If evaluation fails
    """
    try:
        # Get task details from database
        task = session.exec(select(task_model.Task).where(task_model.Task.id == task_id)).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Construct evaluation prompt
        system_prompt = dedent(f"""
            {task.rubrics}
            {task.student_instruction}
            {task.example_evaluation}
            {retrieved_exam}
        """)

        evaluation = retry_inference(
            client.chat.completions.create,
            model=settings.AI_MODEL_NAME,
            response_model=StructuredAnalyzeResponse,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": exam_text},
            ],
        )
        
        return evaluation
        
    except Exception as e:
        logger.error(f"Failed to evaluate exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate exam"
        ) 