import io
import logging
from typing import List, Tuple
from PIL import Image, ImageFilter
import numpy as np
import pymupdf
from fastapi import HTTPException, status

# Configure logging
logger = logging.getLogger(__name__)

def preprocess_image(image_pil: Image.Image) -> Image.Image:
    """Preprocess Image to remove red marks, enhance text for OCR."""

    x = image_pil.copy()

    # Convert the image to an RGB array for color manipulation
    x = np.array(x)

    # Normalize each channel to follow a normal distribution
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

async def process_pdf(pdf_file: io.BytesIO) -> List[Tuple[int, bytes]]:
    """
    Process a PDF file and convert each page to an optimized image.
    
    Args:
        pdf_file: PDF file as BytesIO object
        
    Returns:
        List of tuples containing (page_number, image_bytes)
        
    Raises:
        HTTPException: If PDF processing fails
    """
    try:
        # Open PDF document
        doc = pymupdf.open(stream=pdf_file.read(), filetype="pdf")
        
        if doc.page_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file is empty"
            )
        
        processed_pages = []
        
        # Process each page
        for page_num in range(doc.page_count):
            try:
                # Get page
                page = doc[page_num]
                
                # Convert page to image with high resolution
                pix = page.get_pixmap(matrix=pymupdf.Matrix(300/72, 300/72))  # 300 DPI
                
                # Convert to PIL Image
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                # Preprocess the image
                processed_img = preprocess_image(img)
                
                # Convert to bytes
                img_byte_arr = io.BytesIO()
                processed_img.save(img_byte_arr, format='JPEG', quality=95, optimize=True)
                img_byte_arr = img_byte_arr.getvalue()
                
                processed_pages.append((page_num + 1, img_byte_arr))
                
            except Exception as e:
                logger.error(f"Failed to process page {page_num + 1}: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process page {page_num + 1}: {str(e)}"
                )
        
        return processed_pages
        
    except Exception as e:
        logger.error(f"Failed to process PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}"
        )
    finally:
        if 'doc' in locals():
            doc.close() 