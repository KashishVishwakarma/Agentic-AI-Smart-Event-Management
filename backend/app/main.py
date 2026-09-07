from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, async_session_factory
from app.api import auth, venues, events, registrations, chat
from app.rag.loader import index_text_document

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup vector extension & initial schemas
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)
    
    # Ingest default policy sample if knowledge empty
    async with async_session_factory() as session:
        result = await session.execute(text("SELECT count(*) FROM knowledge_chunks;"))
        if result.scalar() == 0:
            sample_policy = (
                "Event Cancellation Policy: Registrations can be cancelled up to 24 hours prior to event start. "
                "No-shows forfeit attendance rights for subsequent high-capacity events. "
                "Venues adhere to standard fire code capacities; no over-admittance is allowed."
            )
            await index_text_document(session, sample_policy, "Default Policy Guide")

    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Agentic AI Smart Event Management System Backend",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(venues.router)
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(chat.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "event-management-api"}
