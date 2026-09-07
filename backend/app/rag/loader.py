from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import KnowledgeChunk
from app.rag.retriever import get_embeddings

async def index_text_document(session: AsyncSession, text_content: str, source_name: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text_content)
    
    embeddings = get_embeddings()
    vectors = await embeddings.aembed_documents(chunks)
    
    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        kc = KnowledgeChunk(
            source=source_name,
            chunk_index=i,
            content=chunk,
            metadata_={"source": source_name, "chunk": i},
            embedding=vector
        )
        session.add(kc)
    await session.commit()
