from flask import Blueprint, request, jsonify, send_file
from app.services.document_service import DocumentService
from app.services.storage_service import StorageService
from app.extensions import db, celery
from werkzeug.utils import secure_filename
from app.middleware.file_validation import validate_files
import os
from app.utils.error_handling import handle_errors
from app.middleware.auth import require_auth
from flask_cors import cross_origin
from typing import List

bp = Blueprint('api', __name__, url_prefix='/api')

storage_service = StorageService()
document_service = DocumentService(storage_service)

@bp.route('/health', methods=['GET'])
@handle_errors
def health_check():
    """
    Health Check Endpoint
    ---
    responses:
      200:
        description: Service is healthy
      500:
        description: Service is unhealthy
    """
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        
        # Check Redis connection
        redis_health = celery.backend.client.ping()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'redis': 'connected' if redis_health else 'error'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@bp.route('/documents/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        filename = secure_filename(file.filename)
        document = document_service.create_document(filename)
        storage_service.upload_file(file, f"{document.id}/{filename}")
        return jsonify({'message': 'File uploaded successfully', 'document_id': document.id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/documents/process', methods=['POST'])
def process_document():
    data = request.json
    if not data or 'operation' not in data or 'document_id' not in data:
        return jsonify({'error': 'Operation and document_id are required'}), 400
    
    try:
        result = document_service.process_document(data['document_id'], data['operation'])
        return jsonify(result), 202
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    try:
        status = document_service.get_job_status(job_id)
        return jsonify(status), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/documents/merge', methods=['POST'])
@handle_errors
@validate_files(max_files=10)
@cross_origin()
def merge_documents():
    """
    Merge PDF Documents
    ---
    parameters:
      - in: formData
        name: files[]
        type: array
        items:
          type: file
        required: true
        description: PDF files to merge
    responses:
      202:
        description: Merge process started
      400:
        description: Invalid request
      500:
        description: Processing error
    """
    try:
        files = request.files.getlist('files[]')
        
        # Save uploaded files
        pdf_paths = []
        for file in files:
            path = storage_service.upload_file(file, file.filename)
            pdf_paths.append(path)
        
        # Create merged document record
        document = document_service.create_document('merged.pdf')
        
        # Queue merge task
        result = document_service.process_document(
            document.id, 
            'merge_pdfs',
            {'pdf_paths': pdf_paths, 'output_filename': f"{document.id}_merged.pdf"}
        )
        
        return jsonify({
            'message': 'Merge process started',
            'job_id': result['job_id'],
            'document_id': document.id
        }), 202
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'code': 'PROCESSING_ERROR'
        }), 500

@bp.route('/documents/download/<filename>', methods=['GET'])
def download_document(filename):
    try:
        file_path = storage_service.get_file_path(filename)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@bp.route('/documents', methods=['GET'])
def get_documents():
    try:
        documents = Document.query.order_by(Document.created_at.desc()).all()
        return jsonify([doc.to_dict() for doc in documents])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'error': 'File too large',
        'code': 'FILE_TOO_LARGE'
    }), 413 