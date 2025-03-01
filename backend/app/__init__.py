from flask import Flask
from flask_cors import CORS
from app.extensions import db, celery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Configure the Flask application
    app.config.from_object('config.config.Config')
    
    # Initialize CORS with proper configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": os.getenv('CORS_ORIGINS', 'http://localhost').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize Celery
    celery.conf.update(app.config)
    
    # Register blueprints
    from app.routes import api
    app.register_blueprint(api.bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 