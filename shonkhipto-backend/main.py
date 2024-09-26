import json
import os
import jwt

from fastapi import FastAPI, HTTPException, Depends
from fastapi.params import Query
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from requests import request
from sqlalchemy.exc import IntegrityError
from starlette import status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from starlette.responses import RedirectResponse
from dotenv import load_dotenv

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


pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


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


load_dotenv()

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
GOOGLE_SCOPES = os.getenv('GOOGLE_SCOPES').split(',')

from google_auth_oauthlib.flow import Flow


def get_google_flow():
    return Flow.from_client_config({
        'web': {
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uris': [GOOGLE_REDIRECT_URI],
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token'
        }
    }, scopes=GOOGLE_SCOPES, redirect_uri=GOOGLE_REDIRECT_URI)


@app.get("/login/google")
async def login_with_google():
    flow = get_google_flow()
    authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
    return RedirectResponse(url=authorization_url)


@app.get("/oauth/google/redirect")
async def google_oauth_redirect(code: str = Query(...)):
    flow = get_google_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    if 'token' not in credentials:
        raise HTTPException(status_code=401, detail='User not authenticated')

    if credentials and credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    id_token = credentials.id_token
    print("id_token", id_token)

    if not id_token:
        raise HTTPException(status_code=401, detail='ID token not available')

    decoded_id_token = jwt.decode(id_token, options={'verify_signature', False})
    user_email = decoded_id_token.get('email')
    user_name = decoded_id_token.get('name')

    print(user_name, user_email)

    return RedirectResponse(url="http://localhost:3000/login/google/redirect{token}")


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
