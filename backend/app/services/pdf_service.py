import os
from PyPDF2 import PdfMerger
from typing import List
from werkzeug.utils import secure_filename

class PdfService:
    @staticmethod
    def merge_pdfs(pdf_files: List[str], output_filename: str) -> str:
        """
        Merge multiple PDF files into one
        """
        merger = PdfMerger()
        
        try:
            # Add each PDF to the merger
            for pdf_file in pdf_files:
                merger.append(pdf_file)
            
            # Write the merged PDF
            output_path = f"storage/{secure_filename(output_filename)}"
            with open(output_path, "wb") as output_file:
                merger.write(output_file)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to merge PDFs: {str(e)}")
        finally:
            merger.close() 