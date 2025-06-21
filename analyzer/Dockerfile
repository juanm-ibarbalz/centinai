FROM python:3.12-slim
WORKDIR /app

COPY src/requirements.txt .
RUN pip install -r requirements.txt

COPY src .

EXPOSE $PORT
CMD ["sh", "-c", "gunicorn api.app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 100"]