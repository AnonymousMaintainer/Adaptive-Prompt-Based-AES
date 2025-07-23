## CULI Backend (FastAPI)

This is the **backend service** for the CULI project, powered by [FastAPI](https://fastapi.tiangolo.com). It handles API requests, authentication, essay ingestion, AI-based scoring, and integration with vector search and databases.

---

## 🛠 Getting Started

### 📦 Install dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ Python 3.12 is required

---

### ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory. Example:

```env
ENV=dev
BASE_BACKEND_URL=http://localhost:8000
FRONTEND_HOST=http://localhost:3000
BACKEND_CORS_ORIGINS=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost/dbname
CHROMA_COLLECTION_NAME=essay_collection
```
## 🔧 Running the Server

### Local Development (Auto-reload)

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> Visit Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🐳 Run with Docker

```bash
docker build -t culi-backend .
docker run -p 8000:8000 --env-file .env culi-backend
```

---

### 🐳 Run with Docker Compose

You can also run the backend (and other services like the database) using Docker Compose:

```bash
docker compose up --build
```

Make sure your `docker-compose.yml` is properly configured and includes the correct `.env` path.

---
