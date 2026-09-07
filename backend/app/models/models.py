import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class EventStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.USER)
    registrations = relationship("Registration", back_populates="user")

class Venue(Base):
    __tablename__ = "venues"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(255), nullable=False)
    events = relationship("Event", back_populates="venue")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.SCHEDULED)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    venue = relationship("Venue", back_populates="events")
    registrations = relationship("Registration", back_populates="event")

class Registration(Base):
    __tablename__ = "registrations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="CONFIRMED")
    
    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")

class PolicyDocument(Base):
    __tablename__ = "policy_documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=False)  # Stored as JSON float list for zero-dependency portability
