# WMS–SAP Validation Project — Handoff Summary
> Use this document to brief Claude in a new chat. Paste it in full at the start.

---

## Who You Are
- Name: Eithan (or Stephan Katz — same person)
- Background: Python developer, zero JavaScript/JSX/React experience
- OS: macOS
- IDE: PyCharm (Professional, with npm runner support confirmed working)
- Node.js: v24.13.1 (freshly installed LTS)
- npm: 11.8.0

---

## What This Project Is

A **SAP ↔ WMS interface validation system**. SAP sends JSON payloads to a Warehouse Management System (WMS). Each payload has an `INTERFACE_NAME` field that identifies which of 4 interface types it belongs to. The system validates every payload against a two-layer JSON Schema:

- **Layer 1 (Firewall / Network Element)**: Catalogue-wide field constraints — 369 known field names (Hebrew and special-character field names filtered out), each with type and `maxLength`. Applies to *every* payload regardless of interface.
- **Layer 2 (App Check / Completeness)**: Required fields, `minLength`, `pattern` (date/time formats, decimals), and `enum` values (e.g. `CONSIGNEE` must be `ATAL`, `IDF`, or `AIR`).

Routing between layers happens via `INTERFACE_NAME` using JSON Schema `allOf` + `if/then` + `$ref`.

---

## The 4 Active Interfaces

| Num | INTERFACE_NAME | Title | Req / Opt props | Routed? |
|-----|---------------|-------|----------------|---------|
| 1 | *(empty — not yet assigned)* | Items Master | 14 req / 3 opt | ❌ No routing key in schema |
| 2 | `ZQM_WMS_INSPECTION_OUTBOUND` | Quality Inspection | 10 req / 1 opt | ✅ |
| 3 | `ZSDWMS_CUST_OUTBOUND` | Customers | 11 req / 5 opt | ✅ |
| 27 | `ZMM_WMS_ORDER_KIT_CREATE` | Kit Work Orders | 20 req / 5 opt | ✅ |

> **Note on Interface 1**: The `common_schema.json` source has `x-interface-name: ""` for Interface 1 — no routing key assigned yet. It exists in `$defs` and its required/optional fields are defined, but no `allOf` branch can dispatch to it because there is no `INTERFACE_NAME` constant to match on. The React app surfaces this visibly as a "NO KEY" warning badge on the routing table row. This needs to be fixed in `common_schema.json` by assigning `ZWM_ITEMS_OUTBOUND` as the routing key.

> **Interface 44 (`APPOINTMENT_ENTRY_RESPONSE`) was removed** from `common_schema.json` and from the React app's `$defs` during this session. It is not in the current schema. One sample payload uses it to demonstrate the "unknown interface" failure path.

---

## allOf Routing Branches (3 active)

```json
{ "if": { "INTERFACE_NAME": { "const": "ZQM_WMS_INSPECTION_OUTBOUND" } }, "then": { "$ref": "#/$defs/Interface2"  } },
{ "if": { "INTERFACE_NAME": { "const": "ZSDWMS_CUST_OUTBOUND"        } }, "then": { "$ref": "#/$defs/Interface3"  } },
{ "if": { "INTERFACE_NAME": { "const": "ZMM_WMS_ORDER_KIT_CREATE"    } }, "then": { "$ref": "#/$defs/Interface27" } }
```

Interface 1 has no `if/then` branch. Interface 4 does not exist in the current schema.

---

## What Was Built (in order)

### Sessions 1–2: Excel → JSON pipeline (Python)
- Source: Excel file with 40 schema tabs, Hebrew column headers
- Built a Python parser that reads the Excel, translates Hebrew headers to English, outputs `schema_data.json`
- `schema_data.json` contains all 40 schemas, each with fields: `json_field`, `required`, `length`, `field_type`, `possible_values`, `field_description`
- Lives at: `services/schema_data.json` (relative to project root)

### Session 3: Field matrix report (Python + openpyxl)
- Cross-reference Excel matrix: 552 fields × 40 schemas
- Shows which fields appear in which schemas
- Purely a reporting artifact, not used in validation

### Sessions 4–5: Two-layer Python validation system

