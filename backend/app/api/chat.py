import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User, AgentRun
from app.schemas.contracts import ChatReq, ChatRes
from app.agent.graph import compiled_agent

router = APIRouter(prefix="/api/chat", tags=["Agentic AI Chat"])

@router.post("", response_model=ChatRes)
async def chat_with_agent(
    req: ChatReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = req.session_id or str(uuid.uuid4())
    start_time = time.perf_counter()

    initial_state = {
        "messages": [HumanMessage(content=f"User ID: {str(current_user.id)}\nUser Query: {req.message}")],
        "user_id": str(current_user.id),
        "user_role": current_user.role,
        "actions_log": []
    }

    try:
        final_state = await compiled_agent.ainvoke(initial_state)
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        # Extract actions and LLM response
        actions = []
        for msg in final_state["messages"]:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    actions.append({"tool": tc["name"], "arguments": tc["args"]})

        reply_content = final_state["messages"][-1].content

        run_log = AgentRun(
            session_id=session_id,
            user_id=current_user.id,
            request_prompt=req.message,
            execution_steps=actions,
            final_response=reply_content,
            latency_ms=latency_ms
        )
        db.add(run_log)
        await db.commit()

        return ChatRes(
            session_id=session_id,
            response=reply_content,
            actions=actions,
            latency_ms=latency_ms
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")
