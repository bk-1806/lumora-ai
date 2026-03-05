import pdfplumber
from docx import Document
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from a uploaded PDF file."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text.strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from a uploaded DOCX file."""
    text = ""
    try:
        doc = Document(io.BytesIO(file_bytes))
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
    return text.strip()

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Routes the file to the correct extractor based on extension."""
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
