from datetime import datetime
from app.extensions import db
import uuid
from app.models.base import BaseModel

class Document(BaseModel):
    __tablename__ = 'documents'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    url = db.Column(db.String(500))
    type = db.Column(db.String(50))
    size = db.Column(db.Integer)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    metadata = db.Column(db.JSON)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'url': self.url,
            'type': self.type,
            'size': self.size,
            'metadata': self.metadata
        } 