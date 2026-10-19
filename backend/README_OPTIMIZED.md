# SafeCity Intelligence - Optimized Backend

This is a production-grade FastAPI backend redesigned for performance, stability, and scalability.

## Key Enhancements

- **Architecture**: Clean layered architecture (API -> Service -> Model).
- **Non-blocking ML**: Heavy ML inference moved to `ThreadPoolExecutor` and triggered via `BackgroundTasks` for immediate API response.
- **Performance**:
    - **Caching**: TTL-based in-memory caching for traffic data.
    - **Concurrency**: Async/Await throughout the pipeline.
    - **Optimization**: GZip compression, connection pooling, and multi-worker Gunicorn setup.
- **Stability**:
    - **Global Error Handling**: Consistent JSON error responses.
    - **Structured Logging**: JSON logs (prod) and colored logs (dev) using `structlog`.
    - **Request Tracking**: Unique Request ID for every call.
- **Database**: 
    - Indexes on key columns (lat, lng, status, timestamp).
    - Support for connection pooling.
- **Resilience**: Async retry logic with exponential backoff for external APIs.

## Folder Structure

```text
app/
├── api/             # API Router & Endpoints
├── core/            # Config, Database, Logging
├── middleware/      # Custom Middlewares (Logging, Auth, CORS)
├── models/          # SQLAlchemy Models
├── schemas/         # Pydantic Schemas (Request/Response)
├── services/        # Business Logic (ML, Traffic)
├── utils/           # Helper utilities (HTTP, Geo)
└── main.py          # App Entry point
```

## How to Run

### Local Development

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Access Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Production (Docker)

1. **Build Image**:
   ```bash
   docker build -t safecity-backend .
   ```

2. **Run Container**:
   ```bash
   docker run -p 8000:8000 safecity-backend
   ```

## Configuration

Environment variables can be set in a `.env` file:

- `DATABASE_URL`: Database connection string.
- `SECRET_KEY`: Security key for encryption/JWT.
- `ENVIRONMENT`: `development` or `production`.
- `TRAFFIC_UPDATE_INTERVAL`: Cache TTL for traffic data.
