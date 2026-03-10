import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Step 2c
// ─────────────────────────────────────────────────────────────────────────────
const API_AUTH = "http://localhost:8001/api/auth";

const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  :root {
    --auth-bg:       #0d1117;
    --auth-surface:  #161b22;
    --auth-border:   #30363d;
    --auth-hi:       #58a6ff;
    --auth-text:     #e6edf3;
    --auth-muted:    #7d8590;
    --auth-accent:   #f0b429;
    --auth-error:    #f85149;
    --auth-success:  #3fb950;
    --auth-mono:     'IBM Plex Mono', monospace;
    --auth-sans:     'IBM Plex Sans', sans-serif;
  }
  .auth-shell {
    min-height:100vh; display:grid; place-items:center; padding:24px;
    background:
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(240,180,41,.07) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 20%, rgba(88,166,255,.06) 0%, transparent 55%),
      var(--auth-bg);
    font-family: var(--auth-sans);
  }
  .auth-card {
    width:100%; max-width:400px;
    background:var(--auth-surface); border:1px solid var(--auth-border);
    border-radius:6px; padding:40px 36px 36px; position:relative; overflow:hidden;
    color:var(--auth-text);
  }
  .auth-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,#7d5c0a,var(--auth-accent),#7d5c0a);
  }
  .auth-brand { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
  .auth-brand-icon { width:32px; height:32px; background:var(--auth-accent); border-radius:4px; display:grid; place-items:center; flex-shrink:0; }
  .auth-brand-text { font-family:var(--auth-mono); font-size:12px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--auth-muted); line-height:1.3; }
  .auth-brand-text strong { display:block; color:var(--auth-text); font-size:14px; letter-spacing:.04em; }
  .auth-title { font-size:20px; font-weight:600; margin-bottom:4px; }
  .auth-subtitle { font-size:13px; color:var(--auth-muted); margin-bottom:28px; }
  .auth-field { margin-bottom:16px; }
  .auth-field label { display:block; font-family:var(--auth-mono); font-size:11px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--auth-muted); margin-bottom:6px; }
  .auth-field input { width:100%; background:var(--auth-bg); border:1px solid var(--auth-border); border-radius:4px; color:var(--auth-text); font-family:var(--auth-mono); font-size:13px; padding:9px 12px; outline:none; transition:border-color .15s; box-sizing:border-box; }
  .auth-field input:focus { border-color:var(--auth-hi); }
  .auth-field input::placeholder { color:var(--auth-muted); opacity:.5; }
  .auth-btn-primary { width:100%; background:var(--auth-accent); color:#0d1117; border:none; border-radius:4px; font-family:var(--auth-mono); font-size:13px; font-weight:600; letter-spacing:.04em; padding:10px; cursor:pointer; transition:opacity .15s; margin-top:8px; }
  .auth-btn-primary:hover { opacity:.88; }
  .auth-btn-primary:disabled { opacity:.4; cursor:not-allowed; }
  .auth-btn-link { background:none; border:none; color:var(--auth-hi); font-family:var(--auth-sans); font-size:13px; cursor:pointer; padding:0; text-decoration:underline; text-underline-offset:2px; }
  .auth-btn-link:hover { color:var(--auth-text); }
  .auth-notice { border-radius:4px; padding:10px 12px; font-size:13px; margin-bottom:16px; border:1px solid; }
  .auth-notice-error   { background:rgba(248,81,73,.08);  border-color:rgba(248,81,73,.3);  color:#ffa198; }
  .auth-notice-success { background:rgba(63,185,80,.08);  border-color:rgba(63,185,80,.3);  color:#56d364; }
  .auth-footer { margin-top:20px; display:flex; flex-wrap:wrap; justify-content:center; gap:4px 8px; font-size:13px; color:var(--auth-muted); text-align:center; }
  .auth-divider { border:none; border-top:1px solid var(--auth-border); margin:20px 0; }
  .auth-token-box { background:var(--auth-bg); border:1px solid var(--auth-border); border-radius:4px; padding:10px 12px; font-family:var(--auth-mono); font-size:11px; color:var(--auth-accent); word-break:break-all; margin-top:10px; }
  .auth-topnav { height:48px; background:#161b22; border-bottom:1px solid #30363d; display:flex; align-items:center; padding:0 20px; gap:12px; position:sticky; top:0; z-index:100; }
  .auth-topnav-brand { display:flex; align-items:center; gap:8px; font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#7d8590; }
  .auth-topnav-dot { width:8px; height:8px; background:#f0b429; border-radius:2px; flex-shrink:0; }
  .auth-topnav-spacer { flex:1; }
  .auth-topnav-user { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7d8590; }
  .auth-topnav-user span { color:#e6edf3; }
  .auth-btn-logout { background:transparent; border:1px solid #30363d; border-radius:4px; color:#7d8590; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.04em; padding:4px 10px; cursor:pointer; transition:border-color .15s,color .15s; }
  .auth-btn-logout:hover { border-color:#f85149; color:#f85149; }
`;

function _injectAuthStyles() {
  if (document.getElementById("wms-auth-css")) return;
  const el = document.createElement("style");
  el.id = "wms-auth-css";
  el.textContent = AUTH_CSS;
  document.head.appendChild(el);
}

async function _authFetch(path, body) {
  const res = await fetch(`${API_AUTH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : "An error occurred";
    throw new Error(msg);
  }
  return data;
}

function _AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="auth-brand-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="8" width="14" height="8" rx="1" fill="#0d1117"/>
          <path d="M1 8.5L9 3l8 5.5" stroke="#0d1117" strokeWidth="1.5" strokeLinejoin="round"/>
          <rect x="6" y="10" width="6" height="6" rx="1" fill="#0d1117"/>
        </svg>
      </div>
      <div className="auth-brand-text">
        <strong>WMS Validator</strong>
        SAP ↔ WMS Interface
      </div>
    </div>
  );
}

function _LoginScreen({ onLogin, goRegister, goForgot, onBypass }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError(null); setLoading(true);
    try {
      const data = await _authFetch("/login", { email, password });
      localStorage.setItem("wms_token", data.access_token);
      onLogin(data.access_token);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <_AuthBrand />
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Enter your credentials to access the validator.</p>
        {error && <div className="auth-notice auth-notice-error">{error}</div>}
        <div className="auth-field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSubmit()} autoFocus />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSubmit()} />
        </div>
        <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in →"}
        </button>
        <hr className="auth-divider" />
        <button
          style={{
            width:"100%", background:"transparent", border:"1px dashed #30363d",
            borderRadius:4, color:"#7d8590", fontFamily:"'IBM Plex Mono',monospace",
            fontSize:11, letterSpacing:".06em", padding:"8px", cursor:"pointer",
            transition:"border-color .15s, color .15s",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor="#f0b429"; e.currentTarget.style.color="#f0b429"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor="#30363d"; e.currentTarget.style.color="#7d8590"; }}
          onClick={onBypass}
        >
          ⚡ DEV BYPASS — skip login
        </button>
        <div className="auth-footer">
          <button className="auth-btn-link" onClick={goForgot}>Forgot password?</button>
          <span>·</span>
          <span>No account?</span>
          <button className="auth-btn-link" onClick={goRegister}>Register</button>
        </div>
      </div>
    </div>
  );
}

function _RegisterScreen({ onLogin, goLogin }) {
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await _authFetch("/register", { email, username, password });
      const data = await _authFetch("/login", { email, password });
      localStorage.setItem("wms_token", data.access_token);
      onLogin(data.access_token);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <_AuthBrand />
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Contact an admin after registering to activate your account.</p>
        {error && <div className="auth-notice auth-notice-error">{error}</div>}
        <div className="auth-field"><label>Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} autoFocus /></div>
        <div className="auth-field"><label>Username</label>
          <input type="text" placeholder="eithan" value={username}
            onChange={e => setUsername(e.target.value)} /></div>
        <div className="auth-field"><label>Password</label>
          <input type="password" placeholder="At least 8 characters" value={password}
            onChange={e => setPassword(e.target.value)} /></div>
        <div className="auth-field"><label>Confirm password</label>
          <input type="password" placeholder="••••••••" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSubmit()} /></div>
        <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account…" : "Create account →"}
        </button>
        <div className="auth-footer">
          <span>Already have an account?</span>
          <button className="auth-btn-link" onClick={goLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

function _ForgotScreen({ goLogin, goReset }) {
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null); setLoading(true);
    try {
      const data = await _authFetch("/forgot-password", { email });
      setToken(data.reset_token ?? data.token ?? null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <_AuthBrand />
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">We'll generate a reset token for your account.</p>
        {error && <div className="auth-notice auth-notice-error">{error}</div>}
        {token ? (
          <>
            <div className="auth-notice auth-notice-success">
              Token generated — copy it below (dev mode; would be emailed in production).
            </div>
            <div className="auth-token-box">{token}</div>
            <hr className="auth-divider" />
            <button className="auth-btn-primary" onClick={() => goReset(email, token)}>
              Continue to reset →
            </button>
          </>
        ) : (
          <>
            <div className="auth-field"><label>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSubmit()} autoFocus /></div>
            <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Sending…" : "Send reset token →"}
            </button>
          </>
        )}
        <div className="auth-footer">
          <button className="auth-btn-link" onClick={goLogin}>← Back to sign in</button>
        </div>
      </div>
    </div>
  );
}

function _ResetScreen({ prefillEmail="", prefillToken="", goLogin }) {
  const [email, setEmail]       = useState(prefillEmail);
  const [token, setToken]       = useState(prefillToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState(null);
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await _authFetch("/reset-password", { email, token, new_password: password });
      setDone(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <_AuthBrand />
        <h1 className="auth-title">New password</h1>
        <p className="auth-subtitle">Enter your reset token and choose a new password.</p>
        {error && <div className="auth-notice auth-notice-error">{error}</div>}
        {done ? (
          <>
            <div className="auth-notice auth-notice-success">Password updated successfully.</div>
            <button className="auth-btn-primary" onClick={goLogin}>Sign in →</button>
          </>
        ) : (
          <>
            <div className="auth-field"><label>Email</label>
              <input type="email" value={email} placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)} /></div>
            <div className="auth-field"><label>Reset token</label>
              <input type="text" value={token} placeholder="Paste token here"
                onChange={e => setToken(e.target.value)} /></div>
            <div className="auth-field"><label>New password</label>
              <input type="password" value={password} placeholder="At least 8 characters"
                onChange={e => setPassword(e.target.value)} /></div>
            <div className="auth-field"><label>Confirm new password</label>
              <input type="password" value={confirm} placeholder="••••••••"
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSubmit()} /></div>
            <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : "Set new password →"}
            </button>
          </>
        )}
        <div className="auth-footer">
          <button className="auth-btn-link" onClick={goLogin}>← Back to sign in</button>
        </div>
      </div>
    </div>
  );
}

function _TopNav({ user, onLogout }) {
  return (
    <nav className="auth-topnav">
      <div className="auth-topnav-brand">
        <div className="auth-topnav-dot" />
        WMS Validator
      </div>
      <div className="auth-topnav-spacer" />
      {user && (
        <span className="auth-topnav-user">
          <span>{user.username ?? user.email}</span>
          {user.role && <>&nbsp;·&nbsp;{user.role}</>}
        </span>
      )}
      <button className="auth-btn-logout" onClick={onLogout}>Sign out</button>
    </nav>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// END AUTH BLOCK
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED common_schema.json  v1.0.0  (2026-02-25)
// Source: urn:wms:sap:common-payload-schema:v1
//
// LAYER 1 — Catalogue  (379 fields, firewall / network-element validation)
//           • Type check (must be string)
//           • maxLength / minLength
//           • Pattern & enum where defined
//
// LAYER 2 — Interface routing  (allOf if/then, application-level validation)
//           • Checks completeness: are all required fields present?
//           • Interface-specific constraints (stricter pattern/enum/minLength)
//
// Interfaces in $defs:
//   Interface1  – Items Master          (no INTERFACE_NAME routing key yet)
//   Interface2  – Quality Inspection    ZQM_WMS_INSPECTION_OUTBOUND
//   Interface3  – Customers             ZSDWMS_CUST_OUTBOUND
//   Interface27 – Kit Work Orders       ZMM_WMS_ORDER_KIT_CREATE
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA  —  auto-generated by update_schema.py
// Source : common_schema.json
// Updated: 2026-02-26 12:29:19
// Fields : 315 catalogue fields (9 Hebrew/special-char fields excluded)
// Ifaces : 4 interfaces, 3 allOf routing branches
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA  —  auto-generated by update_schema.py
// Source : common_schema.json
// Updated: 2026-02-26 12:43:49
// Fields : 323 catalogue fields (0 Hebrew/special-char fields excluded)
// Ifaces : 40 interfaces, 9 allOf routing branches
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA  —  auto-generated by update_schema.py
// Source : common_schema.json
// Updated: 2026-02-26 13:51:37
// Fields : 323 catalogue fields (0 Hebrew/special-char fields excluded)
// Ifaces : 40 interfaces, 10 allOf routing branches
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA  —  auto-generated by update_schema.py
// Source : common_schema.json
// Updated: 2026-02-26 14:21:48
// Fields : 323 catalogue fields (0 Hebrew/special-char fields excluded)
// Ifaces : 40 interfaces, 38 allOf routing branches
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA  —  auto-generated by update_schema.py
// Source : common_schema.json
// Updated: 2026-03-04 06:59:35
// Fields : 323 catalogue fields (0 Hebrew/special-char fields excluded)
// Ifaces : 40 interfaces, 38 allOf routing branches
// ─────────────────────────────────────────────────────────────────────────────
// COMMON_SCHEMA is now fetched from GET /api/schema at runtime (Step 4)
// It is set inside ValidatorApp once the API responds.
let COMMON_SCHEMA = null;

// ─────────────────────────────────────────────────────────────────────────────
// INLINE JSON SCHEMA VALIDATOR  (Draft 2020-12 subset)
// ─────────────────────────────────────────────────────────────────────────────
function resolveRef(ref, rootSchema) {
  if (!ref.startsWith("#/$defs/")) return null;
  return rootSchema.$defs?.[ref.slice("#/$defs/".length)] ?? null;
}

function validateProp(fieldName, value, propSchema) {
  const errs = [];
  if (value === undefined || value === null || value === "") return errs;
  if (propSchema.type === "string" && typeof value !== "string") {
    errs.push({ field: fieldName, rule: "type", msg: "Must be a string" });
    return errs;
  }
  if (typeof value === "string") {
    if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength)
      errs.push({ field: fieldName, rule: "maxLength", msg: `Length ${value.length} exceeds max ${propSchema.maxLength}` });
    if (propSchema.minLength !== undefined && value.length < propSchema.minLength)
      errs.push({ field: fieldName, rule: "minLength", msg: `Length ${value.length} below min ${propSchema.minLength}` });
    if (propSchema.pattern !== undefined && !new RegExp(propSchema.pattern).test(value))
      errs.push({ field: fieldName, rule: "pattern", msg: `Does not match ${propSchema.pattern}` });
    if (propSchema.enum !== undefined && !propSchema.enum.includes(value))
      errs.push({ field: fieldName, rule: "enum", msg: `'${value}' not in [${propSchema.enum.join(", ")}]` });
    if (propSchema.const !== undefined && value !== propSchema.const)
      errs.push({ field: fieldName, rule: "const", msg: `Must equal '${propSchema.const}'` });
  }
  return errs;
}

function validateAgainstSchema(payload, schema, rootSchema) {
  const errors = [], warnings = [];
  for (const req of (schema.required ?? [])) {
    const v = payload[req];
    if (v === undefined || v === null || v === "")
      errors.push({ field: req, rule: "required", msg: "Required field missing or empty" });
  }
  for (const [fname, value] of Object.entries(payload)) {
    const propSchema = schema.properties?.[fname];
    if (!propSchema) {
      const catProp = rootSchema.properties?.[fname];
      if (!catProp) warnings.push({ field: fname, rule: "unknown", msg: "Field not in master catalogue" });
      else errors.push(...validateProp(fname, value, catProp));
      continue;
    }
    errors.push(...validateProp(fname, value, propSchema));
  }
  return { errors, warnings };
}

function runValidation(payloadText) {
  let payload;
  try { payload = JSON.parse(payloadText); }
  catch (e) { return { parseError: `JSON parse error: ${e.message}`, errors: [], warnings: [], routedTo: null, layer1Errors: [], layer2Errors: [] }; }

  const allErrors = [], allWarnings = [];

  const l1 = validateAgainstSchema(payload, COMMON_SCHEMA, COMMON_SCHEMA);
  const layer1Errors = l1.errors.map(e => ({ ...e, layer: 1, layerLabel: "Catalogue" }));
  allErrors.push(...layer1Errors);
  allWarnings.push(...l1.warnings.map(w => ({ ...w, layer: 1 })));

  let routedTo = null;
  const layer2Errors = [];
  const iname = payload.INTERFACE_NAME;
  if (iname) {
    for (const branch of COMMON_SCHEMA.allOf) {
      if (branch.if.properties?.INTERFACE_NAME?.const === iname) {
        const subSchema = resolveRef(branch.then.$ref, COMMON_SCHEMA);
        if (subSchema) {
          routedTo = subSchema;
          const l2 = validateAgainstSchema(payload, subSchema, COMMON_SCHEMA);
          for (const e of l2.errors) {
            if (!allErrors.find(x => x.field === e.field && x.rule === e.rule)) {
              const tagged = { ...e, layer: 2, layerLabel: subSchema.title };
              layer2Errors.push(tagged);
              allErrors.push(tagged);
            }
          }
        }
        break;
      }
    }
  }

  return { parseError: null, errors: allErrors, warnings: allWarnings, routedTo, layer1Errors, layer2Errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED CONSTANTS  — built from COMMON_SCHEMA at runtime, no hardcoding
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DERIVED CONSTANTS  — built from COMMON_SCHEMA after it loads from the API
// ─────────────────────────────────────────────────────────────────────────────
let ROUTABLE_NAMES = new Set();
let IFACE_COLOURS  = {};
let INTERFACES     = [];

function _initDerivedConstants() {
  ROUTABLE_NAMES = new Set(
    COMMON_SCHEMA.allOf.map(b => b.if.properties.INTERFACE_NAME.const)
  );
  IFACE_COLOURS = Object.fromEntries(
    Object.entries(COMMON_SCHEMA.$defs).map(([key, def]) => [
      def["x-interface-num"], def["x-color"] ?? "#4b5563"
    ])
  );
  INTERFACES = COMMON_SCHEMA["x-meta"].interfaces.map((m) => ({
    num:      m.num,
    name:     m.name,
    title:    m.title || `Interface ${m.num}`,
    desc:     m.description || "",
    color:    m.color ?? IFACE_COLOURS[m.num] ?? "#4b5563",
    routed:   ROUTABLE_NAMES.has(m.name),
    fields:   Object.keys(COMMON_SCHEMA.$defs[`Interface${m.num}`]?.properties ?? {}),
    required: COMMON_SCHEMA.$defs[`Interface${m.num}`]?.required ?? [],
  }));
}

const ICON_MAP = {
  "1":"📦","2":"🔬","3":"👥","4":"🏭","5":"📥","6":"🌍","7":"↩️","8":"↩️",
  "9":"🚚","10":"🚚","11":"🚚","12":"🛤️","15":"🔄","17":"↪️","18":"📤",
  "19":"⏳","20":"📦","21":"🌐","22":"⚖️","23":"🗺️","24.1":"🗺️","24.2":"🗺️",
  "25":"📋","26.1":"🔧","26.2":"🔧","27":"🔩","29":"✏️","30":"✅","31":"🚫",
  "32":"🚪","33":"❌","44":"🗓️","45":"🚗","47":"✔️","64":"🔐","66":"🛣️",
  "67":"🚫","71":"📂","72":"🔑","73":"📜",
};

const RULE_COLOR = {
  required:"#ef4444", maxLength:"#f59e0b", minLength:"#f59e0b",
  pattern:"#7c3aed", enum:"#06b6d4", type:"#f97316", unknown:"#374151",
};
const ruleColor = (rule) => RULE_COLOR[rule] ?? "#4b5563";

const LAYER_STYLE = {
  1: { color:"#3b82f6", bg:"#ddeaf7", label:"L1 · FIREWALL",    icon:"🔥" },
  2: { color:"#7c3aed", bg:"#ece8f8", label:"L2 · COMPLETENESS", icon:"📋" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE PAYLOADS  — one valid + one invalid per routable interface
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLES = {
  // IF-2 Quality Inspection
  if2_pass: { label:"IF-2 Quality ✓", iface:"2", payload: JSON.stringify({
    INTERFACE_NAME:"ZQM_WMS_INSPECTION_OUTBOUND",
    ID:"0000000000000001", PLANT:"ATAL", DATE:"20240601", TIME:"090000",
    CONSIGNEE:"IDF", INSPECTION_LOT:"300000001234", MATERIAL:"5000099887",
    VENDOR_ID:"V001", MANUFACTURE_DATE:"20240101", EVALUATION_CODE:"A"
  }, null, 2)},
  if2_fail: { label:"IF-2 Quality ✗", iface:"2", payload: JSON.stringify({
    INTERFACE_NAME:"ZQM_WMS_INSPECTION_OUTBOUND",
    ID:"9".repeat(20), PLANT:"AT", DATE:"BADDATE",
    CONSIGNEE:"IDF", INSPECTION_LOT:"300000001234",
    VENDOR_ID:"V001", MANUFACTURE_DATE:"20240101"
  }, null, 2)},

  // IF-3 Customers
  if3_pass: { label:"IF-3 Customers ✓", iface:"3", payload: JSON.stringify({
    INTERFACE_NAME:"ZSDWMS_CUST_OUTBOUND",
    ID:"0000000000000002", PLANT:"ATAL", DATE:"20240701", TIME:"120000",
    CONSIGNEE:"ATAL", CUSTOMER_ID:"C0001", CUSTOMER_NAME:"Unit Alpha",
    CUSTOMER_TYPE:"01", STORAGE_LOCATION:"SL01",
    STORAGE_LOCATION_TYPE:"WH", STORAGE_LOCATION_TYPE_DESC:"Main Warehouse"
  }, null, 2)},
  if3_fail: { label:"IF-3 Customers ✗", iface:"3", payload: JSON.stringify({
    INTERFACE_NAME:"ZSDWMS_CUST_OUTBOUND",
    ID:"0000000000000003", PLANT:"AT", DATE:"20240701", TIME:"120000",
    CONSIGNEE:"ATAL"
  }, null, 2)},

  // IF-4 Vendors
  if4_pass: { label:"IF-4 Vendors ✓", iface:"4", payload: JSON.stringify({
    INTERFACE_NAME:"ZPUR_WMS_VEND_OUTBOUND",
    ID:"0000000000000004", PLANT:"ATAL", DATE:"20240801", TIME:"080000",
    CONSIGNEE:"IDF", VENDOR_ID:"V0042", CUSTOMER_NAME:"Acme Supplies Ltd",
    CUSTOMER_TYPE:"03", STORAGE_LOCATION:"SL99",
    STORAGE_LOCATION_TYPE:"VEND", STORAGE_LOCATION_TYPE_DESC:"Vendor Dock"
  }, null, 2)},
  if4_fail: { label:"IF-4 Vendors ✗", iface:"4", payload: JSON.stringify({
    INTERFACE_NAME:"ZPUR_WMS_VEND_OUTBOUND",
    ID:"0000000000000004", DATE:"20240801", TIME:"080000",
    CONSIGNEE:"IDF"
  }, null, 2)},

  // IF-26.2 Work Instructions
  if262_pass: { label:"IF-26.2 WorkInstr ✓", iface:"26.2", payload: JSON.stringify({
    INTERFACE_NAME:"ZIM_WMS_WORK_INSTRUCTIONS",
    ID:"0000000000000026", PLANT:"ATAL", DATE:"20240901", TIME:"093000",
    CONSIGNEE:"IDF", ORDER_NUMBER:"WO-2024-00026", CREATE_DATE:"20240901",
    CREATE_TIME:"093000", WMS_DOC_TYPE:"WI", MATERIAL:"5000011111"
  }, null, 2)},
  if262_fail: { label:"IF-26.2 WorkInstr ✗", iface:"26.2", payload: JSON.stringify({
    INTERFACE_NAME:"ZIM_WMS_WORK_INSTRUCTIONS",
    ID:"0000000000000026", DATE:"NOTADATE", TIME:"BADTIME",
    CONSIGNEE:"INVALID_CONSIGNEE_TOO_LONG_VALUE"
  }, null, 2)},

  // IF-27 Kit Work Orders
  if27_pass: { label:"IF-27 Kit ✓", iface:"27", payload: JSON.stringify({
    INTERFACE_NAME:"ZMM_WMS_ORDER_KIT_CREATE",
    ID:"0000000000000027", PLANT:"ATAL", DATE:"20240801", TIME:"080000",
    CONSIGNEE:"IDF", CREATE_TIME:"080000", CREATE_DATE:"20240801",
    ORDER_NUMBER:"K-2024-00001", END_DATE:"20240831", WMS_DOC_TYPE:"KIT_WO",
    RECEIVING_PLANT:"ATAL", ORDER_INTOF:"0001", FROM_MATERIAL:"MAT-KIT-001",
    FROM_ORDER_QTY:"10.000", ISSUE_STLOC:"ISS1", KIT_LOCATION:"KIT1",
    RECIVING_STLOC:"REC1", TO_MATERIAL:"MAT-OUT-001", TO_ORDER_QTY:"10.000",
    ORDER_INTOT:"0001"
  }, null, 2)},
  if27_fail: { label:"IF-27 Kit ✗", iface:"27", payload: JSON.stringify({
    INTERFACE_NAME:"ZMM_WMS_ORDER_KIT_CREATE",
    ID:"0000000000000027", PLANT:"TOOLONGPLANT", DATE:"BADDATE", TIME:"BADT",
    CONSIGNEE:"IDF"
  }, null, 2)},

  // IF-44 Appointment Entry Response
  if44_pass: { label:"IF-44 Appt ✓", iface:"44", payload: JSON.stringify({
    INTERFACE_NAME:"APPOINTMENT_ENTRY_RESPONSE",
    ID:"0000000000000044", PLANT:"ATAL", DATE:"20241010", TIME:"093000",
    CONSIGNEE:"ATAL", AppointmentID:"APPT-2024-0001", Status:"1", ReasonCode:"", Notes:"Gate approved"
  }, null, 2)},
  if44_fail: { label:"IF-44 Appt ✗", iface:"44", payload: JSON.stringify({
    INTERFACE_NAME:"APPOINTMENT_ENTRY_RESPONSE",
    DATE:"20241010", TIME:"093000",
    AppointmentID:"APPT-2024-0001"
  }, null, 2)},

  // IF-47 Vehicle Exit Approval
  if47_pass: { label:"IF-47 Vehicle ✓", iface:"47", payload: JSON.stringify({
    INTERFACE_NAME:"VEHICLE_EXIT_APPROVAL",
    ID:"0000000000000047", PLANT:"ATAL", DATE:"20241115", TIME:"140000",
    CONSIGNEE:"IDF", AppointmentID:"VEH-2024-0047", Status:"1"
  }, null, 2)},
  if47_fail: { label:"IF-47 Vehicle ✗", iface:"47", payload: JSON.stringify({
    INTERFACE_NAME:"VEHICLE_EXIT_APPROVAL",
    DATE:"20241115",
    AppointmentID:"VEH-2024-0047"
  }, null, 2)},

  // IF-72 Equipment Status
  if72_pass: { label:"IF-72 Equip ✓", iface:"72", payload: JSON.stringify({
    INTERFACE_NAME:"ZPM_EQUIPMENT_STATUS_NIPUK",
    ID:"0000000000000072", PLANT:"ATAL", DATE:"20241201", TIME:"070000",
    CONSIGNEE:"IDF"
  }, null, 2)},
  if72_fail: { label:"IF-72 Equip ✗", iface:"72", payload: JSON.stringify({
    INTERFACE_NAME:"ZPM_EQUIPMENT_STATUS_NIPUK",
    ID:"X".repeat(25), PLANT:"ATAL", DATE:"WRONG", TIME:"WRONG",
    CONSIGNEE:"NOT_VALID_AT_ALL"
  }, null, 2)},

  // Edge cases
  no_iface: { label:"✗ Missing IF_NAME", iface:null, payload: JSON.stringify(
    { ID:"123", PLANT:"ATAL", DATE:"20240315" }, null, 2)},
  unknown_iface: { label:"✗ Unknown IF", iface:null, payload: JSON.stringify({
    INTERFACE_NAME:"DOES_NOT_EXIST", DATE:"20241010", TIME:"093000"
  }, null, 2)},
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYER LEGEND
// ─────────────────────────────────────────────────────────────────────────────
function LayerLegend() {
  const meta = COMMON_SCHEMA["x-meta"];
  const stats = [
    { val: Object.keys(COMMON_SCHEMA.properties).length, label:"CATALOGUE FIELDS", color:"#3b82f6" },
    { val: Object.keys(COMMON_SCHEMA.$defs).length,      label:"INTERFACES",       color:"#8b5cf6" },
    { val: COMMON_SCHEMA.allOf.length,                   label:"ROUTABLE",         color:"#10b981" },
    { val: (meta["interface-count"] || 0) - COMMON_SCHEMA.allOf.length, label:"UNROUTED", color:"#f59e0b" },
  ];
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
      {[1,2].map(l => {
        const s = LAYER_STYLE[l];
        return (
          <div key={l} style={{
            display:"flex", alignItems:"center", gap:8,
            background:s.bg, border:`1px solid ${s.color}40`,
            borderLeft:`3px solid ${s.color}`,
            borderRadius:6, padding:"7px 13px",
          }}>
            <span style={{ fontSize:15 }}>{s.icon}</span>
            <div>
              <div style={{ color:s.color, fontSize:10, fontWeight:700, letterSpacing:2 }}>{s.label}</div>
              <div style={{ color:"#374151", fontSize:9, marginTop:1 }}>
                {l===1 ? "Type · maxLength · pattern · enum  [catalogue-wide]"
                       : "Required fields · interface constraints  [per interface]"}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ marginLeft:"auto", display:"flex", gap:16 }}>
        {stats.map(({val,label,color}) => (
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ color, fontSize:18, fontWeight:700, lineHeight:1 }}>{val}</div>
            <div style={{ color:"#374151", fontSize:8, letterSpacing:1, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
function NetworkDiagram({ routedTo, validationResult, isValidating }) {
  const [showAll, setShowAll] = useState(false);
  const routedNum = routedTo?.["x-interface-num"] ?? null;
  const hasErrors = validationResult?.errors?.length > 0;
  const l1Errs = validationResult?.layer1Errors?.length ?? 0;
  const l2Errs = validationResult?.layer2Errors?.length ?? 0;
  const routableList = INTERFACES.filter(x => x.routed);
  const unroutedList = INTERFACES.filter(x => !x.routed);
  const visibleRouted = showAll ? routableList : routableList.slice(0, 5);

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace" }}>
      {/* SAP → VALIDATOR → WMS pipeline */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ background:"#e8e3d8", border:"1px solid #3d5a7a", borderRadius:8, padding:"10px 18px", flexShrink:0 }}>
          <div style={{ color:"#1d4ed8", fontWeight:700, fontSize:12 }}>SAP ERP</div>
          <div style={{ color:"#374151", fontSize:9, letterSpacing:1, marginTop:2 }}>SENDER</div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4, alignItems:"center" }}>
          <div style={{ color:"#374151", fontSize:9, letterSpacing:2 }}>OUTBOUND PAYLOAD</div>
          <div style={{ width:"100%", height:2, background:"linear-gradient(90deg,#c5d6e8,#b8c9dc,#c5d6e8)", position:"relative" }}>
            {isValidating && (
              <div style={{ position:"absolute", top:-4, left:0, width:10, height:10, borderRadius:"50%",
                background: hasErrors ? "#ef4444":"#22c55e",
                boxShadow:`0 0 10px ${hasErrors?"#ef4444":"#22c55e"}`,
                animation:"slideRight 0.9s ease-in-out" }} />
            )}
          </div>
        </div>

        {/* Layer 1 Firewall */}
        <div style={{
          background:"#f0ebe1",
          border:`2px solid ${isValidating ? (l1Errs > 0 ? "#ef4444":"#3b82f6") : "#ddeaf7"}`,
          borderRadius:10, padding:"10px 16px", flexShrink:0, minWidth:155, position:"relative",
          boxShadow: isValidating ? `0 0 20px ${l1Errs>0?"rgba(239,68,68,0.3)":"rgba(59,130,246,0.3)"}` : "none",
          transition:"all 0.4s",
        }}>
          <div style={{ color:"#3b82f6", fontSize:9, letterSpacing:2, marginBottom:3 }}>🔥 LAYER 1</div>
          <div style={{ color:"#111827", fontSize:12, fontWeight:700 }}>FIREWALL</div>
          <div style={{ color:"#374151", fontSize:10 }}>Catalogue · type · maxLen</div>
          <div style={{ color:"#374151", fontSize:9, marginTop:5 }}>
            {isValidating || validationResult
              ? l1Errs > 0
                ? <span style={{color:"#ef4444"}}>✗ {l1Errs} error{l1Errs!==1?"s":""}</span>
                : <span style={{color:"#22c55e"}}>✓ cleared</span>
              : <span>waiting…</span>}
          </div>
          {isValidating && (
            <div style={{ position:"absolute",top:-1,left:0,right:0,height:2,
              background:"linear-gradient(90deg,transparent,#3b82f6,transparent)",
              animation:"scanLine 0.8s linear infinite" }} />
          )}
        </div>

        <div style={{ flex:"0 0 30px", height:2,
          background: l1Errs > 0 ? "#dc2626" : "linear-gradient(90deg,#c5d9f0,#d5c8f0)",
          position:"relative" }}>
          {l1Errs > 0 && (
            <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
              color:"#ef4444", fontSize:9, whiteSpace:"nowrap" }}>✗ BLOCKED</div>
          )}
        </div>

        {/* Layer 2 App check */}
        <div style={{
          background:"#f0ebe1",
          border:`2px solid ${isValidating ? (l2Errs>0?"#7c3aed":"#22c55e") : "#ece8f8"}`,
          borderRadius:10, padding:"10px 16px", flexShrink:0, minWidth:155, position:"relative",
          boxShadow: isValidating ? `0 0 20px ${l2Errs>0?"rgba(167,139,250,0.3)":"rgba(34,197,94,0.2)"}` : "none",
          opacity: l1Errs > 0 ? 0.45 : 1, transition:"all 0.4s",
        }}>
          <div style={{ color:"#7c3aed", fontSize:9, letterSpacing:2, marginBottom:3 }}>📋 LAYER 2</div>
          <div style={{ color:"#111827", fontSize:12, fontWeight:700 }}>APP CHECK</div>
          <div style={{ color:"#374151", fontSize:10 }}>Completeness · routing</div>
          <div style={{ color:"#374151", fontSize:9, marginTop:5 }}>
            {!routedTo && validationResult
              ? <span style={{color:"#f59e0b"}}>⚠ no routing match</span>
              : l2Errs > 0
                ? <span style={{color:"#7c3aed"}}>✗ {l2Errs} error{l2Errs!==1?"s":""}</span>
                : routedTo
                  ? <span style={{color:"#22c55e"}}>✓ complete</span>
                  : <span>waiting…</span>}
          </div>
        </div>

        <div style={{ flex:"0 0 28px", height:2, background: hasErrors?"#dc2626":"linear-gradient(90deg,#d5c8f0,#c5d6e8)" }} />

        <div style={{
          background:"#e8e3d8", border:`1px solid ${hasErrors?"#dc2626":"#c0b8ad"}`,
          borderRadius:8, padding:"10px 18px", flexShrink:0,
          opacity: hasErrors ? 0.35 : 1, transition:"all 0.4s",
        }}>
          <div style={{ color: hasErrors?"#ef4444":"#14532d", fontWeight:700, fontSize:12 }}>WMS</div>
          <div style={{ color:"#374151", fontSize:9, letterSpacing:1, marginTop:2 }}>
            {hasErrors ? "REJECTED" : "INBOUND"}
          </div>
        </div>
      </div>

      {/* Routing table — routable interfaces */}
      <div style={{ marginBottom:10 }}>
        <div style={{ color:"#374151", fontSize:9, letterSpacing:2, marginBottom:6 }}>
          ── ACTIVE ROUTING TABLE  ({routableList.length} routes) ─────────────────────────
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {visibleRouted.map(iface => {
            const isRouted = routedNum === iface.num;
            return (
              <div key={iface.num} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"6px 12px", borderRadius:6,
                background: isRouted ? `${iface.color}18` : "#ede8df",
                border:`1px solid ${isRouted ? iface.color : "#d9d2c7"}`,
                transition:"all 0.3s",
              }}>
                <span style={{ fontSize:13 }}>{ICON_MAP[iface.num] ?? "🔷"}</span>
                <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                  background: isRouted ? iface.color : "#4b5563",
                  boxShadow: isRouted ? `0 0 8px ${iface.color}` : "none" }} />
                <span style={{ color:"#374151", fontSize:9, width:22, flexShrink:0 }}>IF{iface.num}</span>
                <span style={{ color: isRouted ? iface.color : "#4b5563", fontSize:10, flex:1, fontFamily:"monospace" }}>
                  {iface.name}
                </span>
                <span style={{ color: isRouted?"#111827":"#374151", fontSize:10, flexShrink:0 }}>{iface.title}</span>
                {isRouted && (
                  <span style={{ fontSize:9, color:"#fff",
                    background: hasErrors?"#dc2626":"#15803d",
                    padding:"1px 6px", borderRadius:3 }}>
                    {hasErrors ? "FAIL":"PASS"}
                  </span>
                )}
              </div>
            );
          })}
          {routableList.length > 5 && (
            <button onClick={() => setShowAll(v => !v)} style={{
              background:"transparent", border:"1px dashed #d9d2c7",
              color:"#374151", fontSize:9, borderRadius:5, padding:"4px 10px", cursor:"pointer",
            }}>
              {showAll ? "▲ collapse" : `▼ show ${routableList.length - 5} more routes`}
            </button>
          )}
        </div>
      </div>

      {/* Unrouted summary */}
      <details style={{ marginTop:6 }}>
        <summary style={{ color:"#f59e0b", fontSize:9, letterSpacing:2, cursor:"pointer", userSelect:"none" }}>
          ⚠ UNROUTED INTERFACES ({unroutedList.length}) — INTERFACE_NAME not yet assigned in schema_data.json
        </summary>
        <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:5 }}>
          {unroutedList.map(i => (
            <span key={i.num} style={{ fontSize:9, padding:"2px 8px", borderRadius:10,
              background:"#fffbeb", border:"1px solid #f59e0b40", color:"#78350f" }}>
              {ICON_MAP[i.num] ?? "🔷"} IF{i.num} {i.title}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RESULTS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ValidationResults({ result }) {
  if (!result) return (
    <div style={{ color:"#374151", fontSize:12, textAlign:"center", padding:"40px 0",
      fontFamily:"'JetBrains Mono',monospace" }}>
      ← Send a payload to validate
    </div>
  );
  if (result.parseError) return (
    <div style={{ color:"#ef4444", fontSize:12, padding:12, background:"#fef2f2",
      border:"1px solid #7f1d1d", borderRadius:6, fontFamily:"monospace" }}>
      {result.parseError}
    </div>
  );

  const { errors, warnings, routedTo, layer1Errors, layer2Errors } = result;
  const passed = errors.length === 0;

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", fontSize:12 }}>
      <div style={{
        display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
        background: passed ? "#f0fdf4" : "#fef2f2",
        border:`1px solid ${passed ? "#166534" : "#dc2626"}`,
        borderRadius:8, marginBottom:12,
      }}>
        <div style={{ fontSize:20 }}>{passed ? "✅" : "❌"}</div>
        <div>
          <div style={{ color: passed ? "#22c55e" : "#ef4444", fontWeight:700, fontSize:13 }}>
            {passed ? "VALIDATION PASSED" : `VALIDATION FAILED  (${errors.length} error${errors.length!==1?"s":""})`}
          </div>
          <div style={{ color:"#374151", fontSize:10, marginTop:2 }}>
            {routedTo
              ? `Routed → IF-${routedTo["x-interface-num"]} ${routedTo["x-interface-name"]} — ${routedTo.title}`
              : "No routing — INTERFACE_NAME missing or not in allOf branches"}
          </div>
        </div>
        {warnings.length > 0 && (
          <div style={{ marginLeft:"auto", color:"#f59e0b", fontSize:11 }}>
            ⚠ {warnings.length} warn{warnings.length!==1?"s":""}
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {[1,2].map(l => {
          const s = LAYER_STYLE[l];
          const cnt = l===1 ? layer1Errors?.length : layer2Errors?.length;
          return (
            <div key={l} style={{
              background:s.bg, border:`1px solid ${s.color}50`,
              borderLeft:`3px solid ${s.color}`, borderRadius:5,
              padding:"5px 10px", flex:1,
            }}>
              <div style={{ color:s.color, fontSize:9, letterSpacing:2 }}>{s.label}</div>
              <div style={{ color: cnt>0?"#7f1d1d":"#14532d", fontSize:12, fontWeight:700, marginTop:2 }}>
                {cnt} error{cnt!==1?"s":""}
              </div>
            </div>
          );
        })}
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ color:"#374151", fontSize:10, letterSpacing:2, marginBottom:6 }}>ERRORS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:300, overflowY:"auto" }}>
            {errors.map((e, i) => {
              const ls = LAYER_STYLE[e.layer] ?? LAYER_STYLE[1];
              return (
                <div key={i} style={{
                  display:"flex", gap:8, alignItems:"flex-start",
                  padding:"6px 10px", borderRadius:5,
                  background:"#ede8df",
                  border:`1px solid ${ruleColor(e.rule)}20`,
                  borderLeft:`3px solid ${ruleColor(e.rule)}`,
                }}>
                  <span style={{ color:ls.color, fontSize:8, padding:"2px 5px",
                    background:`${ls.color}15`, borderRadius:3, flexShrink:0, marginTop:1, whiteSpace:"nowrap" }}>
                    {ls.label}
                  </span>
                  <span style={{ color:ruleColor(e.rule), fontSize:9, padding:"2px 5px",
                    background:`${ruleColor(e.rule)}15`, borderRadius:3, flexShrink:0, marginTop:1 }}>
                    {e.rule.toUpperCase()}
                  </span>
                  <div style={{ flex:1 }}>
                    <span style={{ color:"#4b5563", fontWeight:600 }}>{e.field}</span>
                    <span style={{ color:"#374151" }}>  {e.msg}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <div style={{ color:"#374151", fontSize:10, letterSpacing:2, marginBottom:6 }}>WARNINGS</div>
          {warnings.map((w, i) => (
            <div key={i} style={{
              display:"flex", gap:8, padding:"5px 10px", borderRadius:5, marginBottom:3,
              background:"#ede8df", border:"1px solid #78350f30", borderLeft:"3px solid #f59e0b",
            }}>
              <span style={{ color:"#f59e0b", fontSize:9, padding:"1px 5px",
                background:"#f59e0b20", borderRadius:3, flexShrink:0 }}>WARN</span>
              <span style={{ color:"#4b5563" }}>{w.field}</span>
              <span style={{ color:"#374151" }}>{w.msg}</span>
            </div>
          ))}
        </div>
      )}

      {passed && errors.length === 0 && (
        <div style={{ color:"#22c55e", fontSize:12, textAlign:"center", padding:"16px 0" }}>
          ✓ All constraints satisfied — payload cleared for ingestion
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH TEST PANEL — runs every sample and summarises
// ─────────────────────────────────────────────────────────────────────────────
function BatchTest({ onLoadSample }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  function runAll() {
    setRunning(true);
    setTimeout(() => {
      const out = Object.entries(SAMPLES).map(([key, s]) => {
        const r = runValidation(s.payload);
        return {
          key, label: s.label, iface: s.iface,
          passed: !r.parseError && r.errors.length === 0,
          errors: r.errors.length, warnings: r.warnings.length,
          parseError: r.parseError,
          routed: !!r.routedTo,
          routedName: r.routedTo?.["x-interface-name"] ?? null,
        };
      });
      setResults(out);
      setRunning(false);
    }, 300);
  }

  const passed = results?.filter(r => r.passed).length ?? 0;
  const failed = results?.filter(r => !r.passed).length ?? 0;

  return (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
        <button onClick={runAll} disabled={running} style={{
          background: running ? "#d9d2c7" : "linear-gradient(135deg,#1e3a5f,#2d1e4f)",
          color: running ? "#9ca3af":"#fff",
          border:"1px solid #3b82f6", borderRadius:6, padding:"5px 16px",
          cursor: running?"not-allowed":"pointer", fontSize:11, fontWeight:700, letterSpacing:1,
        }}>
          {running ? "RUNNING…" : `▶ RUN ALL ${Object.keys(SAMPLES).length} SAMPLES`}
        </button>
        {results && (
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ color:"#22c55e", fontSize:12, fontWeight:700 }}>✅ {passed} PASS</span>
            <span style={{ color:"#ef4444", fontSize:12, fontWeight:700 }}>❌ {failed} FAIL</span>
          </div>
        )}
      </div>

      {results && (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {results.map(r => (
            <div key={r.key} style={{
              display:"flex", gap:10, alignItems:"center", padding:"7px 12px",
              borderRadius:6, background:"#ede8df",
              border:`1px solid ${r.passed?"#16653440":"#dc262630"}`,
              borderLeft:`3px solid ${r.passed?"#22c55e":"#ef4444"}`,
            }}>
              <span style={{ fontSize:12 }}>{r.passed?"✅":"❌"}</span>
              <span style={{ color:"#111827", fontWeight:600, flex:"0 0 200px", fontSize:10 }}>{r.label}</span>
              <span style={{ flex:1, color:"#4b5563", fontSize:9 }}>
                {r.parseError ? r.parseError
                  : r.routed ? `→ ${r.routedName}` : "⚠ unrouted"}
              </span>
              {!r.passed && (
                <span style={{ color:"#ef4444", fontSize:9, flexShrink:0 }}>
                  {r.errors} err{r.errors!==1?"s":""}
                </span>
              )}
              {r.warnings > 0 && (
                <span style={{ color:"#f59e0b", fontSize:9, flexShrink:0 }}>
                  {r.warnings} warn
                </span>
              )}
              <button onClick={() => onLoadSample(r.key)} style={{
                background:"transparent", border:"1px solid #d9d2c7",
                color:"#374151", fontSize:8, borderRadius:3, padding:"1px 7px", cursor:"pointer",
              }}>load</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
function SchemaExplorer({ activeInterface }) {
  const [tab, setTab] = useState("routing");
  const [ifaceFilter, setIfaceFilter] = useState("");
  const [browseNum, setBrowseNum] = useState(activeInterface ?? INTERFACES[0]?.num ?? "1");
  const iface = COMMON_SCHEMA.$defs[`Interface${browseNum}`];

  // Sync browse pane when validator routes
  useEffect(() => {
    if (activeInterface) { setBrowseNum(activeInterface); setTab("fields"); }
  }, [activeInterface]);

  const tabs = [
    { id:"routing",   label:`Routing (${COMMON_SCHEMA.allOf.length})` },
    { id:"fields",    label:"Interface Fields" },
    { id:"catalogue", label:`Catalogue (${Object.keys(COMMON_SCHEMA.properties).length})` },
    { id:"raw",       label:"JSON Schema" },
  ];

  const filteredInterfaces = INTERFACES.filter(i =>
    !ifaceFilter ||
    i.num.includes(ifaceFilter) ||
    i.title.toLowerCase().includes(ifaceFilter.toLowerCase()) ||
    i.name.toLowerCase().includes(ifaceFilter.toLowerCase())
  );

  return (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>
      <div style={{ display:"flex", gap:4, marginBottom:12, borderBottom:"1px solid #d9d2c7", paddingBottom:8, flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab===t.id ? "#ddeaf7" : "transparent",
            color: tab===t.id ? "#1d4ed8" : "#374151",
            border:`1px solid ${tab===t.id ? "#1d4ed8":"#d9d2c7"}`,
            borderRadius:4, padding:"3px 10px", cursor:"pointer", fontSize:10,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Routing tab ── */}
      {tab==="routing" && (
        <div>
          <div style={{ color:"#374151", fontSize:9, letterSpacing:2, marginBottom:8 }}>
            allOf if/then BRANCHES — {COMMON_SCHEMA.allOf.length} active
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:340, overflowY:"auto" }}>
            {COMMON_SCHEMA.allOf.map((branch, i) => {
              const constVal = branch.if.properties.INTERFACE_NAME.const;
              const ref = branch.then.$ref.replace("#/$defs/","");
              const idata = INTERFACES.find(x => x.name === constVal);
              return (
                <div key={i} style={{ padding:"8px 12px", background:"#ede8df",
                  border:"1px solid #d9d2c7", borderRadius:6, display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ color:"#374151", fontSize:9, flexShrink:0 }}>IF</span>
                  <span style={{ color:"#2563eb", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    &quot;{constVal}&quot;
                  </span>
                  <span style={{ color:"#374151", fontSize:9, flexShrink:0 }}>THEN</span>
                  <div style={{ width:7,height:7,borderRadius:"50%",
                    background:idata?.color??"#374151",flexShrink:0 }} />
                  <span style={{ color:"#7c3aed", flexShrink:0 }}>{ref}</span>
                  <span style={{ color:"#374151", flexShrink:0, fontSize:10 }}>— {idata?.title}</span>
                  <button onClick={() => { setBrowseNum(idata?.num); setTab("fields"); }}
                    style={{ background:"transparent", border:"1px solid #d9d2c7",
                      color:"#374151", fontSize:8, borderRadius:3, padding:"1px 6px",
                      cursor:"pointer", flexShrink:0 }}>fields →</button>
                </div>
              );
            })}
          </div>

          {/* Unrouted list */}
          <div style={{ marginTop:12 }}>
            <div style={{ color:"#f59e0b", fontSize:9, letterSpacing:2, marginBottom:6 }}>
              UNROUTED ({INTERFACES.filter(x=>!x.routed).length} interfaces — no INTERFACE_NAME assigned)
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {INTERFACES.filter(x=>!x.routed).map(i => (
                <button key={i.num} onClick={() => { setBrowseNum(i.num); setTab("fields"); }}
                  style={{ fontSize:9, padding:"2px 8px", borderRadius:10,
                    background:"#fffbeb", border:"1px solid #f59e0b40", color:"#78350f",
                    cursor:"pointer" }}>
                  IF{i.num} {i.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Interface Fields tab ── */}
      {tab==="fields" && (
        <div>
          {/* Interface picker */}
          <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
            <input
              placeholder="Filter interfaces…"
              value={ifaceFilter}
              onChange={e => setIfaceFilter(e.target.value)}
              style={{ flex:1, background:"#faf7f0", border:"1px solid #d9d2c7",
                borderRadius:4, padding:"3px 8px", fontSize:10, color:"#374151",
                fontFamily:"inherit", outline:"none" }}
            />
            <select value={browseNum} onChange={e => setBrowseNum(e.target.value)}
              style={{ flex:2, background:"#faf7f0", border:"1px solid #d9d2c7",
                borderRadius:4, padding:"3px 8px", fontSize:10, color:"#374151",
                fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
              {filteredInterfaces.map(i => (
                <option key={i.num} value={i.num}>
                  IF-{i.num}  {i.routed?"🟢":"🟡"}  {i.title}  ({i.fields.length} fields, {i.required.length} req)
                </option>
              ))}
            </select>
          </div>

          {iface ? (
            <div>
              {/* Interface header */}
              <div style={{ marginBottom:8, padding:"8px 12px", borderRadius:6,
                background: INTERFACES.find(x=>x.num===browseNum)?.routed ? "#f0fdf4":"#fffbeb",
                border:`1px solid ${INTERFACES.find(x=>x.num===browseNum)?.routed?"#16653440":"#f59e0b40"}` }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:16 }}>{ICON_MAP[browseNum] ?? "🔷"}</span>
                  <div>
                    <div style={{ color:"#111827", fontWeight:700, fontSize:12 }}>{iface.title}</div>
                    <div style={{ color:"#374151", fontSize:9, marginTop:2 }}>
                      {iface["x-description"] || iface["x-interface-name"] || "—"}
                    </div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:12 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ color:"#22c55e", fontWeight:700 }}>{iface.required?.length ?? 0}</div>
                      <div style={{ color:"#374151", fontSize:8 }}>REQUIRED</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ color:"#374151", fontWeight:700 }}>
                        {Object.keys(iface.properties ?? {}).length - (iface.required?.length ?? 0)}
                      </div>
                      <div style={{ color:"#374151", fontSize:8 }}>OPTIONAL</div>
                    </div>
                  </div>
                </div>
                {iface["x-interface-name"] && (
                  <div style={{ marginTop:6, padding:"3px 8px", background:"#e0f2fe",
                    borderRadius:3, fontSize:9, color:"#0369a1", display:"inline-block" }}>
                    INTERFACE_NAME = &quot;{iface["x-interface-name"]}&quot;
                  </div>
                )}
              </div>

              {/* Field table */}
              <div style={{ maxHeight:300, overflowY:"auto" }}>
                <div style={{ display:"grid", gridTemplateColumns:"12px 1fr 100px 1fr",
                  gap:4, padding:"3px 0", borderBottom:"1px solid #d9d2c7",
                  color:"#374151", fontSize:8, letterSpacing:1, marginBottom:3 }}>
                  <span/>
                  <span>FIELD</span>
                  <span>CONSTRAINTS</span>
                  <span>DESCRIPTION</span>
                </div>
                {Object.entries(iface.properties ?? {}).map(([fname, prop]) => {
                  const isReq = iface.required?.includes(fname);
                  const constraints = [];
                  if (prop.maxLength) constraints.push(`max:${prop.maxLength}`);
                  if (prop.minLength) constraints.push(`min:${prop.minLength}`);
                  if (prop.pattern)   constraints.push("pattern");
                  if (prop.enum)      constraints.push(`enum:${prop.enum.slice(0,3).join(",")}${prop.enum.length>3?"…":""}`);
                  return (
                    <div key={fname} style={{ display:"grid", gridTemplateColumns:"12px 1fr 100px 1fr",
                      gap:4, padding:"4px 0", borderBottom:"1px solid #ede8df", alignItems:"start" }}>
                      <div style={{ width:7,height:7,borderRadius:"50%",marginTop:2,flexShrink:0,
                        background: isReq ? "#22c55e":"#9ca3af" }} />
                      <span style={{ color: isReq?"#1d4ed8":"#4b5563", fontSize:10, fontWeight: isReq?600:400 }}>{fname}</span>
                      <span style={{ color:"#6b7280", fontSize:9 }}>{constraints.join(" ")}</span>
                      <span style={{ color:"#374151", fontSize:9, overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {prop.description ?? ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ color:"#374151", fontSize:11, padding:"20px 0", textAlign:"center" }}>
              Interface {browseNum} not found in schema
            </div>
          )}
        </div>
      )}

      {/* ── Catalogue tab ── */}
      {tab==="catalogue" && (() => {
        const [catFilter, setCatFilter] = useState("");
        const allFields = Object.entries(COMMON_SCHEMA.properties);
        const filtered = catFilter
          ? allFields.filter(([k]) => k.toLowerCase().includes(catFilter.toLowerCase()))
          : allFields;
        return (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
              <input
                placeholder={`Filter ${allFields.length} fields…`}
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                style={{ flex:1, background:"#faf7f0", border:"1px solid #d9d2c7",
                  borderRadius:4, padding:"3px 8px", fontSize:10, color:"#374151",
                  fontFamily:"inherit", outline:"none" }}
              />
              <span style={{ color:"#374151", fontSize:9 }}>{filtered.length} shown</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 1fr",
              gap:4, padding:"3px 0", borderBottom:"1px solid #d9d2c7",
              color:"#374151", fontSize:8, letterSpacing:1, marginBottom:3 }}>
              <span>FIELD</span><span>CONSTRAINTS</span><span>DESCRIPTION</span>
            </div>
            <div style={{ maxHeight:300, overflowY:"auto" }}>
              {filtered.map(([fname, prop]) => (
                <div key={fname} style={{ display:"grid", gridTemplateColumns:"1fr 130px 1fr",
                  gap:4, padding:"3px 0", borderBottom:"1px solid #ede8df", alignItems:"start" }}>
                  <span style={{ color:"#2563eb", fontSize:10 }}>{fname}</span>
                  <span style={{ color:"#6b7280", fontSize:9 }}>
                    {[
                      prop.maxLength ? `max:${prop.maxLength}` : "",
                      prop.minLength ? `min:${prop.minLength}` : "",
                      prop.pattern   ? "pattern" : "",
                      prop.enum      ? `enum(${prop.enum.length})` : "",
                    ].filter(Boolean).join(" ")}
                  </span>
                  <span style={{ color:"#374151", fontSize:9, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {prop.description ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Raw JSON tab ── */}
      {tab==="raw" && (
        <pre style={{ color:"#374151", fontSize:10, margin:0, overflowX:"auto",
          background:"#ede8df", padding:10, borderRadius:6, maxHeight:340, overflowY:"auto" }}>
{JSON.stringify({
  "$schema": COMMON_SCHEMA.$schema,
  "$id": COMMON_SCHEMA.$id,
  "title": COMMON_SCHEMA.title,
  "required": COMMON_SCHEMA.required,
  "properties": `{ /* ${Object.keys(COMMON_SCHEMA.properties).length} catalogue fields */ }`,
  "allOf": COMMON_SCHEMA.allOf.map(b=>({
    if: `INTERFACE_NAME == "${b.if.properties.INTERFACE_NAME.const}"`,
    then: b.then.$ref,
  })),
  "$defs": Object.fromEntries(
    Object.entries(COMMON_SCHEMA.$defs).map(([k,v])=>[k,{
      title: v.title,
      "x-interface-name": v["x-interface-name"] || "(not assigned)",
      "x-description": v["x-description"] || "",
      required: v.required ?? [],
      properties: `{ /* ${Object.keys(v.properties??{}).length} fields */ }`,
    }])
  ),
  "x-meta": COMMON_SCHEMA["x-meta"],
}, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
function ValidatorApp({ token }) {
  // ALL hooks must be at the top — React forbids hooks after a conditional return
  const [schemaReady, setSchemaReady]         = useState(false);
  const [schemaError, setSchemaError]         = useState(null);
  const [payloadText, setPayloadText]         = useState("");
  const [result, setResult]                   = useState(null);
  const [isValidating, setIsValidating]       = useState(false);
  const [activeInterface, setActiveInterface] = useState(null);
  const [mainTab, setMainTab]                 = useState("validator");

  // Fetch schema from API once on mount
  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:8001/api/schema", { headers })
      .then(r => {
        if (!r.ok) throw new Error(`Schema fetch failed: ${r.status}`);
        return r.json();
      })
      .then(data => {
        COMMON_SCHEMA = data;
        _initDerivedConstants();
        setPayloadText(SAMPLES.if2_pass.payload);
        setSchemaReady(true);
      })
      .catch(e => setSchemaError(e.message));
  }, [token]);

  const validate = useCallback(() => {
    setIsValidating(true);
    setTimeout(() => {
      const r = runValidation(payloadText);
      setResult(r);
      setActiveInterface(r.routedTo?.["x-interface-num"] ?? null);
      setIsValidating(false);
    }, 400);
  }, [payloadText]);

  useEffect(() => { if (schemaReady) validate(); }, [schemaReady]);

  // Show spinner while schema is loading
  if (!schemaReady) {
    return (
      <div style={{
        minHeight:"100vh", display:"grid", placeItems:"center",
        background:"#faf7f0", fontFamily:"'JetBrains Mono','Courier New',monospace",
        color:"#4b5563", fontSize:13,
      }}>
        {schemaError
          ? <div style={{ color:"#dc2626", textAlign:"center", maxWidth:420, lineHeight:1.6 }}>
              ⚠ {schemaError}
              {!token && <div style={{ marginTop:8, color:"#9ca3af", fontSize:11 }}>
                The backend may require authentication to serve the schema.<br/>
                Try logging in normally, or check that <code>GET /api/schema</code> allows unauthenticated access.
              </div>}
            </div>
          : <div>Loading schema…</div>
        }
      </div>
    );
  }

  const passed = result && !result.parseError && result.errors.length === 0;

  function loadSample(key) {
    const s = SAMPLES[key];
    if (!s) return;
    setPayloadText(s.payload);
    setResult(null);
    setActiveInterface(null);
    setMainTab("validator");
  }

  // Sample buttons grouped by interface
  const sampleEntries = Object.entries(SAMPLES);
  const passSamples = sampleEntries.filter(([k]) => k.endsWith("_pass") || k==="no_iface"||k==="unknown_iface");
  const failSamples = sampleEntries.filter(([k]) => k.endsWith("_fail"));

  return (
    <div style={{
      background:"#faf7f0", minHeight:"100vh", color:"#4b5563",
      fontFamily:"'JetBrains Mono','Courier New',monospace", padding:20,
    }}>
      <style>{`
        @keyframes slideRight { from{left:0%} to{left:95%} }
        @keyframes scanLine   { from{left:-100%} to{left:100%} }
        ::-webkit-scrollbar       { width:4px; height:4px; background:#ede8df; }
        ::-webkit-scrollbar-thumb { background:#d9d2c7; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:16, display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:4, height:40, background:"linear-gradient(180deg,#3b82f6,#8b5cf6)", borderRadius:2 }} />
          <div>
            <div style={{ color:"#111827", fontSize:17, fontWeight:700, letterSpacing:1 }}>
              WMS–SAP PAYLOAD VALIDATOR
            </div>
            <div style={{ color:"#374151", fontSize:9, marginTop:3, letterSpacing:2 }}>
              {COMMON_SCHEMA.$id}  ·  JSON Schema Draft 2020-12  ·  {COMMON_SCHEMA["x-meta"]["generated-at"]?.slice(0,10)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Layer legend */}
      <div style={{ background:"#f5f0e8", border:"1px solid #d9d2c7", borderRadius:10,
        padding:"12px 16px", marginBottom:14 }}>
        <LayerLegend />
      </div>

      {/* Main tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:14 }}>
        {[
          { id:"validator", label:"▶ Validator" },
          { id:"network",   label:"🕸 Network" },
          { id:"batch",     label:`⚡ Batch (${Object.keys(SAMPLES).length})` },
          { id:"explorer",  label:"🔍 Schema Explorer" },
        ].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} style={{
            background: mainTab===t.id ? "#1e3a5f" : "#f5f0e8",
            color: mainTab===t.id ? "#fff" : "#374151",
            border:`1px solid ${mainTab===t.id ? "#1e3a5f":"#d9d2c7"}`,
            borderRadius:6, padding:"6px 16px", cursor:"pointer",
            fontSize:11, fontWeight: mainTab===t.id ? 700 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Validator tab ── */}
      {mainTab==="validator" && (
        <>
          {/* Network diagram — always visible */}
          <div style={{ background:"#f5f0e8", border:"1px solid #1e293b", borderRadius:12,
            padding:18, marginBottom:14 }}>
            <div style={{ color:"#4b5563", fontSize:9, letterSpacing:3, marginBottom:14 }}>
              ◈  NETWORK TOPOLOGY  ·  VALIDATION PIPELINE
            </div>
            <NetworkDiagram
              routedTo={result?.routedTo}
              validationResult={result}
              isValidating={isValidating}
            />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            {/* Payload editor */}
            <div style={{ background:"#f5f0e8", border:"1px solid #1e293b", borderRadius:12, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ color:"#374151", fontSize:9, letterSpacing:3 }}>◈  PAYLOAD INPUT</div>
                <button onClick={validate} disabled={isValidating} style={{
                  background: isValidating ? "#d9d2c7":"linear-gradient(135deg,#1e3a5f,#2d1e4f)",
                  color: isValidating ? "#9ca3af":"#fff",
                  border:`1px solid ${isValidating?"#4b5563":"#3b82f6"}`,
                  borderRadius:6, padding:"5px 16px", cursor: isValidating?"not-allowed":"pointer",
                  fontSize:11, fontWeight:700, letterSpacing:1,
                }}>
                  {isValidating ? "VALIDATING…":"▶  VALIDATE"}
                </button>
              </div>

              {/* Sample buttons */}
              <div style={{ marginBottom:8 }}>
                <div style={{ color:"#374151", fontSize:8, letterSpacing:1, marginBottom:4 }}>PASSING SAMPLES</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                  {passSamples.map(([key,s]) => (
                    <button key={key} onClick={() => loadSample(key)} style={{
                      background:"#f0fdf4", color:"#15803d",
                      border:"1px solid #16653440", borderRadius:4, padding:"2px 8px",
                      cursor:"pointer", fontSize:9,
                    }}>{s.label}</button>
                  ))}
                </div>
                <div style={{ color:"#374151", fontSize:8, letterSpacing:1, marginBottom:4 }}>FAILING SAMPLES</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {failSamples.map(([key,s]) => (
                    <button key={key} onClick={() => loadSample(key)} style={{
                      background:"#fef2f2", color:"#dc2626",
                      border:"1px solid #dc262630", borderRadius:4, padding:"2px 8px",
                      cursor:"pointer", fontSize:9,
                    }}>{s.label}</button>
                  ))}
                </div>
              </div>

              <textarea
                value={payloadText}
                onChange={e => setPayloadText(e.target.value)}
                style={{
                  width:"100%", height:280, background:"#faf7f0",
                  border:"1px solid #1e293b", borderRadius:6, color:"#374151",
                  fontSize:11, padding:12, resize:"vertical", outline:"none",
                  fontFamily:"'JetBrains Mono','Courier New',monospace",
                  lineHeight:1.6, boxSizing:"border-box",
                }}
              />
              <div style={{ color:"#4b5563", fontSize:9, marginTop:4 }}>
                {payloadText.split("\n").length} lines · {payloadText.length} chars
              </div>
            </div>

            {/* Results */}
            <div style={{
              background:"#f5f0e8",
              border:`1px solid ${result ? (passed?"#166534":"#dc2626"):"#d9d2c7"}`,
              borderRadius:12, padding:14, transition:"border-color 0.4s",
            }}>
              <div style={{ color:"#4b5563", fontSize:9, letterSpacing:3, marginBottom:10 }}>◈  VALIDATION RESULTS</div>
              <ValidationResults result={result} />
            </div>
          </div>
        </>
      )}

      {/* ── Network tab ── */}
      {mainTab==="network" && (
        <div style={{ background:"#f5f0e8", border:"1px solid #1e293b", borderRadius:12, padding:18 }}>
          <div style={{ color:"#4b5563", fontSize:9, letterSpacing:3, marginBottom:14 }}>
            ◈  NETWORK TOPOLOGY  ·  VALIDATION PIPELINE
          </div>
          <NetworkDiagram
            routedTo={result?.routedTo}
            validationResult={result}
            isValidating={isValidating}
          />
        </div>
      )}

      {/* ── Batch tab ── */}
      {mainTab==="batch" && (
        <div style={{ background:"#f5f0e8", border:"1px solid #1e293b", borderRadius:12, padding:18 }}>
          <div style={{ color:"#4b5563", fontSize:9, letterSpacing:3, marginBottom:14 }}>
            ◈  BATCH TEST RUNNER
          </div>
          <BatchTest onLoadSample={loadSample} />
        </div>
      )}

      {/* ── Explorer tab ── */}
      {mainTab==="explorer" && (
        <div style={{ background:"#f5f0e8", border:"1px solid #1e293b", borderRadius:12, padding:18 }}>
          <div style={{ color:"#4b5563", fontSize:9, letterSpacing:3, marginBottom:14 }}>
            ◈  SCHEMA EXPLORER  {activeInterface && `— IF-${activeInterface} active`}
          </div>
          <SchemaExplorer activeInterface={activeInterface} />
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop:12, display:"flex", justifyContent:"space-between",
        color:"#6b7280", fontSize:9, letterSpacing:1, flexWrap:"wrap", gap:4 }}>
        <span>{COMMON_SCHEMA.$id}</span>
        <span>
          L1: catalogue firewall  ·  L2: if/then interface completeness  ·
          {COMMON_SCHEMA["x-meta"]["interface-count"]} interfaces  ·  {COMMON_SCHEMA.allOf.length} routable
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTER  —  wraps the validator
// This is the new top-level App. The validator above is now called ValidatorApp.
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  _injectAuthStyles();

  const [screen, setScreen]         = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [token, setToken]           = useState(() => localStorage.getItem("wms_token"));
  const [user,  setUser]            = useState(null);
  const [bypass, setBypass]         = useState(() => localStorage.getItem("wms_dev_bypass") === "1");

  // Fetch /me whenever token changes — validates the token is still good
  // Guard: only clear token on explicit 401, not on network/parse errors (avoids race on slow backends)
  useEffect(() => {
    if (!token) { setUser(null); return; }
    fetch(`${API_AUTH}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 401) throw new Error("unauthorized");
        if (!r.ok) return null;          // backend hiccup — keep token, don't wipe session
        return r.json();
      })
      .then(data => { if (data) setUser(data); })
      .catch(err => {
        if (err.message === "unauthorized") {
          localStorage.removeItem("wms_token");
          setToken(null);
        }
        // any other error (CORS, network, JSON parse) → stay logged in
      });
  }, [token]);

  const handleLogin  = useCallback(t => setToken(t), []);
  const handleLogout = useCallback(() => {
    localStorage.removeItem("wms_token");
    localStorage.removeItem("wms_dev_bypass");
    setToken(null);
    setBypass(false);
    setScreen("login");
  }, []);

  const handleBypass = useCallback(() => {
    localStorage.setItem("wms_dev_bypass", "1");
    setBypass(true);
  }, []);

  // ── Dev bypass ─────────────────────────────────────────────────────────────
  if (bypass) {
    return (
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <div className="auth-topnav">
          <div className="auth-topnav-brand">
            <div className="auth-topnav-dot" />
            WMS Validator
          </div>
          <div className="auth-topnav-spacer" />
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#f0b429", marginRight:12 }}>
            ⚡ DEV BYPASS
          </span>
          <button className="auth-btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
        <div style={{ flex:1 }}>
          <ValidatorApp token={token} />
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (token) {
    return (
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <_TopNav user={user} onLogout={handleLogout} />
        <div style={{ flex:1 }}>
          <ValidatorApp token={token} />
        </div>
      </div>
    );
  }

  // ── Auth screens ───────────────────────────────────────────────────────────
  if (screen === "register")
    return <_RegisterScreen onLogin={handleLogin} goLogin={() => setScreen("login")} />;

  if (screen === "forgot")
    return <_ForgotScreen
      goLogin={() => setScreen("login")}
      goReset={(em, tok) => { setResetEmail(em); setResetToken(tok); setScreen("reset"); }}
    />;

  if (screen === "reset")
    return <_ResetScreen
      prefillEmail={resetEmail} prefillToken={resetToken}
      goLogin={() => setScreen("login")}
    />;

  return <_LoginScreen onLogin={handleLogin}
    goRegister={() => setScreen("register")}
    goForgot={() => setScreen("forgot")}
    onBypass={handleBypass} />;
}