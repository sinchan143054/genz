import os
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app import auth

router = APIRouter()
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")

@router.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...), current_user=Depends(auth.get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid file")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid4().hex}_{file.filename}"
    dest_path = os.path.join(UPLOAD_DIR, name)
    contents = await file.read()
    with open(dest_path, "wb") as buffer:
        buffer.write(contents)
    return {"url": f"/uploads/{name}", "filename": file.filename}
