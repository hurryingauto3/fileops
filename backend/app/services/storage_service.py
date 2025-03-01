import os
from pathlib import Path
from werkzeug.utils import secure_filename
from typing import BinaryIO, List

class StorageService:
    def __init__(self):
        self.storage_path = Path('storage')
        self.storage_path.mkdir(exist_ok=True)

    def upload_file(self, file: BinaryIO, filename: str) -> str:
        """Upload a file to local storage"""
        try:
            safe_filename = secure_filename(filename)
            file_path = self.storage_path / safe_filename
            file.save(file_path)
            return str(file_path)
        except Exception as e:
            raise Exception(f"Failed to save file: {str(e)}")

    def get_file_path(self, filename: str) -> str:
        """Get local file path"""
        return str(self.storage_path / secure_filename(filename))

    def get_download_url(self, filename: str) -> str:
        """Get local file URL"""
        return f"/api/documents/download/{filename}" 