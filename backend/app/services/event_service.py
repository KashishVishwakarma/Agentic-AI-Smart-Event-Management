import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.entities import Event, Venue, Registration

class EventService:
    @staticmethod
    async def is_venue_available(
        session: AsyncSession, venue_id: uuid.UUID, start: datetime, end: datetime, exclude_event_id: Optional[uuid.UUID] = None
    ) -> bool:
        stmt = select(Event).where(
            and_(
                Event.venue_id == venue_id,
                Event.status != "CANCELLED",
                Event.start_time < end,
                Event.end_time > start
            )
        )
        if exclude_event_id:
            stmt = stmt.where(Event.id != exclude_event_id)
        result = await session.execute(stmt)
        return result.scalars().first() is None

    @staticmethod
    async def create_event(
        session: AsyncSession, title: str, start: datetime, end: datetime, venue_id: uuid.UUID, capacity: int, user_id: uuid.UUID, description: Optional[str] = None
    ) -> Event:
        venue = await session.get(Venue, venue_id)
        if not venue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        if capacity > venue.capacity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Capacity exceeds venue limit of {venue.capacity}")
        
        available = await EventService.is_venue_available(session, venue_id, start, end)
        if not available:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Venue is already occupied during this time window")

        event = Event(
            title=title, description=description, start_time=start, end_time=end,
            venue_id=venue_id, capacity=capacity, created_by=user_id, status="SCHEDULED"
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    @staticmethod
    async def register_user(session: AsyncSession, user_id: uuid.UUID, event_id: uuid.UUID) -> Registration:
        # Atomic lock against capacity overflows
        event = (await session.execute(select(Event).where(Event.id == event_id).with_for_update())).scalars().first()
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        if event.status != "SCHEDULED":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot register for an inactive or completed event")

        count_stmt = select(func.count(Registration.id)).where(
            and_(Registration.event_id == event_id, Registration.status == "CONFIRMED")
        )
        current_count = (await session.execute(count_stmt)).scalar() or 0
        if current_count >= event.capacity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event is at maximum capacity")

        existing = (await session.execute(
            select(Registration).where(and_(Registration.user_id == user_id, Registration.event_id == event_id))
        )).scalars().first()

        if existing:
            if existing.status == "CONFIRMED":
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already registered")
            existing.status = "CONFIRMED"
            existing.registered_at = datetime.utcnow()
            await session.commit()
            await session.refresh(existing)
            return existing

        registration = Registration(user_id=user_id, event_id=event_id, status="CONFIRMED")
        session.add(registration)
        await session.commit()
        await session.refresh(registration)
        return registration