#### `common_schema.py`
- Reads `schema_data.json`, builds `FIELD_CATALOGUE` dict: `{field_name: max_length}`
- `CommonSchema.validate(payload)` → `CommonResult` (Pydantic `BaseModel`)
- Checks: INTERFACE_NAME present, all values are strings, no field exceeds catalogue maxLength
- Does NOT check required fields — that's the interface layer's job
- `catalogue_json_schema()` emits a full JSON Schema `properties` block for all catalogue fields

#### `interface_models.py`
- Reads `schema_data.json`, builds 5 `InterfaceSpec` objects
- **Upgraded to Pydantic v2**: each interface is a real typed class via `create_model()`
- `INTERFACE_REGISTRY`: `{num → InterfaceSpec}`
- `PYDANTIC_MODELS`: `{num → Pydantic model class}`
- `IFACE_NAME_TO_NUM`: routes by INTERFACE_NAME string
- `InterfaceValidator.validate(payload, num)` → `InterfaceResult`
- `InterfaceValidator.validate_auto(payload)` → auto-routes by INTERFACE_NAME
- `get_interface_json_schema(num)` → OpenAPI-compatible JSON Schema per interface
- `get_all_json_schemas()` → all schemas as a dict
- `InterfaceResult` carries `model_instance` (Pydantic object when passed) and `pydantic_error` (raw ValidationError when failed)

#### `engineered_data.py`
- 28 hand-crafted test payloads covering all interfaces
- Mix of: valid payloads, missing required fields, length violations, enum violations, multi-violation cases
- Each test case: `(description, payload_dict, interface_num, expect_common_pass, expect_iface_pass)`

#### `test_runner.py`
- Runs all 28 test cases
- Rich-style terminal output using pure ANSI escape codes (no external dependencies)
- Result: **28/28 tests pass**
- Also writes `schema_validation_report.txt` (ANSI stripped)

### Session 6: `common_schema.json` + React network validator

#### `common_schema.json` (60KB)
- Full **JSON Schema Draft 2020-12** file
- Generated from `schema_data.json` via Python
- 379 raw fields in `properties` (369 after filtering Hebrew/special-char names in the React app)
- 4 interfaces in `$defs` (Interface1, Interface2, Interface3, Interface27)
- 3 `allOf` routing branches (Interface1 has no routing key)
- Source of truth for the React app

### Session 7 (current): React app refinement + deployment packaging

#### `App.jsx` — the React validator (final state)

**What it does:**
- Validates JSON payloads in the browser — no server, no backend, fully self-contained
- Embedded `COMMON_SCHEMA` object: catalogue properties + allOf routing + $defs all in one JS object
- Two visible validation layers with separate error counts and badges

**UI structure (top to bottom):**
1. **Header bar** — shows live counts: catalogue fields, interfaces, routing branches, layers
2. **Layer Legend** — two chips explaining L1 (Firewall) and L2 (App Check)
3. **Network Topology Diagram** — animated flow: `SAP ERP → [L1 Firewall box] → [L2 App Check box] → WMS`. Each box shows live pass/fail count. Arrow between L1 and L2 shows "✗ BLOCKED" when L1 fails
4. **Interface Routing Table** — 4 rows (IF-1 through IF-27), the matched row lights up with the interface color; IF-1 shows "NO KEY" badge
5. **Payload Editor** (left panel) — textarea + 8 sample payload buttons + VALIDATE button
6. **Validation Results** (right panel) — pass/fail status bar, L1/L2 error count chips, error list with layer badge + rule badge per row, warnings list
7. **Schema Explorer** (bottom) — tabbed: Routing | IF-N Fields | Catalogue | JSON Schema

**Validation engine (`runValidation` function):**
- Parses JSON from textarea
- Layer 1: runs `validateAgainstSchema(payload, COMMON_SCHEMA, COMMON_SCHEMA)` → catalogue type + maxLength checks
- Layer 2: finds matching `allOf` branch by `INTERFACE_NAME`, resolves `$ref`, runs `validateAgainstSchema(payload, subSchema, COMMON_SCHEMA)` → required + minLength + pattern + enum checks
- Deduplicates errors between layers (same field + same rule not reported twice)
- Returns: `{ errors, warnings, routedTo, layer1Errors, layer2Errors }`

