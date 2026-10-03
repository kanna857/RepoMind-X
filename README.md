# RepoMind X 🧠

**Autonomous code investigation, patch synthesis, and verified sandbox execution engine.**

RepoMind X autonomously finds the root cause of bugs, generates mathematically-minimal patches, and proves they work inside cryptographically-audited, ephemeral sandboxes — before a single line reaches production.

---

## 🎬 Live Demo Flow (30 Seconds)

```
1. Open http://localhost:3000
2. Investigations → #418 → REPRODUCE BUG      (1 test fails)
3.                       → COLLECT EVIDENCE    (3 AST markers found)
4.                       → GENERATE HYPOTHESIS (94% confidence)
5. Patch Lab     → SYNTHESIZE PATCH            (1-line diff shown)
6. Verification  → RUN BASELINE               (7/8 fail → bug confirmed)
7.               → RUN WITH PATCH             (8/8 pass → FIXED ✅)
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Backend** | Python FastAPI, Pydantic, Uvicorn |
| **AI Provider** | Pluggable — Demo (deterministic), Ollama, or any OpenAI-compatible endpoint |
| **Testing** | pytest, isolated ephemeral sandbox execution |
| **Security** | Path-traversal protection, zero outbound telemetry, SHA-256 audit digests |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone
```bash
git clone https://github.com/kanna857/RepoMind-X.git
cd RepoMind-X
```

### 2. Backend
```bash
pip install fastapi uvicorn pydantic pytest
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev        # or: node ./node_modules/vite/bin/vite.js --port 3000
```

### 4. Open
```
http://localhost:3000
```

---

## 📁 Project Structure

```
RepoMind-X/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── config.py          # Security settings
│   │   ├── security.py        # Path-traversal protection
│   │   ├── ai_provider.py     # Pluggable AI / deterministic fallback
│   │   ├── ast_engine.py      # AST traversal engine
│   │   ├── sandbox.py         # Ephemeral sandbox execution
│   │   └── routes/
│   │       ├── health.py
│   │       ├── repos.py
│   │       ├── investigations.py
│   │       ├── patches.py
│   │       ├── verification.py
│   │       └── settings.py
│   └── demo_repo/
│       ├── src/core/pricing.py          # ← reproducible boundary bug (line 20)
│       └── tests/test_pricing_boundaries.py  # ← 8 tests, 1 intentionally fails
│
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── api.ts             # Typed API client
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   └── ui.tsx         # Shared design-system components
│       └── pages/
│           ├── Overview.tsx
│           ├── Investigations.tsx
│           ├── PatchLab.tsx
│           ├── Verification.tsx
│           ├── Repositories.tsx
│           └── Settings.tsx
│
└── README.md
```

---

## 🔐 Security Design

- **Zero outbound telemetry** — no data leaves the machine
- **Path traversal protection** — all file paths validated against allowlist
- **Ephemeral sandboxes** — patches applied to `tempfile.mkdtemp()` copies only
- **File size limits** — max 1 MB per file read
- **Command allowlist** — only `python`, `pytest` permitted in sandbox
- **SHA-256 audit digests** — every sandbox run is cryptographically signed

---

## 🤖 AI Provider Modes

| Mode | Config | Use Case |
|---|---|---|
| **Demo (Deterministic)** | No key needed | Hackathon demos, offline use |
| **Local Ollama** | Set URL + model name | Privacy-first local inference |
| **Custom OpenAI-compatible** | Set URL + API key | GPT-4o, Claude, Mistral, etc. |

Configure via **Settings** page or `PATCH /api/settings`.

---

## 🐛 The Demo Bug

`backend/demo_repo/src/core/pricing.py`, **line 20**:

```python
# BUG — strict > excludes exact threshold (100.00 → $0 discount)
if total > DISCOUNT_THRESHOLD:

# FIX — >= includes exact threshold (100.00 → $15.00 discount)
if total >= DISCOUNT_THRESHOLD:
```

`test_exact_threshold` in `tests/test_pricing_boundaries.py` catches this regression.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status + AI provider info |
| `GET` | `/api/repositories` | List connected repositories |
| `GET` | `/api/repositories/{id}/tree` | File tree |
| `GET` | `/api/repositories/{id}/file` | File content |
| `GET` | `/api/investigations` | List investigations |
| `POST` | `/api/investigations/{id}/reproduce` | Run bug reproduction |
| `POST` | `/api/investigations/{id}/evidence` | Collect AST evidence |
| `POST` | `/api/investigations/{id}/hypothesize` | Generate root-cause hypothesis |
| `POST` | `/api/patches/propose` | Synthesize minimal patch |
| `POST` | `/api/patches/validate` | Run pre-flight checks |
| `POST` | `/api/verification/run-sandbox` | Execute in isolated sandbox |
| `GET`  | `/api/settings` | Read AI provider config |
| `PATCH`| `/api/settings` | Update AI provider config |

Interactive docs: **http://127.0.0.1:8000/api/docs**

---

## 📜 License

MIT — built for the hackathon demo. See [LICENSE](LICENSE).
