
smart-event-management-backend/
├── .gitignore
├── .env.example
├── requirements.txt
├── Dockerfile
├── README.md
├── documents/
│   ├── event_policy.md
│   ├── registration_policy.md
│   ├── cancellation_policy.md
│   ├── venue_policy.md
│   └── faq.md
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_events.py
│   ├── test_registrations.py
│   └── test_agent.py
└── app/
    ├── __init__.py
    ├── main.py
    ├── core/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── security.py
    │   └── logging.py
    ├── db/
    │   ├── __init__.py
    │   ├── base.py
    │   └── session.py
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── venue.py
    │   ├── event.py
    │   ├── registration.py
    │   └── agent_log.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── venue.py
    │   ├── event.py
    │   ├── registration.py
    │   ├── chat.py
    │   └── agent_log.py
    ├── services/
    │   ├── __init__.py
    │   ├── auth_service.py
    │   ├── venue_service.py
    │   ├── event_service.py
    │   ├── registration_service.py
    │   └── observability_service.py
    ├── tools/
    │   ├── __init__.py
    │   ├── event_tools.py
    │   ├── venue_tools.py
    │   ├── registration_tools.py
    │   └── rag_tools.py
    ├── rag/
    │   ├── __init__.py
    │   ├── loader.py
    │   ├── chunker.py
    │   └── retriever.py
    ├── agent/
    │   ├── __init__.py
    │   ├── state.py
    │   ├── prompts.py
    │   ├── nodes.py
    │   └── graph.py
    └── api/
        ├── __init__.py
        ├── auth.py
        ├── venues.py
        ├── events.py
        ├── registrations.py
        ├── chat.py
        └── observability.py