**Theme:**
- Background: warm cream `#faf7f0` (page), `#f5f0e8` (cards)
- All text: dark — primary `#111827`, body `#374151`, muted `#64748b`
- Validate button: dark blue gradient `#1e3a5f → #2d1e4f`, **white text `#ffffff`**
- Accent colors: blue `#3b82f6` (L1/IF-1), amber `#f59e0b` (IF-2), green `#10b981` (IF-3), purple `#8b5cf6` (IF-27)
- Error red `#ef4444`, pass green `#22c55e`, warning amber `#f59e0b`
- Layer 1 badge: blue tint bg `#ddeaf7` / Layer 2 badge: purple tint bg `#ece8f8`

**Sample payloads (8 total):**

| Label | Interface | Outcome |
|-------|-----------|---------|
| IF-2 Quality ✓ | ZQM_WMS_INSPECTION_OUTBOUND | Valid |
| IF-2 Quality ✗ | ZQM_WMS_INSPECTION_OUTBOUND | ID too long, PLANT too short, bad DATE |
| IF-3 Customers ✓ | ZSDWMS_CUST_OUTBOUND | Valid |
| IF-3 Customers ✗ | ZSDWMS_CUST_OUTBOUND | PLANT too short, 7 required fields missing |
| IF-27 Kit ✓ | ZMM_WMS_ORDER_KIT_CREATE | Valid |
| IF-27 Kit ✗ | ZMM_WMS_ORDER_KIT_CREATE | PLANT enum violation, bad TIME, 12 missing required |
| ✗ Missing IF_NAME | *(none)* | L1 required error: INTERFACE_NAME absent |
| ✗ Unknown IF_NAME | APPOINTMENT_ENTRY_RESPONSE | L1 passes, L2 no routing match |

---

## File Structure — Current Package (`wms-validator.zip`)

```
wms-validator/                  ← unzip and work from here
│
├── src/
│   ├── App.jsx                 ← MAIN FILE: entire validator (schema + engine + UI)
│   └── main.jsx                ← 4-line React entry point (never needs editing)
│
├── index.html                  ← Single HTML page shell (never needs editing)
├── package.json                ← npm project: React 18, Vite 5
├── vite.config.js              ← Build config: just enables JSX (never needs editing)
│
├── run-production.bat          ← Windows: double-click to build + open in browser
├── run-production.sh           ← Mac/Linux: run to build + open in browser
└── README.md                   ← Deployment options (local, Netlify, IIS/Nginx)
```

**Key rule:** `App.jsx` is the only file you ever edit. Everything else is scaffolding.

---

## Python Project File Locations

```
services/
  schema_data.json              ← master data source (generated from Excel)
  common_paths.py               ← defines DATA_DIR pointing to schema_data.json
common_schema.py                ← Layer 1 validator (Pydantic BaseModel result)
interface_models.py             ← Layer 2 validators (Pydantic v2 create_model)
engineered_data.py              ← 28 test cases
test_runner.py                  ← test harness + ANSI reporter
schema_validation_report.txt    ← plain-text report output
common_schema.json              ← JSON Schema Draft 2020-12 (generated, 60KB)
```

---

## Running the App

### Development (edit-and-refresh workflow)
```bash
npm install       # first time only — downloads React + Vite into node_modules/
npm run dev       # starts dev server at http://localhost:5173
```
In PyCharm: Run Configuration → npm → script: `dev` → click ▶

### Production build (compiled, deployable)
```bash
npm run build     # compiles everything into dist/ folder
npm run preview   # serves dist/ at http://localhost:4173
```
**Windows shortcut:** double-click `run-production.bat`
**Mac shortcut:** `./run-production.sh`

### Deploy to real URL (free, no account)
1. `npm run build`
2. Go to **netlify.com/drop**
3. Drag the `dist/` folder onto the page → get a live URL instantly

### Deploy to your own server (IIS / Nginx / Apache)
- Run `npm run build`, copy the `dist/` folder contents to your web root
- No Node.js needed on the server — it's just static HTML + JS files

