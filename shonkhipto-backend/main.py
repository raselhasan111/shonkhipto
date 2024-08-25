from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from starlette import status
from sqlalchemy.orm import Session
import models
from database import engine, get_db

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class URLBase(BaseModel):
    url: str = Field(min_length=1, max_length=512)
    short_code: str = Field(min_length=1, max_length=7)

@app.post("/shorten")
async def shorten_url(url: URLBase, db: Session=Depends(get_db)):
    db_url = models.URL(**url.model_dump())
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url

@app.get("/shorten/{short_code}")
async def get_shortened_url(short_code: str, db: Session=Depends(get_db)):
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")
    return db_url