# WMS–SAP Validation Project — Handoff Summary (Session 13)
> Use this document to brief Claude in a new chat. Paste it in full at the start.
> This document supersedes all previous handoff files.

---

## Who You Are
- **Name:** Eithan (Stephan Katz — same person)
- **Background:** Python developer, beginner JavaScript/JSX/React
- **OS:** macOS
- **IDE:** PyCharm Professional
- **Python:** 3.11 (venv at `.venv/`)
- **Node.js:** v24.13.1 / npm 11.8.0

---

## Project Overview

A **SAP ↔ WMS interface validation system**. SAP sends JSON payloads to a Warehouse Management System (WMS). Each payload has an `INTERFACE_NAME` field identifying which of 40 active interface types it belongs to. The system validates every payload against a two-layer JSON Schema:

- **Layer 1 (Firewall):** Catalogue-wide field constraints — 325 known fields, each with type and `maxLength`. Applies to every payload regardless of interface. Now includes `array` and `object` types for fields like `ITEMS` and `CONTACT_PERSONS`.
- **Layer 2 (App Check):** Required fields, `minLength`, `pattern` (date/time formats), `enum` values, and full object/array schemas per interface.

---

## Complete Folder Structure

```
wms_validator/                          ← project root
├── .venv/                              ← Python 3.11 virtual environment
├── backend/
│   ├── main.py                         ← FastAPI entry point (runs on port 8001)
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py                   ← Pydantic request/response shapes
│   │   ├── auth_router.py              ← Auth endpoints (renamed from router.py)
│   │   └── service.py                  ← Business logic (hashing, JWT, DB queries)
│   └── schema/
│       ├── __init__.py
│       └── schema_router.py            ← GET /api/schema (renamed from router.py)
├── backend/generate/
│   ├── generate_common_schema.py       ← Reads schema_data.json → writes common_schema.json
│   └── upload_schema_to_mongo.py       ← Pushes common_schema.json → MongoDB
├── services/
│   ├── common_paths.py                 ← PROJECT_ROOT and DATA_DIR path constants
│   └── mongo_store.py                  ← MongoStore singleton client (see below)
├── user_management/
│   ├── create_users_collection.py      ← Creates users collection + indexes (run once)
│   └── seed_admin_user.py              ← Creates first admin user (run once)
├── data/
│   ├── schema_data.json                ← Master source data (from Excel parser)
│   ├── common_schema.json              ← Generated JSON Schema (current production)
│   ├── common_schema_v2.json           ← Enriched schema with array/object types (PENDING promotion)
│   └── schemas.xlsx                    ← Original Excel source
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     ← Full React app: auth screens + validator
│   │   └── main.jsx                    ← React entry point (never edit)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── enrich_schema_v2.py                 ← Uploads common_schema_v2.json → Atlas schemas_v2 collection
├── promote_v2.py                       ← Renames schemas→schemas_backup, schemas_v2→schemas
├── rollback_to_backup.py               ← Restores schemas from schemas_backup
└── requirements.txt
```

> **Important:** `services/` lives inside `backend/`. Python import fix:
> `sys.path.insert(0, str(Path(__file__).resolve().parent))` in `main.py`
> `sys.path.insert(0, str(Path(__file__).resolve().parents[1]))` in `auth/service.py` and `schema/schema_router.py`

---

## Port Map

| Service | Port | Command |
|---------|------|---------|
| React dev server (Vite) | 5173 | `npm run dev` (in `frontend/`) |
| FastAPI backend | 8001 | `wms-api` |
| HB_V2 app (other project) | 8000 | auto-starts on login — do not use 8000 |

---

## Shell Alias (in `~/.zshrc`)

```bash
alias wms-api="PYTHONPATH=/Users/eithan/opt/dev/wms_validator \
  /Users/eithan/opt/dev/wms_validator/.venv/bin/uvicorn \
  backend.main:app --reload --port 8001"
```

---

## MongoDB — Two Environments

