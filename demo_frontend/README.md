# Web Services Project Frontend

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

Frontend runs on `http://localhost:5173`.

## Environment variables

```env
VITE_USER_API_BASE=http://localhost:3001/users
VITE_COLOR_API_BASE=http://localhost:3003
VITE_MATCHMAKING_WS_URL=ws://localhost:8080
```
