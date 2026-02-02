# AccMate Chatbot API

RAG-powered chatbot using FastAPI and Anthropic Claude to answer questions about AccMate's services.

## Setup

```bash
cd chatbot-api
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. The chat widget on the frontend connects to `POST /chat`.

## Adding Knowledge

Add markdown files to `app/documents/`. They are loaded and indexed on startup.
