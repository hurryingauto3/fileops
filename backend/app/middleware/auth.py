from functools import wraps
from flask import request, jsonify
from app.utils.error_handling import AuthenticationError
import jwt
from app.config.config import BaseConfig

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            raise AuthenticationError('No authorization header')
            
        try:
            # Remove 'Bearer ' prefix
            token = auth_header.split(' ')[1]
            # Verify token
            payload = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=['HS256'])
            # Add user_id to request context
            request.user_id = payload['sub']
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            raise AuthenticationError('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationError('Invalid token')
            
    return decorated 