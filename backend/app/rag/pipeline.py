import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.models import PolicyDocument

# Lazy-loaded singleton
_encoder_model = None

def get_encoder() -> SentenceTransformer:
    global _encoder_model
    if _encoder_model is None:
        _encoder_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _encoder_model

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

async def search_policy_knowledge(query: str, db: AsyncSession, top_k: int = 2) -> list[dict]:
    encoder = get_encoder()
    query_vector = encoder.encode(query).tolist()
    
    result = await db.execute(select(PolicyDocument))
    docs = result.scalars().all()
    if not docs:
        return []
    
    scored_docs = []
    q_vec = np.array(query_vector)
    for doc in docs:
        score = cosine_similarity(q_vec, np.array(doc.embedding))
        scored_docs.append({"score": score, "title": doc.title, "content": doc.content})
        
    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    return scored_docs[:top_k]
