from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.agent.graph import event_agent

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1  # In production, extracted from current authenticated user token

class ChatResponse(BaseModel):
    intent: str
    final_response: str
    tool_calls: list[str]

@router.post("/", response_model=ChatResponse)
async def chat_interaction(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    initial_state = {
        "user_id": payload.user_id,
        "message": payload.message,
        "intent": None,
        "tool_calls": [],
        "tool_results": [],
        "final_response": "",
        "db": db
    }
    result = await event_agent.ainvoke(initial_state)
    return ChatResponse(
        intent=result["intent"] or "UNKNOWN",
        final_response=result["final_response"],
        tool_calls=result["tool_calls"]
    )
