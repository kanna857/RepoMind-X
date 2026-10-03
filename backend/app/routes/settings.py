from fastapi import APIRouter
from pydantic import BaseModel
from ..config import settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsUpdateRequest(BaseModel):
    ai_provider: str | None = None
    ollama_url: str | None = None
    ollama_model: str | None = None
    custom_endpoint_url: str | None = None
    custom_api_key: str | None = None

@router.get("")
def get_settings():
    return {
        "ai_provider": settings.ai_provider,
        "ollama_url": settings.ollama_url,
        "ollama_model": settings.ollama_model,
        "custom_endpoint_url": settings.custom_endpoint_url,
        "has_custom_api_key": bool(settings.custom_api_key),
        "zero_outbound_telemetry": settings.zero_outbound_telemetry,
        "subprocess_timeout_seconds": settings.subprocess_timeout_seconds,
        "max_file_size_bytes": settings.max_file_size_bytes,
        "allowlisted_commands": settings.allowlisted_commands,
    }

@router.patch("")
def update_settings(req: SettingsUpdateRequest):
    if req.ai_provider is not None:
        settings.ai_provider = req.ai_provider
    if req.ollama_url is not None:
        settings.ollama_url = req.ollama_url
    if req.ollama_model is not None:
        settings.ollama_model = req.ollama_model
    if req.custom_endpoint_url is not None:
        settings.custom_endpoint_url = req.custom_endpoint_url
    if req.custom_api_key is not None:
        settings.custom_api_key = req.custom_api_key
    return {"status": "updated", "ai_provider": settings.ai_provider}
