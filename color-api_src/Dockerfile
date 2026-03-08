FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for mariadb connector
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

COPY /src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./

EXPOSE 3003

CMD ["sh", "-c", "python -m persistence.fill_database && uvicorn main:app --host 0.0.0.0 --port $APP_PORT"]