---

## PyCharm Run Configuration

- **Type**: npm
- **Name**: `wms-validator dev`
- **package.json**: `/Users/eithan/wms-validator/package.json`
- **Command**: `run`
- **Scripts**: `dev`
- **Result**: clicking ▶ starts the dev server, `Cmd`-click `localhost:5173` opens the app

*(Note: previous config used path `my-validator` — update to `wms-validator` if you had the old one set up)*

---

## Key Technical Decisions Made

| Decision | Reason |
|----------|--------|
| Pydantic v2 over manual loops | `create_model()` gives real typed classes; `model_json_schema()` gives free OpenAPI output; `ValidationError` gives structured errors |
| `common_schema.json` over Python-only | JSON Schema is language-agnostic — usable in AJV, jsonschema Python lib, Postman, API Gateway, etc. |
| React/Vite over Plotly/Dash | Validator logic is pure client-side; no server round-trips needed |
| 369 fields in catalogue (not 379) | 10 fields had Hebrew or special characters in their names and cannot be used as clean JSON property keys |
| Interface 44 removed from schema | `APPOINTMENT_ENTRY_RESPONSE` was not present in `common_schema.json` — one sample payload demonstrates the "no routing match" behaviour |
| Interface 1 has no routing key | `common_schema.json` source has `x-interface-name: ""` for Interface 1 — this is a known gap that needs to be fixed in the JSON file |
| Two separate validator boxes in topology diagram | Makes the L1 (network/firewall) vs L2 (application/completeness) distinction visually clear |
| Light cream theme | High contrast on all text; dark theme had contrast failures |
| ANSI codes in test_runner.py | `rich` package unavailable (no network in build environment) |

---

## Known Issues / Open Items

| Issue | Status |
|-------|--------|
| Interface 1 (`ZWM_ITEMS_OUTBOUND`) has no routing key in `common_schema.json` | Open — `x-interface-name` is `""` in the JSON source, so no `allOf` branch can dispatch to it |
| Interface 44 (`APPOINTMENT_ENTRY_RESPONSE`) removed | Intentional — was not in `common_schema.json`; shown as "unknown interface" demo only |
| Hebrew field names (10 fields) excluded from catalogue | They exist in `schema_data.json` but can't be clean JSON property keys |

---

## Sample Payloads for Testing

```json
// IF-2 Quality Inspection — VALID
{
  "INTERFACE_NAME": "ZQM_WMS_INSPECTION_OUTBOUND",
  "ID": "0000000000000001",
  "PLANT": "ATAL",
  "DATE": "20240601",
  "TIME": "090000",
  "CONSIGNEE": "IDF",
  "INSPECTION_LOT": "300000001234",
  "MATERIAL": "5000099887",
  "VENDOR_ID": "V001",
  "MANUFACTURE_DATE": "20240101",
  "EVALUATION_CODE": "A"
}

// IF-3 Customers — INVALID (PLANT too short, 7 required fields missing)
{
  "INTERFACE_NAME": "ZSDWMS_CUST_OUTBOUND",
  "ID": "0000000000000003",
  "PLANT": "AT",
  "DATE": "20240701",
  "TIME": "120000",
  "CONSIGNEE": "ATAL"
}

// No INTERFACE_NAME — fails at L1 immediately
{
  "ID": "123",
  "PLANT": "ATAL",
  "DATE": "20240315"
}

// Unknown INTERFACE_NAME — passes L1 but no L2 routing match
{
  "INTERFACE_NAME": "APPOINTMENT_ENTRY_RESPONSE",
  "DATE": "20241010",
  "TIME": "093000"
}
```

---

## What to Ask Claude in the New Chat

Suggested opening message:

> "I'm attaching a handoff document from my previous Claude sessions. I built a JSON Schema validator as a React app (`App.jsx`) that runs locally via Vite/PyCharm. I have zero JavaScript experience. Please walk me through the project, starting from the very basics — what is JavaScript, what is JSX, what is React, and how does my file work. Go slowly, one concept at a time, using examples from my actual file."

Then attach this file.