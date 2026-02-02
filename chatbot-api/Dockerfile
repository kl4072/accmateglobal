FROM python:3.11-slim

WORKDIR /api

COPY chatbot-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY chatbot-api/app/ app/

COPY index.html /frontend/index.html
COPY script.js /frontend/script.js
COPY styles.css /frontend/styles.css

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
