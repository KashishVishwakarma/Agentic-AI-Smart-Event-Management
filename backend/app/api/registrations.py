from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import uuid
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import Registration, User
from app.schemas.contracts import RegistrationRes
from app.services.event_service import EventService

router = APIRouter(prefix="/api", tags=["Registrations"])

@router.post("/events/{event_id}/register", response_model=RegistrationRes, status_code=201)
async def register_for_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await EventService.register_user(db, current_user.id, event_id)

@router.delete("/events/{event_id}/register")
async def cancel_registration(event_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Registration).where(and_(Registration.user_id == current_user.id, Registration.event_id == event_id))
    reg = (await db.execute(stmt)).scalars().first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg.status = "CANCELLED"
    await db.commit()
    return {"message": "Registration cancelled"}

@router.get("/registrations/me", response_model=List[RegistrationRes])
async def list_my_registrations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Registration).where(Registration.user_id == current_user.id)
    return (await db.execute(stmt)).scalars().all()
