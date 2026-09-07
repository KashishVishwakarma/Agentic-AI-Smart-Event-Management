from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from app.agent.state import AgentState
from app.agent.tools import search_events, check_venue_availability, register_participant, search_event_policy
from app.core.config import settings

SYSTEM_INSTRUCTION = """You are the AI Event Assistant.
You can browse events, inspect venue openings, process event registrations, and review policy information.
Operational Rules:
1. When a user asks to register, take their user_id from the context and execute `register_participant`.
2. Do not fabricate schedules, venues, or policy facts. Use the tools.
3. For policy or cancellation questions, invoke `search_event_policy`.
"""

tools = [search_events, check_venue_availability, register_participant, search_event_policy]
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=settings.OPENAI_API_KEY).bind_tools(tools)

async def agent_node(state: AgentState):
    messages = state["messages"]
    if not messages or messages[0].type != "system":
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}] + list(messages)
    response = await llm.ainvoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END

tool_node = ToolNode(tools)

graph_workflow = StateGraph(AgentState)
graph_workflow.add_node("agent", agent_node)
graph_workflow.add_node("tools", tool_node)

graph_workflow.set_entry_point("agent")
graph_workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
graph_workflow.add_edge("tools", "agent")

compiled_agent = graph_workflow.compile()
