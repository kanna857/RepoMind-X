import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from ..config import settings
from ..security import validate_safe_path, validate_file_size, is_secret_file
from ..ast_engine import count_ast_nodes

router = APIRouter(prefix="/api/repositories", tags=["Repositories"])

REPOSITORIES = [
    {
        "id": "checkout-service",
        "name": "acme/checkout-service",
        "status": "ONLINE",
        "indexing_progress": 100,
        "ast_nodes": 48291,
        "test_coverage": 94.2,
        "branch": "main",
        "commit": "7f3a8b2",
        "description": "Core checkout pricing and promotion calculation service",
        "is_local_demo": True,
    },
    {
        "id": "auth-service",
        "name": "acme/auth-service",
        "status": "ONLINE",
        "indexing_progress": 100,
        "ast_nodes": 31402,
        "test_coverage": 91.8,
        "branch": "main",
        "commit": "a1290c4",
        "description": "Authentication tokens, OAuth sessions, and credential verification",
        "is_local_demo": False,
    },
    {
        "id": "payment-gateway",
        "name": "acme/payment-gateway",
        "status": "INDEXING",
        "indexing_progress": 84,
        "ast_nodes": 62810,
        "test_coverage": 88.4,
        "branch": "develop",
        "commit": "ef94101",
        "description": "PCI-compliant payment processor dispatch pipeline",
        "is_local_demo": False,
    },
]

def build_file_tree(base_dir: Path, current_dir: Path = None) -> list[dict]:
    if current_dir is None:
        current_dir = base_dir
        
    items = []
    try:
        entries = sorted(os.scandir(current_dir), key=lambda e: (not e.is_dir(), e.name.lower()))
    except Exception:
        return items

    for entry in entries:
        if entry.name in [".git", "__pycache__", ".pytest_cache", ".venv"]:
            continue
        if is_secret_file(entry.name):
            continue
            
        rel_path = str(Path(entry.path).relative_to(base_dir)).replace("\\", "/")
        
        if entry.is_dir():
            children = build_file_tree(base_dir, Path(entry.path))
            items.append({
                "name": entry.name,
                "path": rel_path,
                "is_dir": True,
                "children": children,
            })
        else:
            size = entry.stat().st_size
            items.append({
                "name": entry.name,
                "path": rel_path,
                "is_dir": False,
                "size_bytes": size,
                "extension": Path(entry.name).suffix.lower(),
            })
            
    return items

@router.get("")
def list_repositories():
    return REPOSITORIES

@router.get("/{repo_id}/tree")
def get_repo_tree(repo_id: str):
    if repo_id != "checkout-service":
        return {"id": repo_id, "tree": []}
    
    tree = build_file_tree(settings.demo_repo_dir)
    return {"id": repo_id, "tree": tree}

@router.get("/{repo_id}/file")
def get_repo_file(repo_id: str, path: str = Query(..., description="Relative file path")):
    if repo_id != "checkout-service":
        raise HTTPException(status_code=404, detail="Repository not found or remote")
    
    # Path traversal protection
    safe_path = validate_safe_path(settings.demo_repo_dir, path)
    
    if not safe_path.exists() or not safe_path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
        
    if is_secret_file(safe_path.name):
        raise HTTPException(status_code=403, detail="Access to sensitive/secret file is denied")
        
    validate_file_size(safe_path)
    
    content = safe_path.read_text(encoding="utf-8", errors="replace")
    ast_count = count_ast_nodes(content) if safe_path.suffix == ".py" else 0
    
    return {
        "repo_id": repo_id,
        "path": path,
        "filename": safe_path.name,
        "size_bytes": len(content.encode("utf-8")),
        "line_count": len(content.splitlines()),
        "ast_nodes": ast_count,
        "content": content,
    }

@router.get("/{repo_id}/search")
def search_repo(repo_id: str, q: str = Query(..., min_length=1)):
    if repo_id != "checkout-service":
        return {"repo_id": repo_id, "query": q, "results": []}
        
    results = []
    query_lower = q.lower()
    
    for root, _, files in os.walk(settings.demo_repo_dir):
        for file in files:
            if is_secret_file(file) or file.endswith(".pyc"):
                continue
            fpath = Path(root) / file
            rel_path = str(fpath.relative_to(settings.demo_repo_dir)).replace("\\", "/")
            
            # File name match
            if query_lower in file.lower():
                results.append({
                    "path": rel_path,
                    "line": 1,
                    "type": "filename",
                    "text": file
                })
                
            # Content match if text file
            if fpath.stat().st_size < settings.max_file_size_bytes:
                try:
                    lines = fpath.read_text(encoding="utf-8", errors="ignore").splitlines()
                    for idx, line in enumerate(lines, start=1):
                        if query_lower in line.lower():
                            results.append({
                                "path": rel_path,
                                "line": idx,
                                "type": "code",
                                "text": line.strip()[:120]
                            })
                            if len(results) > 50:
                                break
                except Exception:
                    continue
                    
    return {"repo_id": repo_id, "query": q, "results": results[:50]}

@router.get("/{repo_id}/stats")
def get_repo_stats(repo_id: str):
    repo = next((r for r in REPOSITORIES if r["id"] == repo_id), None)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    return {
        "id": repo["id"],
        "name": repo["name"],
        "ast_nodes": repo["ast_nodes"],
        "test_coverage": repo["test_coverage"],
        "status": repo["status"],
        "branch": repo["branch"],
        "commit": repo["commit"],
        "total_files": 42 if repo_id == "checkout-service" else 30,
    }
