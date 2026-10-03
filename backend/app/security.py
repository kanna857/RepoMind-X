import os
import re
from pathlib import Path
from fnmatch import fnmatch
from fastapi import HTTPException
from .config import settings

FORBIDDEN_CHARS = [";", "&", "|", "`", "$", ">", "<", "\n", "\r"]

def validate_safe_path(base_dir: Path, relative_path: str) -> Path:
    """
    Prevents path traversal attacks by validating that the resolved path
    is strictly a descendant of base_dir.
    """
    if not relative_path:
        return base_dir
    
    # Check for null bytes or illegal directory escapes
    if "\0" in relative_path:
        raise HTTPException(status_code=400, detail="Invalid path characters detected")
    
    # Normalize separators
    clean_rel = relative_path.replace("\\", "/").lstrip("/")
    
    target_path = (base_dir / clean_rel).resolve()
    base_resolved = base_dir.resolve()
    
    # Must be within base_resolved
    try:
        target_path.relative_to(base_resolved)
    except ValueError:
        raise HTTPException(
            status_code=403,
            detail=f"Security violation: Access outside workspace boundary is blocked ({relative_path})"
        )
    
    return target_path

def is_secret_file(filename: str) -> bool:
    """Checks if a file matches secret patterns (.env, keys, credentials)."""
    basename = Path(filename).name.lower()
    for pattern in settings.secret_patterns:
        if fnmatch(basename, pattern.lower()):
            return True
    return False

def validate_file_size(file_path: Path, max_bytes: int = None) -> None:
    """Checks that file size is within safety limits."""
    if max_bytes is None:
        max_bytes = settings.max_file_size_bytes
    if file_path.exists() and file_path.is_file():
        size = file_path.stat().st_size
        if size > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum safe inspection limit ({size} bytes > {max_bytes} bytes)"
            )

def validate_test_command(command: str) -> list[str]:
    """
    Validates that a requested test command is strictly allowlisted
    and contains no shell injection vectors.
    """
    normalized = command.strip()
    
    for char in FORBIDDEN_CHARS:
        if char in normalized:
            raise HTTPException(
                status_code=400,
                detail=f"Security alert: Dangerous shell control character '{char}' detected in test command"
            )
            
    # Check against allowlisted prefixes
    matched = False
    for allowed in settings.allowlisted_commands:
        if normalized == allowed or normalized.startswith(allowed + " "):
            matched = True
            break
            
    if not matched:
        raise HTTPException(
            status_code=403,
            detail=f"Execution rejected: Command '{normalized}' is not in allowlist. Only approved pytest commands are permitted."
        )
        
    return normalized.split()
