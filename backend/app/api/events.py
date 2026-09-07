from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import uuid
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.entities import Event, User
from app.schemas.contracts import EventCreateReq, EventRes
from app.services.event_service import EventService

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("", response_model=EventRes, status_code=201)
async def create_event(req: EventCreateReq, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    return await EventService.create_event(
        db, req.title, req.start_time, req.end_time, req.venue_id, req.capacity, current_user.id, req.description
    )

@router.get("", response_model=List[EventRes])
async def search_events(
    query: Optional[str] = None,
    venue_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    stmt = select(Event).where(Event.status == "SCHEDULED")
    if query:
        stmt = stmt.where(Event.title.ilike(f"%{query}%"))
    if venue_id:
        stmt = stmt.where(Event.venue_id == venue_id)
    return (await db.execute(stmt)).scalars().all()

@router.get("/{event_id}", response_model=EventRes)
async def get_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.delete("/{event_id}")
async def cancel_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = "CANCELLED"
    await db.commit()
    return {"message": "Event cancelled"}
