from typing import Type, Dict, Any
from functools import wraps
from flask import jsonify
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AppError(Exception):
    def __init__(self, message: str, code: str = 'INTERNAL_ERROR', status: int = 500):
        self.message = message
        self.code = code
        self.status = status
        super().__init__(self.message)

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 'VALIDATION_ERROR', 400)

class NotFoundError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 'NOT_FOUND', 404)

class AuthenticationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 'AUTHENTICATION_ERROR', 401)

def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except AppError as e:
            logger.error(f"Application error: {str(e)}")
            return jsonify({
                'error': e.message,
                'code': e.code
            }), e.status
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'error': 'An unexpected error occurred',
                'code': 'INTERNAL_ERROR'
            }), 500
    return wrapper 