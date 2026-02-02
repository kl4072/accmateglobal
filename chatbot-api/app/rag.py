import os
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DOCUMENTS_DIR = Path(__file__).parent / "documents"

_chunks: list[str] = []
_vectorizer: TfidfVectorizer | None = None
_tfidf_matrix = None


def _split_into_chunks(text: str, chunk_size: int = 500) -> list[str]:
    paragraphs = text.split("\n\n")
    chunks = []
    current = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 1 > chunk_size and current:
            chunks.append(current)
            current = para
        else:
            current = f"{current}\n{para}" if current else para
    if current:
        chunks.append(current)
    return chunks


def load_documents() -> None:
    global _chunks, _vectorizer, _tfidf_matrix
    _chunks = []
    for file in DOCUMENTS_DIR.glob("*.md"):
        text = file.read_text(encoding="utf-8")
        _chunks.extend(_split_into_chunks(text))

    if not _chunks:
        return

    _vectorizer = TfidfVectorizer(stop_words="english")
    _tfidf_matrix = _vectorizer.fit_transform(_chunks)


def get_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
    if not _chunks or _vectorizer is None or _tfidf_matrix is None:
        return []

    query_vec = _vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, _tfidf_matrix).flatten()
    top_indices = similarities.argsort()[-top_k:][::-1]
    return [_chunks[i] for i in top_indices if similarities[i] > 0]
