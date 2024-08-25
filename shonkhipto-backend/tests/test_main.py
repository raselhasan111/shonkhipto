import pytest
from fastapi.testclient import TestClient

import models
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, DB_URL, get_db

# Setup test database
engine = create_engine(DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Override the get_db dependency to use the test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function")
def test_url():
    db = TestingSessionLocal()
    new_url = models.URL(url="https://www.google.com", short_code="goo")
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    yield new_url
    db.delete(new_url)
    db.commit()
    db.close()

@pytest.fixture(scope="function", autouse=True)
def clean_database():
    db = TestingSessionLocal()
    db.query(models.URL).delete()
    db.commit()
    db.close()

# Test cases
def test_shorten_url():
    url_data = {"url": "https://www.google.com", "short_code": "goo"}
    response = client.post("/shorten", json=url_data)
    assert response.status_code == 200
    created_url = response.json()
    assert created_url["url"] == "https://www.google.com"
    assert created_url["short_code"] == "goo"
    assert "id" in created_url  # Ensure the 'id' is present

def test_get_shortened_url(test_url):
    response = client.get("/shorten/{test_url.short_code}")
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == "https://www.google.com"
    assert data["short_code"] == test_url.short_code
    assert data["id"] == test_url.id