### Atlas (production — currently active)
```
ATLAS_URI=mongodb+srv://stephankatz_db_user:<password>@ac-wewfk5q.28qr4ey.mongodb.net/wms_validator
```
Set in `~/.zshrc` as `ATLAS_URI`. Cluster: `ac-wewfk5q.28qr4ey.mongodb.net`, 3-node replica set, MongoDB 8.0.19.

### Local (fallback)
`mongodb://localhost:27017` — used automatically if `ATLAS_URI` is not set.

### Collections

| Database | Collection | Purpose |
|----------|-----------|---------|
| `wms_validator` | `schemas` | Live production schema (`_id: "common_schema"`) |
| `wms_validator` | `schemas_v2` | Staging — enriched schema (PENDING — not yet uploaded) |
| `wms_validator` | `schemas_backup` | Created by `promote_v2.py` before promotion |
| `wms_validator` | `users` | User accounts with bcrypt-hashed passwords |
| `wms_validator` | `binat` | MoM collection |

### Schema storage pattern
```python
# Writing
document = {"_id": "common_schema", "data": json.dumps(schema, ensure_ascii=False)}
col.replace_one({"_id": "common_schema"}, document, upsert=True)

# Reading
doc = col.find_one({"_id": "common_schema"})
schema = json.loads(doc["data"])
```
> Stored as JSON **string** to avoid MongoDB misinterpreting `$schema`, `$id`, `$defs` keys.

---

## mongo_store.py — Singleton Pattern (CRITICAL)

The MongoClient is created **once at import time** and shared by all requests. **Never call `store.client.close()` inside a request handler** — it kills the shared client for all future requests.

```python
# Connection priority in mongo_store.py
MONGO_URI = os.environ.get("ATLAS_URI") or os.environ.get("MONGO_URI") or "mongodb://localhost:27017"

# Singleton — created once, shared by all MongoStore instances
_CLIENT: MongoClient = _build_client(MONGO_URI, _URI_LABEL)

class MongoStore:
    def __init__(self, ..., client=None):
        self.client = client or _CLIENT   # never creates a new MongoClient
```

**Properties available on `store`:**
- `store.schemas` — live production collection
- `store.schemas_v2` — staging enriched schema
- `store.schemas_backup` — backup from promote_v2.py
- `store.binat` — MoM collection

**`_build_client` timeouts:** `serverSelectionTimeoutMS=8000`, `connectTimeoutMS=8000`, `socketTimeoutMS=20000`, `maxPoolSize=10`, `minPoolSize=1`

---

## FastAPI Backend

**Interactive docs:** http://localhost:8001/docs

### Auth endpoints (`backend/auth/auth_router.py`)

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| `POST` | `/api/auth/register` | Create new account | No |
| `POST` | `/api/auth/login` | Get JWT token | No |
| `GET`  | `/api/auth/me` | Get current user profile | Bearer token |
| `POST` | `/api/auth/forgot-password` | Request reset token (dev: returned in response) | No |
| `POST` | `/api/auth/reset-password` | Set new password with token | No |

### Schema endpoint (`backend/schema/schema_router.py`)

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| `GET` | `/api/schema` | Return full `common_schema` JSON from MongoDB | Optional Bearer |

### JWT config (in `service.py`)
```python
SECRET_KEY         = "79ed1488bc46d9f8ad46f4a35ee9bd22e4231a9acdd3e0f975614fe0b8ea4a23"
ALGORITHM          = "HS256"
TOKEN_EXPIRE_HOURS = 8
```
> ⚠️ Move `SECRET_KEY` to `.env` before any deployment.

### main.py imports (updated for renamed routers)
```python
from backend.auth.auth_router import router as auth_router
from backend.schema.schema_router import router as schema_router
```

---

## React App (`frontend/src/App.jsx`)

### App flow
```
No token in localStorage
  → LoginScreen   → POST /api/auth/login   → store token → ValidatorApp
  → RegisterScreen → POST /api/auth/register → auto-login → ValidatorApp
  → ForgotScreen  → POST /api/auth/forgot-password → token shown on screen (dev mode)
  → ResetScreen   → POST /api/auth/reset-password → back to login

Token present → fetch /api/auth/me (validate token) → ValidatorApp
Token invalid/expired → clear localStorage → back to LoginScreen
```

