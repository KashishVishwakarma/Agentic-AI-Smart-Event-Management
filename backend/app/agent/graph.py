import re
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.event_service import search_events, register_user_for_event
from app.rag.pipeline import search_policy_knowledge

class AgentState(TypedDict):
    user_id: int
    message: str
    intent: Optional[str]
    tool_calls: List[str]
    tool_results: List[Dict[str, Any]]
    final_response: str
    db: AsyncSession

async def classify_and_plan(state: AgentState) -> AgentState:
    text = state["message"].lower()
    calls = []
    
    if any(k in text for k in ["policy", "rule", "faq", "cancel policy", "refund"]):
        intent = "KNOWLEDGE_QUERY"
        calls.append("search_event_policy")
    elif "register" in text:
        intent = "REGISTER_EVENT"
        calls.extend(["search_events", "register_participant"])
    elif any(k in text for k in ["find", "search", "events", "list"]):
        intent = "SEARCH_EVENT"
        calls.append("search_events")
    else:
        intent = "GENERAL_QUERY"
        
    state["intent"] = intent
    state["tool_calls"] = calls
    state["tool_results"] = []
    return state

async def execute_tools(state: AgentState) -> AgentState:
    db = state["db"]
    results = []
    
    for tool in state["tool_calls"]:
        if tool == "search_event_policy":
            res = await search_policy_knowledge(state["message"], db)
            results.append({"tool": tool, "data": res})
        elif tool == "search_events":
            # Extract keywords or pass bare message
            clean_query = re.sub(r"(find|search|register|me|for|an|event)", "", state["message"], flags=re.I).strip()
            events = await search_events(db, clean_query)
            serialized = [{"id": e.id, "title": e.title, "capacity": e.capacity} for e in events]
            results.append({"tool": tool, "data": serialized})
        elif tool == "register_participant":
            # Try to infer event from previous search result or default to first match
            event_id = None
            for item in results:
                if item["tool"] == "search_events" and item["data"]:
                    event_id = item["data"][0]["id"]
                    break
            if event_id:
                reg_res = await register_user_for_event(db, state["user_id"], event_id)
                results.append({"tool": tool, "data": reg_res})
            else:
                results.append({"tool": tool, "data": {"success": False, "error": "No matching event found to register."}})

    state["tool_results"] = results
    return state

async def formulate_response(state: AgentState) -> AgentState:
    results = {item["tool"]: item["data"] for item in state["tool_results"]}
    
    if "search_event_policy" in results:
        top_doc = results["search_event_policy"]
        if top_doc:
            state["final_response"] = f"According to event policies: {top_doc[0]['content']}"
        else:
            state["final_response"] = "I could not locate policy documentation matching your inquiry."
            
    elif "register_participant" in results:
        reg_info = results["register_participant"]
        if reg_info.get("success"):
            state["final_response"] = f"Success! You have been registered for {reg_info.get('event_title')}."
        else:
            state["final_response"] = f"Unable to complete registration: {reg_info.get('error')}"
            
    elif "search_events" in results:
        events = results["search_events"]
        if events:
            titles = ", ".join([f"{e['title']} (ID: {e['id']})" for e in events])
            state["final_response"] = f"I found the following scheduled events: {titles}."
        else:
            state["final_response"] = "No matching events were found for your query."
    else:
        state["final_response"] = "How can I assist with your event management or registration today?"
        
    return state

# Compile graph
workflow = StateGraph(AgentState)
workflow.add_node("planner", classify_and_plan)
workflow.add_node("executor", execute_tools)
workflow.add_node("formulator", formulate_response)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "executor")
workflow.add_edge("executor", "formulator")
workflow.add_edge("formulator", END)

event_agent = workflow.compile()
