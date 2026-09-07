from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class UserRegisterReq(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[str] = "USER"

class UserLoginReq(BaseModel):
    email: EmailStr
    password: str

class UserRes(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    created_at: datetime
    model_config = {"from_attributes": True}

class TokenRes(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRes

class VenueCreateReq(BaseModel):
    name: str = Field(..., max_length=150)
    location: str = Field(..., max_length=255)
    capacity: int = Field(..., gt=0)

class VenueRes(BaseModel):
    id: uuid.UUID
    name: str
    location: str
    capacity: int
    model_config = {"from_attributes": True}

class EventCreateReq(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    venue_id: uuid.UUID
    capacity: int = Field(..., gt=0)

class EventRes(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    venue_id: uuid.UUID
    capacity: int
    status: str
    created_by: uuid.UUID
    model_config = {"from_attributes": True}

class RegistrationRes(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    registered_at: datetime
    status: str
    model_config = {"from_attributes": True}

class ChatReq(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None

class ChatRes(BaseModel):
    session_id: str
    response: str
    actions: List[Dict[str, Any]]
    latency_ms: int