### ValidatorApp — schema loading
```
Mount → fetch /api/schema (Bearer token)
      → COMMON_SCHEMA = data
      → _initDerivedConstants() — builds ROUTABLE_NAMES, IFACE_COLOURS, INTERFACES
      → setSchemaReady(true) → validator renders
```

---

## Complete Roadmap

```
✅ STEP 1  Schema → MongoDB
✅ STEP 2a MongoDB users collection + indexes
✅ STEP 2b FastAPI auth backend (register/login/me/forgot/reset)
✅ STEP 2c React login/register/forgot/reset screens + JWT
✅ STEP 3  GET /api/schema endpoint (reads from MongoDB, optional Bearer)
✅ STEP 4  React fetches schema from API (App.jsx ~1,686 lines, was ~14,373)
✅ STEP 5  MongoDB Atlas integration + singleton MongoClient
✅ STEP 6  Removed all client.close() from request handlers (service.py + schema_router.py)
✅ STEP 7  Renamed router.py → auth_router.py / schema_router.py (avoid filename collisions)
⏳ STEP 8  Schema enrichment promotion (files ready, not yet executed — see below)
⏳ STEP 9  POST /api/validate — move validation to Python backend
```

---

## Schema Enrichment — V2 (PENDING)

### What changed in `common_schema_v2.json`

| Layer | Field | Interface | Change |
|---|---|---|---|
| L1 | `ITEMS` | all | `type: array`, `maxItems: 500` |
| L1 | `CONTACT_PERSONS` | all | `type: array`, `maxItems: 20` |
| L2 | `ITEMS` | Interface5 (`ZWMS_INBOUND_DELIVERY_CREATE`) | array of delivery line objects, `minItems: 1`, required: `MATERIAL`, `QUANTITY`, `REC_DOC_LINE` |
| L2 | `CONTACT_PERSONS` | Interface4 (`ZPUR_WMS_VEND_OUTBOUND`) | array of contact objects, required: `CP_FIRST_NAME`, `CP_LAST_NAME` |

### 4-file promotion lifecycle
```
enrich_schema_v2.py     → uploads common_schema_v2.json to Atlas schemas_v2 (safe staging)
     ↓ test against schemas_v2
promote_v2.py           → schemas → schemas_backup, schemas_v2 → schemas (go live)
     ↓ if something breaks
rollback_to_backup.py   → instant restore from schemas_backup
```

**Status:** `enrich_schema_v2.py`, `promote_v2.py`, `rollback_to_backup.py` all exist in project root. **None have been run yet.** `schemas_v2` collection does not yet exist in Atlas.

### To execute enrichment
```bash
cd /Users/eithan/opt/dev/wms_validator
PYTHONPATH=. .venv/bin/python enrich_schema_v2.py   # upload to schemas_v2
# test the app against schemas_v2 first
PYTHONPATH=. .venv/bin/python promote_v2.py          # promote to live
```

---

## Validation Architecture — Current State

### Layer 1 / Layer 2 strategy (key architectural decision)

**The core insight:** Layer 1 is a firewall — it only needs to know a field *exists* in the catalogue and check its top-level type (`string`, `array`, `object`). It does NOT need to validate the internal structure of arrays/objects. That is Layer 2's job.

This means:
- A field arriving as an array → Layer 1 checks `type == array` and `maxItems`. Pass.
- Layer 2 then validates each item's internal fields against the interface-specific schema.
- This architecture handles any SAP payload structure (flat strings, arrays of objects, nested dicts) cleanly without changing the two-layer philosophy.

### Where validation lives right now

**All validation runs in the browser, in JavaScript, inside `App.jsx`.**

Key functions:
- `runValidation(payloadText)` — top-level entry point
- `validateAgainstSchema(payload, schema, rootSchema)` — core engine
- `resolveRef(ref, rootSchema)` — resolves `$ref` pointers
- `validateProp(fname, value, propSchema)` — checks a single field

