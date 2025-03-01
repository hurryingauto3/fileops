from celery import shared_task
from app.services.pdf_service import PdfService
from app.services.document_service import DocumentService
from app.models.document import Document
import os

@shared_task(bind=True)
def process_document(self, document_id: str, operation: str, params: dict = None):
    """
    Process a document with progress updates
    """
    try:
        document = Document.query.get(document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")

        if operation == 'merge_pdfs':
            # Update status
            document.status = 'processing'
            document.save()

            # Process files
            pdf_service = PdfService()
            output_path = pdf_service.merge_pdfs(
                params.get('pdf_paths', []),
                params.get('output_filename')
            )

            # Update document with result
            document.url = output_path
            document.status = 'completed'
            document.save()

            # Clean up input files
            for pdf_path in params.get('pdf_paths', []):
                try:
                    os.remove(pdf_path)
                except Exception:
                    pass  # Ignore cleanup errors

            return {'status': 'completed', 'progress': 100}

        else:
            raise ValueError(f"Unknown operation: {operation}")

    except Exception as e:
        # Update document status on error
        if document:
            document.status = 'failed'
            document.save()
        
        # Re-raise as task failure
        raise Exception(f"Processing failed: {str(e)}") 