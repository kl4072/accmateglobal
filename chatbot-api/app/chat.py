import os

import anthropic
from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from .rag import get_relevant_chunks

router = APIRouter()

SYSTEM_PROMPT_TEMPLATE = """You are AccMate's helpful assistant. Answer questions about AccMate's accounting services using the context below. Be concise and friendly. If the context doesn't cover the question, say you're not sure and suggest contacting AccMate directly.

Context:
{context}"""


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return JSONResponse(
            status_code=500,
            content={"error": "ANTHROPIC_API_KEY is not configured"},
        )

    chunks = get_relevant_chunks(req.message)
    context = "\n\n".join(chunks) if chunks else "No specific information found."

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(context=context)

    messages = []
    for msg in req.history[-10:]:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": req.message})

    client = anthropic.Anthropic(api_key=api_key)

    async def generate():
        try:
            with client.messages.stream(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {text}\n\n"
            yield "data: [DONE]\n\n"
        except anthropic.AuthenticationError:
            yield "data: [ERROR] Invalid API key.\n\n"
        except Exception as e:
            yield f"data: [ERROR] {e}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
