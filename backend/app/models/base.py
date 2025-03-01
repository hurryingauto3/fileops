from datetime import datetime
from app.extensions import db
import uuid

class BaseModel(db.Model):
    """Base model class that includes CRUD convenience methods."""
    
    __abstract__ = True
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def save(self):
        """Save the current instance."""
        db.session.add(self)
        db.session.commit()
        return self
        
    def delete(self):
        """Remove the current instance."""
        db.session.delete(self)
        db.session.commit()
        
    @classmethod
    def get_by_id(cls, id):
        """Get instance by ID."""
        return cls.query.get(id) 