Implements a subset of JSON Schema Draft 2020-12: `type`, `maxLength`, `minLength`, `pattern`, `enum`, `required`, `if/then`, `$ref`.

### Old Python validators (Sessions 4–5)

Two standalone scripts exist somewhere in the project (not connected to FastAPI):
- `common_schema.py` — Layer 1 validator
- `interface_models.py` — Layer 2 per-interface Pydantic models
- `test_runner.py` — 28-test suite (all passing)

**Exact location not confirmed** — likely project root or `services/`. Find them before starting Step 9.

### POST /api/validate — what it will look like

```
React: POST /api/validate  { "payload": {...} }
         ↓
FastAPI backend/validate/validate_router.py
  1. Load COMMON_SCHEMA from MongoDB (cache it — don't fetch every request)
  2. Layer 1: validate all fields against catalogue (type + maxLength/maxItems)
  3. Layer 2: route by INTERFACE_NAME → validate against interface $defs
  4. Return: { errors, warnings, routedTo, layer1Errors, layer2Errors }
         ↓
React: render result (no UI changes needed)
```

**Recommended approach — Option A (`jsonschema` library):**
```python
pip install jsonschema
from jsonschema import Draft202012Validator
validator = Draft202012Validator(schema)
errors = list(validator.iter_errors(payload))
```
Clean, standard, handles all Draft 2020-12 features. No need to maintain handwritten validators.

---

## Pending Items

| Item | Priority | Notes |
|------|----------|-------|
| Run `enrich_schema_v2.py` | High | Upload enriched schema to Atlas `schemas_v2` |
| Test app against `schemas_v2` | High | Before promoting |
| Run `promote_v2.py` | High | Promote v2 to live `schemas` collection |
| Move `SECRET_KEY` to `.env` | High | Before any deployment |
| `POST /api/validate` endpoint | Medium | Move validation from JS → Python (Option A recommended) |
| Interface 1 routing key | Medium | Assign `ZWM_ITEMS_OUTBOUND` in schema, re-upload |
| Real email for forgot-password | Low | SendGrid/SES — backend already structured for it |
| User management UI | Low | Admin screen: view/activate/deactivate users |

---

## Key Technical Decisions

| Decision | Reason |
|----------|--------|
| FastAPI (not Node/Express) | Eithan knows Python |
| bcrypt rounds=12 | Industry standard |
| JWT (not sessions) | Stateless, works with React SPA |
| Schema stored as JSON string in MongoDB | Avoids `$id`/`$ref` operator confusion |
| Port 8001 (not 8000) | Port 8000 occupied by HB_V2 |
| Singleton MongoClient | Eliminates per-request DNS/SRV lookup (21s → instant) |
| Never call `client.close()` in request handlers | Closing singleton kills it for all future requests |
| `auth_router.py` / `schema_router.py` (not `router.py`) | Avoid filename collision confusion |
| `sys.path.insert` in code (not PYTHONPATH) | Shell env vars don't propagate to uvicorn `--reload` |
| `let` not `const` for COMMON_SCHEMA | Must be reassignable after API fetch at runtime |
| All hooks before conditional returns | React Rules of Hooks |
| Layer 1 checks type only (not internal structure) | Arrays/objects validated at L1 by type+maxItems; internal structure is L2's responsibility |

---

## What to Tell Claude in the Next Chat

> "I'm attaching a handoff document (Session 13) for my WMS–SAP Validation project.
> The full stack is working: FastAPI on port 8001, React/Vite on port 5173, MongoDB Atlas.
> Login, JWT auth, and schema loading from Atlas are all working.
>
> I have three things to do in priority order:
> 1. Execute the schema v2 enrichment (run enrich_schema_v2.py, test, then promote_v2.py)
> 2. Move SECRET_KEY to .env
> 3. Build POST /api/validate to move validation from JavaScript (App.jsx) to Python backend
>
> Please read the full handoff before we start, especially the Schema Enrichment and
> Validation Architecture sections."

Then attach this file.