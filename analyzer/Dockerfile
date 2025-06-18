FROM python:3.12-slim
WORKDIR /app

COPY analyzer/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install -e .

EXPOSE $PORT
CMD ["sh", "-c", "gunicorn api.app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 100"]