import uuid
from datetime import datetime
from typing import Optional
from langchain_core.tools import tool
from sqlalchemy import select, and_
from app.core.database import async_session_factory
from app.models.entities import Event, Venue
from app.services.event_service import EventService
from app.rag.retriever import retrieve_policies

@tool
async def search_events(query: Optional[str] = None, date: Optional[str] = None) -> str:
    """Search for available events by title keyword or ISO date (YYYY-MM-DD)."""
    async with async_session_factory() as session:
        filters = [Event.status == "SCHEDULED"]
        if query:
            filters.append(Event.title.ilike(f"%{query}%"))
        if date:
            day_start = datetime.fromisoformat(date).replace(hour=0, minute=0, second=0)
            day_end = datetime.fromisoformat(date).replace(hour=23, minute=59, second=59)
            filters.append(and_(Event.start_time >= day_start, Event.start_time <= day_end))
        
        results = (await session.execute(select(Event).where(and_(*filters)).limit(5))).scalars().all()
        if not results:
            return "No scheduled events found."
        
        return "\n".join([
            f"Event ID: {e.id} | Title: {e.title} | Time: {e.start_time.isoformat()} to {e.end_time.isoformat()} | Venue ID: {e.venue_id}"
            for e in results
        ])

@tool
async def check_venue_availability(venue_id: str, start_time: str, end_time: str) -> str:
    """Check if a venue is free for an ISO start and end datetime."""
    try:
        v_uuid = uuid.UUID(venue_id)
        st = datetime.fromisoformat(start_time)
        et = datetime.fromisoformat(end_time)
    except Exception as e:
        return f"Invalid parameters: {str(e)}"

    async with async_session_factory() as session:
        is_free = await EventService.is_venue_available(session, v_uuid, st, et)
        return "Venue is AVAILABLE." if is_free else "Venue is UNAVAILABLE (conflict detected)."

@tool
async def register_participant(event_id: str, user_id: str) -> str:
    """Register the user for an event given their user_id and event_id."""
    try:
        e_uuid = uuid.UUID(event_id)
        u_uuid = uuid.UUID(user_id)
    except Exception:
        return "Invalid UUID format for user_id or event_id."

    async with async_session_factory() as session:
        try:
            reg = await EventService.register_user(session, u_uuid, e_uuid)
            return f"Registration SUCCESS! ID: {reg.id}"
        except Exception as e:
            return f"Registration FAILED: {str(e)}"

@tool
async def search_event_policy(question: str) -> str:
    """Search event rules, registration guidelines, and cancellation policies."""
    async with async_session_factory() as session:
        chunks = await retrieve_policies(session, question)
        if not chunks:
            return "No policy documents matched the query."
        return "\n---\n".join([f"[{c['source']}] {c['content']}" for c in chunks])
