from fastapi import APIRouter
from ..config import settings
from ..ai_provider import get_ai_provider

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def get_health():
    provider = get_ai_provider()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.version,
        "ai_provider": provider.provider_name,
        "is_rule_based_fallback": getattr(provider, "is_fallback", False),
        "zero_outbound_telemetry": settings.zero_outbound_telemetry,
        "sandbox_isolation": "ephemeral_directory",
        "demo_repo_available": settings.demo_repo_dir.exists(),
    }
