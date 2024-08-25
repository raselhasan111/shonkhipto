from sqlalchemy import Column, Integer, String
from database import Base

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    short_code = Column(String, index=True)
