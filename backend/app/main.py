from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import health, repos, investigations, patches, verification, settings as settings_router

app = FastAPI(
    title="RepoMind X API",
    description="Autonomous code investigation, patch synthesis, and verified sandbox execution engine.",
    version="0.9.4-dev",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(repos.router)
app.include_router(investigations.router)
app.include_router(patches.router)
app.include_router(verification.router)
app.include_router(settings_router.router)

@app.get("/")
def root():
    return {
        "name": "RepoMind X",
        "version": "0.9.4-dev",
        "docs": "/api/docs",
        "health": "/api/health",
    }
