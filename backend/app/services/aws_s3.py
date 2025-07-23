import logging
from typing import BinaryIO
from urllib.parse import urljoin
from typing import Optional

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from ..core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

async def upload_exam_image(
    file: BinaryIO,
    user_id: int,
    project_id: int,
    exam_id: int,
    page_number: int
) -> str:
    """
    Upload an exam image to S3.
    
    Args:
        file: The file object to upload
        user_id: The ID of the user uploading the exam
        project_id: The ID of the project
        exam_id: The ID of the exam
        page_number: The page number in the exam
        
    Returns:
        str: The S3 key of the uploaded file
        
    Raises:
        HTTPException: If the upload fails
    """
    try:
        key = f"{settings.S3_EXAM_PREFIX}/user_{user_id}/project_{project_id}/exam_{exam_id}/page_{page_number}.jpg"
        
        # Upload the file
        s3_client.upload_fileobj(
            file,
            settings.S3_BUCKET_NAME,
            key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )
        
        logger.info(f"Successfully uploaded exam image to S3: {key}")
        return key
        
    except ClientError as e:
        logger.error(f"Failed to upload exam image to S3: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload exam image"
        )


def generate_presigned_url(key: str) -> str:
    """
    Generate a presigned URL for accessing an S3 object.
    
    Args:
        key: The S3 key of the object
        
    Returns:
        str: The presigned URL
        
    Raises:
        HTTPException: If URL generation fails
    """
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.S3_BUCKET_NAME,
                'Key': key
            },
            ExpiresIn=settings.S3_URL_EXPIRATION
        )
        return url
        
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate access URL for exam image"
        )


async def delete_exam_image(key: str) -> None:
    """
    Delete an exam image from S3.
    
    Args:
        key: The S3 key of the object to delete
        
    Raises:
        HTTPException: If deletion fails
    """
    try:
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key
        )
        logger.info(f"Successfully deleted exam image from S3: {key}")
        
    except ClientError as e:
        logger.error(f"Failed to delete exam image from S3: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete exam image"
        )


async def delete_project_exams(user_id: int, project_id: int) -> None:
    """
    Delete all exam images for a project.
    
    Args:
        user_id: The ID of the user who owns the project
        project_id: The ID of the project
        
    Raises:
        HTTPException: If deletion fails
    """
    try:
        # List all objects with the project prefix
        prefix = f"{settings.S3_EXAM_PREFIX}/user_{user_id}/project_{project_id}/"
        
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(
            Bucket=settings.S3_BUCKET_NAME,
            Prefix=prefix
        )
        
        # Delete all objects
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    s3_client.delete_object(
                        Bucket=settings.S3_BUCKET_NAME,
                        Key=obj['Key']
                    )
        
        logger.info(f"Successfully deleted all exam images for project {project_id}")
        
    except ClientError as e:
        logger.error(f"Failed to delete project exam images: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project exam images"
        )


async def download_image( key: str) -> Optional[bytes]:
    """
    Download an image from the S3 bucket.
    """
    try:
        response = s3_client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        body = response['Body'].read()
        logger.info(
            f"Downloaded image '{key}' from bucket '{settings.S3_BUCKET_NAME}'.")
        return body
    
    except ClientError as e:
        logger.error(f"Error downloading image '{key}': {e}")
        return None
