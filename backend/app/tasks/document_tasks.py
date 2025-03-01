from celery import shared_task
from app.services.document_service import DocumentService
from app.services.storage_service import StorageService
from app.utils.error_handling import AppError
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_document(self, document_id: str, operation: str, params: dict = None):
    """Process a document with progress updates."""
    try:
        # Initialize services
        storage_service = StorageService()
        document_service = DocumentService(storage_service)
        
        # Get document
        document = document_service.get_document(document_id)
        document.status = 'processing'
        document.save()
        
        # Process based on operation type
        if operation == 'merge_pdfs':
            result = merge_pdfs(document, params or {})
        elif operation == 'compress_pdf':
            result = compress_pdf(document, params or {})
        else:
            raise AppError(f"Unsupported operation: {operation}")
        
        # Update document with result
        document.url = result['url']
        document.status = 'completed'
        document.save()
        
        return {'status': 'completed', 'progress': 100}
        
    except Exception as e:
        logger.error(f"Task failed: {str(e)}", exc_info=True)
        if document:
            document.status = 'failed'
            document.save()
        raise self.retry(exc=e) 