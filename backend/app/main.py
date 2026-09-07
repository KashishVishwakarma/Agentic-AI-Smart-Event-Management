from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base, AsyncSessionLocal
from app.api.chat import router as chat_router
from app.models.models import PolicyDocument
from app.rag.pipeline import get_encoder

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite/PostgreSQL schema on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed default policies if absent
    async with AsyncSessionLocal() as session:
        encoder = get_encoder()
        policy_text = "Cancellations made 48 hours prior to an event are eligible for a full refund. Same-day cancellations forfeit all fees."
        doc = PolicyDocument(
            title="General Cancellation Policy",
            content=policy_text,
            embedding=encoder.encode(policy_text).tolist()
        )
        session.add(doc)
        try:
            await session.commit()
        except Exception:
            await session.rollback()
    yield

app = FastAPI(title="Smart Event Management System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
