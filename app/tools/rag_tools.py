from typing import Dict, Any
from app.rag.retriever import KnowledgeRetriever

def tool_search_event_policy(query: str, top_k: int = 3) -> Dict[str, Any]:
    retriever = KnowledgeRetriever.get_instance(docs_dir="documents")
    results = retriever.search(query, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "relevant_chunks": results
    }
