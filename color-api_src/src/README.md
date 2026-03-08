# Weather Color API

Small FastAPI service that returns a color scheme depending on:
- time of day (Morning/Midday/Night)
- day type (Weekday/Friday/Weekend)
- weather (Sunny/Rainy/Storm/Snow/Cloudy)

## Endpoints

- `GET /scheme` – builds a request from current weather + local time
- `POST /scheme` – provide a `ColorRequest` JSON body

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload
```

## Docker

### Docker Compose (recommended)

```bash
docker compose up --build
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

The MariaDB container is initialized with `docker/mariadb-init/*.sql`.

### Docker only (API)

If you already have a MariaDB instance running, you can build/run only the API:

```bash
docker build -t weather-color-api .

docker run --rm -p 8000:8000 \
  -e DB_HOST=127.0.0.1 -e DB_PORT=3306 \
  -e DB_USER=root -e DB_PASSWORD=my-secret-pw -e DB_NAME=colorschemes \
  weather-color-api
```
