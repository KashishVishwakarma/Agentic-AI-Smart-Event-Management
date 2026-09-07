from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_openai import OpenAIEmbeddings
from app.models.entities import KnowledgeChunk
from app.core.config import settings

def get_embeddings():
    return OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=settings.OPENAI_API_KEY)

async def retrieve_policies(session: AsyncSession, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    embeddings = get_embeddings()
    query_vector = await embeddings.aembed_query(query)
    
    distance = KnowledgeChunk.embedding.cosine_distance(query_vector)
    stmt = (
        select(KnowledgeChunk.content, KnowledgeChunk.source, distance.label("dist"))
        .order_by(distance)
        .limit(top_k)
    )
    result = await session.execute(stmt)
    
    hits = []
    for content, source, dist in result.all():
        if dist < 0.65:
            hits.append({"content": content, "source": source, "relevance": round(1 - float(dist), 4)})
    return hits
