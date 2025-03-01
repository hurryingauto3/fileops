from functools import wraps
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_files(max_files=10):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Check if files are present
            if 'files[]' not in request.files:
                return jsonify({
                    'error': 'No files provided',
                    'code': 'NO_FILES'
                }), 400

            files = request.files.getlist('files[]')
            
            # Check number of files
            if len(files) > max_files:
                return jsonify({
                    'error': f'Too many files. Maximum allowed is {max_files}',
                    'code': 'TOO_MANY_FILES'
                }), 400

            # Validate each file
            for file in files:
                if file.filename == '':
                    return jsonify({
                        'error': 'Empty filename detected',
                        'code': 'EMPTY_FILENAME'
                    }), 400

                if not allowed_file(file.filename):
                    return jsonify({
                        'error': 'Invalid file type. Only PDF files are allowed',
                        'code': 'INVALID_FILE_TYPE',
                        'filename': file.filename
                    }), 400

                # Check file size
                file.seek(0, os.SEEK_END)
                size = file.tell()
                file.seek(0)
                
                if size > MAX_FILE_SIZE:
                    return jsonify({
                        'error': f'File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB',
                        'code': 'FILE_TOO_LARGE',
                        'filename': file.filename
                    }), 400

            return f(*args, **kwargs)
        return wrapped
    return decorator 