from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Event, Venue, Registration, EventStatus

async def search_events(db: AsyncSession, query_text: str = ""):
    stmt = select(Event).where(Event.status == EventStatus.SCHEDULED)
    if query_text:
        stmt = stmt.where(Event.title.ilike(f"%{query_text}%"))
    result = await db.execute(stmt)
    return result.scalars().all()

async def check_venue_availability(db: AsyncSession, venue_id: int, start_time: datetime, end_time: datetime) -> bool:
    stmt = select(Event).where(
        Event.venue_id == venue_id,
        Event.status == EventStatus.SCHEDULED,
        Event.start_time < end_time,
        Event.end_time > start_time
    )
    result = await db.execute(stmt)
    return len(result.scalars().all()) == 0

async def register_user_for_event(db: AsyncSession, user_id: int, event_id: int) -> dict:
    event = await db.get(Event, event_id)
    if not event or event.status != EventStatus.SCHEDULED:
        return {"success": False, "error": "Event unavailable or does not exist."}
    
    reg_stmt = select(Registration).where(Registration.event_id == event_id)
    reg_res = await db.execute(reg_stmt)
    all_regs = reg_res.scalars().all()
    
    if len(all_regs) >= event.capacity:
        return {"success": False, "error": "Event capacity reached."}
        
    for r in all_regs:
        if r.user_id == user_id and r.status == "CONFIRMED":
            return {"success": False, "error": "User already registered."}
            
    registration = Registration(user_id=user_id, event_id=event_id, status="CONFIRMED")
    db.add(registration)
    await db.commit()
    return {"success": True, "registration_id": registration.id, "event_title": event.title}
