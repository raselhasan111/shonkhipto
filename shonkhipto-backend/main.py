from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from sqlalchemy.exc import IntegrityError
from starlette import status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
from database import engine, get_db

app = FastAPI()
models.Base.metadata.create_all(bind=engine)


class URLBase(BaseModel):
    url: str = Field(min_length=1, max_length=512)
    short_code: str = Field(min_length=1, max_length=7)


class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(min_length=1, max_length=255)
    profile_image: HttpUrl = None  # Optional profile picture URL


class UserCreate(UserBase):
    password: str = Field(min_length=1, max_length=55)


class UserResponse(UserCreate):
    id: int

    class Config:
        orm_mode = True


pwd_context = CryptContext(schemas=['bcrypt'], deprecated='auto')


def get_password_hash(password):
    return pwd_context.hash(password)


async def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


async def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


@app.post("/shorten")
async def shorten_url(url: URLBase, db: Session = Depends(get_db)):
    try:
        db_url = models.URL(**url.model_dump())
        db.add(db_url)
        db.commit()
        db.refresh(db_url)
        return db_url
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Short code already exists")


@app.get("/shorten/{short_code}")
async def get_shortened_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")
    return db_url
