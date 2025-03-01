from typing import List, Optional
from app.models.document import Document
from app.services.storage_service import StorageService
from app.utils.error_handling import NotFoundError, ValidationError
from app.extensions import db, celery

class DocumentService:
    def __init__(self, storage_service: StorageService):
        self.storage_service = storage_service
    
    def create_document(self, name: str, file_type: str, size: int) -> Document:
        """Create a new document."""
        document = Document(
            name=name,
            type=file_type,
            size=size,
            status='pending'
        )
        return document.save()
    
    def get_document(self, document_id: str) -> Document:
        """Get a document by ID."""
        document = Document.get_by_id(document_id)
        if not document:
            raise NotFoundError(f"Document {document_id} not found")
        return document
    
    def list_documents(self, user_id: Optional[str] = None) -> List[Document]:
        """List all documents, optionally filtered by user."""
        query = Document.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        return query.order_by(Document.created_at.desc()).all()
    
    def process_document(self, document_id: str, operation: str, params: dict = None) -> dict:
        """Queue a document processing task."""
        document = self.get_document(document_id)
        
        # Validate operation
        if operation not in ['merge_pdfs', 'compress_pdf', 'convert_to_pdf']:
            raise ValidationError(f"Unsupported operation: {operation}")
        
        # Queue the task
        task = celery.send_task(
            f'tasks.{operation}',
            args=[document_id],
            kwargs=params or {}
        )
        
        return {
            'job_id': task.id,
            'status': 'pending'
        }

    @staticmethod
    def get_job_status(job_id: str) -> dict:
        task = celery.AsyncResult(job_id)
        return {
            'job_id': job_id,
            'status': task.status,
            'progress': task.info.get('progress', 0) if task.info else 0
        } 