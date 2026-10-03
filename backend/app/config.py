import os
from pathlib import Path
from pydantic import BaseModel, Field

class Settings(BaseModel):
    app_name: str = "RepoMind X Core Engine"
    version: str = "0.9.4-dev"
    base_dir: Path = Path(__file__).resolve().parent.parent
    demo_repo_dir: Path = Path(__file__).resolve().parent.parent / "demo_repo"
    
    # Sandboxing & Security limits
    max_file_size_bytes: int = 512 * 1024  # 512 KB
    subprocess_timeout_seconds: int = 15
    allowlisted_commands: list[str] = [
        "pytest",
        "python -m pytest",
        "pytest -v",
        "pytest -v --tb=short",
        "pytest -v --tb=short tests/test_pricing_boundaries.py",
        "pytest tests/test_pricing_boundaries.py",
        "pytest tests/test_discounts.py",
        "pytest tests/",
    ]
    secret_patterns: list[str] = [
        ".env*",
        "*.pem",
        "*.key",
        "*.pkcs12",
        "id_rsa*",
        "id_ed25519*",
        "credentials*",
        "*.pfx",
        "*secret*",
    ]
    
    # AI Provider settings
    ai_provider: str = Field(default="deterministic", description="deterministic | ollama | custom")
    ollama_url: str = Field(default="http://localhost:11434", description="Ollama API base URL")
    ollama_model: str = Field(default="qwen2.5-coder:7b", description="Model identifier")
    custom_endpoint_url: str = Field(default="", description="Custom OpenAI-compatible endpoint")
    custom_api_key: str = Field(default="", description="Optional API key for external provider")
    zero_outbound_telemetry: bool = True

settings = Settings()
