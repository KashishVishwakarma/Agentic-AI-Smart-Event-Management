@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup vector extension & initial schemas
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)
    
    # Safely skip RAG indexing if OpenAI key is missing or invalid
    try:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY not in ["", "dummy-key"]:
            async with async_session_factory() as session:
                result = await session.execute(text("SELECT count(*) FROM knowledge_chunks;"))
                if result.scalar() == 0:
                    sample_policy = (
                        "Event Cancellation Policy: Registrations can be cancelled up to 24 hours prior to event start. "
                        "No-shows forfeit attendance rights for subsequent high-capacity events. "
                        "Venues adhere to standard fire code capacities; no over-admittance is allowed."
                    )
                    await index_text_document(session, sample_policy, "Default Policy Guide")
    except Exception as e:
        print(f"Skipping AI knowledge base indexing: {e}")

    yield
    await engine.dispose()
