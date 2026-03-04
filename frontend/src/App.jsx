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

function _LoginScreen({ onLogin, goRegister, goForgot }) {
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
const COMMON_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:wms:sap:common-payload-schema:v1",
  "title": "WMS–SAP Common Payload Schema",
  "description": "Master validation schema for all WMS↔SAP interface payloads. Layer 1 (properties): catalogue-wide constraints for all 323 known fields. Layer 2 (allOf if/then): routes each payload by INTERFACE_NAME to its interface sub-schema.",
  "type": "object",
  "properties": {
    "INTERFACE_NAME": {
      "type": "string",
      "description": "שם הממשק שיועבר",
      "maxLength": 50
    },
    "ID": {
      "type": "string",
      "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
      "maxLength": 16
    },
    "PLANT": {
      "type": "string",
      "description": "אתר יעד",
      "maxLength": 4
    },
    "DATE": {
      "type": "string",
      "description": "תאריך שליחת הממשק",
      "maxLength": 8
    },
    "TIME": {
      "type": "string",
      "description": "שעת שליחת הממשק",
      "maxLength": 6
    },
    "CONSIGNEE": {
      "type": "string",
      "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
      "maxLength": 20
    },
    "MATERIAL": {
      "type": "string",
      "description": "פריט",
      "maxLength": 120
    },
    "STATUS": {
      "type": "string",
      "description": "סטאטוס פריט",
      "maxLength": 10
    },
    "STOCK_INDICATOR": {
      "type": "string",
      "description": "אינדיקציית פריט מנוהל מלאי כן/לא",
      "maxLength": 1
    },
    "UNIT_OF_MEASURE": {
      "type": "string",
      "description": "יחידת מידה של הפריט",
      "maxLength": 10
    },
    "STORAGE_METHOD": {
      "type": "string",
      "description": "תנאי אחסנה (טור 21)",
      "maxLength": 10
    },
    "MIN_TEMPERATURE": {
      "type": "string",
      "description": "טמפ' מינימלית לאופן אחסנת הפריט",
      "maxLength": 10
    },
    "HUMIDITY": {
      "type": "string",
      "description": "אחוז לחות מקסימלי לאופן אחסנת הפריט",
      "maxLength": 18
    },
    "SUPPLY_CENTER": {
      "type": "string",
      "description": "משק על - טור 02  מערך",
      "maxLength": 10
    },
    "SUPPLY_SECTION": {
      "type": "string",
      "description": "מדור משביר טור 03 קוד מדור",
      "maxLength": 10
    },
    "PRODUCT_MANAGER": {
      "type": "string",
      "description": "מנהל פריט טור 15",
      "maxLength": 20
    },
    "MANAGER_NAME": {
      "type": "string",
      "description": "שם מנהל פריט",
      "maxLength": 20
    },
    "MANAGER_TEL": {
      "type": "string",
      "description": "טלפון מנהל פריט",
      "maxLength": 20
    },
    "GENERALSKU": {
      "type": "string",
      "description": "אינדיקציית מק\"ט כללי",
      "maxLength": 1
    },
    "VERSION": {
      "type": "string",
      "description": "אינדיקציית פריט מנוהל גרסה",
      "maxLength": 10
    },
    "SHELF_LIFE_WMS": {
      "type": "string",
      "description": "חיי מדף WMS",
      "maxLength": 10
    },
    "EXPIRTAION_DATE_INDICATOR": {
      "type": "string",
      "description": "אינדיקציית פריט ניהול פג תוקף WMS",
      "maxLength": 1
    },
    "MIN_SHELF_LIFE": {
      "type": "string",
      "description": "מינימום חיי מדף לקליטה",
      "maxLength": 10
    },
    "TAKIN_ACHZAKA": {
      "type": "string",
      "description": "חייב בנתונים אחזקתיים.",
      "maxLength": 1
    },
    "SIVUG_BITCHONI": {
      "type": "string",
      "description": "סיווג ביטחוני",
      "maxLength": 20
    },
    "ATTRACTIVE_ITEM": {
      "type": "string",
      "description": "אינדיקציית פריט חמיד (פריט אטרקטיבי)",
      "maxLength": 1
    },
    "STOCK_COUNT": {
      "type": "string",
      "description": "מס ימים לספירה מחזורית",
      "maxLength": 10
    },
    "MATERIAL_SUB_CATEGORY": {
      "type": "string",
      "description": "תת משפחה",
      "maxLength": 10
    },
    "ACCOMPANYING_ITEM": {
      "type": "string",
      "description": "אינדיקציית פריט עיקרי, מצביע האם לפריט יש נלווים",
      "maxLength": 1
    },
    "WMS_MATERIAL_GROUP": {
      "type": "string",
      "description": "קבוצת פריטים",
      "maxLength": 10
    },
    "MATERIAL_TYPE": {
      "type": "string",
      "description": "סוג חומר מהקט\"מ",
      "maxLength": 50
    },
    "BREAKABLE": {
      "type": "string",
      "description": "אינדיקציית פריט שביר",
      "maxLength": 1
    },
    "TOTAL_SHELF_LIFE": {
      "type": "string",
      "description": "סך חיי מדף לפריט",
      "maxLength": 10
    },
    "MANAGED_PART_NUMBER": {
      "type": "string",
      "description": "אינדקצית מנוהל מקט  יצרן",
      "maxLength": 1
    },
    "UN_ID": {
      "type": "string",
      "description": "שדה המייצג את החומר המסוכן",
      "maxLength": 10
    },
    "MAIN_UN": {
      "type": "string",
      "description": "שדה המצביע על האו\"ם המוביל במק\"ט מכיוון שיכול לקרות מצב שבו למק\"ט יהיה יותר מאו\"ם אחד ולכן יש לתת מענה לאו\"ם הראשי במק\"ט. סימון X עבור האו\"ם המוביל. או\"ם מוביל אחד למק\"ט",
      "maxLength": 20
    },
    "UN_EN_DESC": {
      "type": "string",
      "maxLength": 100
    },
    "MAIN_GROUP": {
      "type": "string",
      "description": "קבוצות הסיכון אליה משויך החומר",
      "maxLength": 10
    },
    "SECONDARY_GROUP": {
      "type": "string",
      "description": "קבוצת הסיכון המשנית אליה משויך החומר",
      "maxLength": 10
    },
    "EMERGENCY_CODE": {
      "type": "string",
      "description": "מסמן את אופן הטיפול בחומר בעת אירוע בטיחות בחומ\"ס. לכל תו בקוד חרום יש משמעות",
      "maxLength": 10
    },
    "NFPA_RED": {
      "type": "string",
      "description": "מידת הדליקות",
      "maxLength": 20
    },
    "NFPA_BLUE": {
      "type": "string",
      "description": "סיכון הבריאותי",
      "maxLength": 20
    },
    "NFPA_YELLOW": {
      "type": "string",
      "description": "מידת הפעילות הכימית",
      "maxLength": 20
    },
    "NFPA_WHITE": {
      "type": "string",
      "description": "סיכונים מיוחדים",
      "maxLength": 20
    },
    "MATCH_GROUP": {
      "type": "string",
      "description": "איזה קבוצות חומרים קיים פוטנציאל לתגובה כימית ולכן אסור לאחסנם או להבילם יחדיו",
      "maxLength": 50
    },
    "MATTER_STATE": {
      "type": "string",
      "description": "מצב צבירה של החומר המסוכן",
      "maxLength": 10
    },
    "PACK_TYPE": {
      "type": "string",
      "description": "אריזה של החומר כגון: חבית, ג'ריקן, מארז וכו'.",
      "maxLength": 10
    },
    "PACK_QUAN": {
      "type": "string",
      "description": "הכמות מהחומר המסוכן באריזה",
      "maxLength": 10
    },
    "UN_UNIT_OF_MEASURE": {
      "type": "string",
      "description": "יחידת המידה של החומר המסוכן לדוגמא : ק\"ג, ליטר וכו'.",
      "maxLength": 10
    },
    "CHEM_COMP": {
      "type": "string",
      "description": "הרכב הכימי של התרכובות של החומר המסוכן",
      "maxLength": 10
    },
    "CHEM_SEQUENCE": {
      "type": "string",
      "description": "מספור פנימי לנתוני חומר מסוכן",
      "maxLength": 10
    },
    "CONCENTRATION": {
      "type": "string",
      "description": "מציין אחוזים את אחוז החומר שנמצא בסה\"כ מתוך סה\"כ החומר עצמו שדה ב % מ 0.00000001 עד 100%",
      "maxLength": 18
    },
    "CAS": {
      "type": "string",
      "description": "מייצג מספר זיהוי לכל חומר שתואר בספרות הכימית המקצועית",
      "maxLength": 10
    },
    "TEKEN_EXPOSURE": {
      "type": "string",
      "description": "תקן חשיפה",
      "maxLength": 50
    },
    "NIIN": {
      "type": "string",
      "description": "המקט הבינלאומי של ה הבינלאומי- מקט נטו\nNIIN==NSN",
      "maxLength": 50
    },
    "MANUFACTURER_PART_NUM": {
      "type": "string",
      "description": "מק\"ט יצרן",
      "maxLength": 60
    },
    "MANUFACTURER_NUMBER": {
      "type": "string",
      "description": "קוד ספק",
      "maxLength": 50
    },
    "MAINTENANCE_TYPE": {
      "type": "string",
      "description": "סוג פעילות מחזורית (תחזוקה , כיול , טעינה , בחינה) ערכים אפשריים לשדה : \n INSPECTION \n CHARGING \n CALIBRATION \n MAINTENANCE\nEXRRAACTIVITY",
      "maxLength": 20
    },
    "CYCLE": {
      "type": "string",
      "description": "תדירות בדיקה בימים",
      "maxLength": 10
    },
    "LOCATION": {
      "type": "string",
      "description": "מיקום פעולה לפעילות מחזורית- נדרש ברמת פקע",
      "maxLength": 100
    },
    "INSPECTION_LOT": {
      "type": "string",
      "description": "מנת ביקורת טיב",
      "maxLength": 12
    },
    "VENDOR_ID": {
      "type": "string",
      "description": "מספר ספק",
      "maxLength": 10
    },
    "MANUFACTURE_DATE": {
      "type": "string",
      "description": "תאריך ייצור",
      "maxLength": 8
    },
    "EVALUATION_CODE": {
      "type": "string",
      "description": "קוד הערכה",
      "maxLength": 1
    },
    "CUSTOMER_ID": {
      "type": "string",
      "description": "קוד לקוח",
      "maxLength": 10
    },
    "CUSTOMER_NAME": {
      "type": "string",
      "description": "שם לקוח",
      "maxLength": 35
    },
    "CUSTOMER_TYPE": {
      "type": "string",
      "description": "סוג לקוח",
      "maxLength": 4
    },
    "CUSTOMER_ACCOUNT_GROUP": {
      "type": "string",
      "description": "קבוצת לקוח"
    },
    "COORDINATES_WIDTH": {
      "type": "string",
      "description": "קורדינטת רוחב",
      "maxLength": 18
    },
    "COORDINATES_LENGTH": {
      "type": "string",
      "description": "קורדינת אורך",
      "maxLength": 18
    },
    "TRANSPORTION_ZONE": {
      "type": "string",
      "description": "אזור הובלה",
      "maxLength": 20
    },
    "STORAGE_LOCATION": {
      "type": "string",
      "description": "אתר אחסון תחת הלקוח",
      "maxLength": 4
    },
    "STORAGE_LOCATION_TYPE": {
      "type": "string",
      "description": "סוג אתר אחסון תחת הלקוח",
      "maxLength": 2
    },
    "STORAGE_LOCATION_TYPE_DESC": {
      "type": "string",
      "description": "תיאור סוג האתר אחסון",
      "maxLength": 30
    },
    "VENDOR_NAME": {
      "type": "string",
      "description": "שם ספק",
      "maxLength": 35
    },
    "VENDOR_TYPE": {
      "type": "string",
      "description": "סוג ספק",
      "maxLength": 2
    },
    "VENDOR_ACCOUNT_GROUP": {
      "type": "string",
      "description": "קבוצת ספק",
      "maxLength": 4
    },
    "LANGUAGE": {
      "type": "string",
      "description": "שפה",
      "maxLength": 2
    },
    "COUNTRY": {
      "type": "string",
      "description": "ארץ",
      "maxLength": 3
    },
    "CITY": {
      "type": "string",
      "description": "עיר"
    },
    "ADDRESS": {
      "type": "string",
      "description": "כתובת"
    },
    "TELEPHONE1": {
      "type": "string",
      "description": "טלפון 1",
      "maxLength": 16
    },
    "TELEPHONE2": {
      "type": "string",
      "description": "טלפון 2",
      "maxLength": 16
    },
    "EMAIL": {
      "type": "string",
      "description": "כתובת דואר אלקטרוני",
      "maxLength": 60
    },
    "CANCELED_VENDOR": {
      "type": "string",
      "description": "ספק מבוטל",
      "maxLength": 1
    },
    "BLOCKED_VENDOR": {
      "type": "string",
      "description": "ספק חסום",
      "maxLength": 1
    },
    "VENDOR_ALL_BLOCK": {
      "type": "string",
      "description": "ספק חסום לכל הארגונים",
      "maxLength": 1
    },
    "VENDOR_FAX": {
      "type": "string",
      "description": "פקס של ספק",
      "maxLength": 31
    },
    "CP_FIRST_NAME": {
      "type": "string",
      "description": "שם פרטי של איש קשר",
      "maxLength": 35
    },
    "CP_LAST_NAME": {
      "type": "string",
      "description": "שם משפחה של איש קשר",
      "maxLength": 35
    },
    "CP_TELEPHONE": {
      "type": "string",
      "description": "טלפון של איש קשר",
      "maxLength": 16
    },
    "REC_DOC": {
      "type": "string",
      "description": "מספר מסמך",
      "maxLength": 10
    },
    "WMS_ORD_TP": {
      "type": "string",
      "description": "סוג מסמך מקור",
      "maxLength": 3
    },
    "SUP_PRTNR": {
      "type": "string",
      "description": "קוד ספק",
      "maxLength": 10
    },
    "PARTNER_TYPE": {
      "type": "string",
      "description": "סוג חברה",
      "maxLength": 2
    },
    "OPER_CODE": {
      "type": "string",
      "description": "קוד פעולה (יצירה או ביטול)",
      "maxLength": 1
    },
    "HEADER_TEXT": {
      "type": "string",
      "description": "הערות כותרת",
      "maxLength": 255
    },
    "RELS_ORD": {
      "type": "string",
      "description": "מס' הוראות שחרור",
      "maxLength": 20
    },
    "BOL": {
      "type": "string",
      "description": "AWB|BOL",
      "maxLength": 20
    },
    "CONTAIN_ID": {
      "type": "string",
      "description": "מספר מכולה \\פאלט",
      "maxLength": 20
    },
    "CONTAIN_SEAL_NUM": {
      "type": "string",
      "description": "מספר סוגר מכולה",
      "maxLength": 20
    },
    "CONTAIN_TYP": {
      "type": "string",
      "description": "סוג מכולה",
      "maxLength": 2
    },
    "AIR_OR_SEA_IND": {
      "type": "string",
      "description": "אינד' אווירי או ימי",
      "maxLength": 1
    },
    "REQU_COORD": {
      "type": "string",
      "description": "אינד' נדרש תיאום",
      "maxLength": 1
    },
    "REF_DELIV": {
      "type": "string",
      "description": "מספר הזמנה מקושר",
      "maxLength": 10
    },
    "RECEIVING_PLANT": {
      "type": "string",
      "description": "אתר מקבל",
      "maxLength": 4
    },
    "DELIV_NOTE": {
      "type": "string",
      "description": "תעודת משלוח",
      "maxLength": 20
    },
    "SPED": {
      "type": "string",
      "description": "ספד",
      "maxLength": 20
    },
    "ARMY_MANAGED": {
      "type": "string",
      "description": "קליטה למחסן המזמין (מנוהל צבאי)",
      "maxLength": 1
    },
    "PICK_POINT": {
      "type": "string",
      "description": "אתר אחסון מנפק -לטובת אתר",
      "maxLength": 4
    },
    "DELIVERY_DATE": {
      "type": "string",
      "description": "תאריך אספקה",
      "maxLength": 8
    },
    "REC_DOC_LINE": {
      "type": "string",
      "description": "מספר שורת הזמנה (אספקה)",
      "maxLength": 10
    },
    "DELETION_INDIC": {
      "type": "string",
      "description": "סמן מחיקה",
      "maxLength": 1
    },
    "MOD_ORDER": {
      "type": "string",
      "description": "מספר הזמנת מקור (SAP)",
      "maxLength": 10
    },
    "SERIAL_PROF": {
      "type": "string",
      "description": "מזהה סיריאלי",
      "maxLength": 4
    },
    "QUANTITY": {
      "type": "string",
      "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
      "maxLength": 18
    },
    "STOCK_TYPE": {
      "type": "string",
      "description": "סטאטוס מלאי צפוי",
      "maxLength": 1
    },
    "RECEIVING_STORAGE_LOCATION": {
      "type": "string",
      "description": "אתר אחסנה מקבל",
      "maxLength": 4
    },
    "LINE_TEXT": {
      "type": "string",
      "description": "הערות שורה",
      "maxLength": 255
    },
    "ORDER_TOLERANCE": {
      "type": "string",
      "description": "אחוז קליטה יתר",
      "maxLength": 4
    },
    "CROSS_DOC_ORDER": {
      "type": "string",
      "description": "הזמנת קרוס-דוק",
      "maxLength": 10
    },
    "CROSS_DOC_ORDER_LINE": {
      "type": "string",
      "description": "מספר שורת הזמנת הקרוס-דוק",
      "maxLength": 6
    },
    "BATCH": {
      "type": "string",
      "description": "סדרה",
      "maxLength": 10
    },
    "KIT_SIZE": {
      "type": "string",
      "description": "גודל ערכה",
      "maxLength": 7
    },
    "INSPECTION_TYPE": {
      "type": "string",
      "description": "נדרש ביקורת טיב",
      "maxLength": 1
    },
    "SAP_INTER_ORDER": {
      "type": "string",
      "description": "מספר הזמנת סאפ\\הסבה (SAP)",
      "maxLength": 10
    },
    "SAP_INTER_ORDER_LINE": {
      "type": "string",
      "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
      "maxLength": 6
    },
    "MILSTRIP": {
      "type": "string",
      "description": "מספר מילסטריפ",
      "maxLength": 14
    },
    "MLSTRP_SPLIT": {
      "type": "string",
      "description": "פיצול מילסטריפ",
      "maxLength": 1
    },
    "LOT": {
      "type": "string",
      "description": "לוט",
      "maxLength": 8
    },
    "RESERVATION_ORDER": {
      "type": "string",
      "description": "מספר הזמנת שריון",
      "maxLength": 10
    },
    "RECEIPT": {
      "type": "string",
      "description": "מספר תעודת קליטה",
      "maxLength": 20
    },
    "RECEIPT_LINE": {
      "type": "string",
      "description": "שורה תעודת קליטה",
      "maxLength": 20
    },
    "CONTACT_PERSON_NAME": {
      "type": "string",
      "description": "שם איש קשר",
      "maxLength": 35
    },
    "CONTACT_PERSON_PHONE": {
      "type": "string",
      "description": "מספר טלפון של איש הקשר",
      "maxLength": 10
    },
    "SERIAL": {
      "type": "string",
      "description": "מספר סיריאלי",
      "maxLength": 18
    },
    "ASN_MAINTENANCE_DATE": {
      "type": "string",
      "description": "תאריך תחזוקה",
      "maxLength": 8
    },
    "ASN_LAST_CNT_DATE": {
      "type": "string",
      "description": "תאריך ספירה אחרון",
      "maxLength": 8
    },
    "ASN_INSPECTION_DATE": {
      "type": "string",
      "description": "תאריך ביקורת איכות אחרון",
      "maxLength": 8
    },
    "ASN_LOADID": {
      "type": "string",
      "description": "מטען",
      "maxLength": 20
    },
    "ASN_EXPIRATION_DATE": {
      "type": "string",
      "description": "תאריך פג תוקף(ללא סידרה)",
      "maxLength": 8
    },
    "ASN_HU": {
      "type": "string",
      "description": "יחידת ניטול",
      "maxLength": 20
    },
    "ASN_SKU_WMS": {
      "type": "string",
      "description": "מק\"ט WMS פנימי",
      "maxLength": 100
    },
    "ASN_COL_DATE": {
      "type": "string",
      "description": "תאריך כיול",
      "maxLength": 8
    },
    "ASN_CHARGE_DATE": {
      "type": "string",
      "description": "תאריך טעינה",
      "maxLength": 8
    },
    "ASN_EXTRA_ACTIVITY_DATE": {
      "type": "string",
      "description": "תאריך פעילות נוספת",
      "maxLength": 8
    },
    "ASN_ALLOW_PICK": {
      "type": "string",
      "description": "כשיר אחזקתי לניפוק",
      "maxLength": 1
    },
    "ASN_VERSION": {
      "type": "string",
      "description": "גירסה",
      "maxLength": 50
    },
    "ASN_VERSION_DATE": {
      "type": "string",
      "description": "תאריך צריבת גירסה",
      "maxLength": 8
    },
    "ASN_LOAD_UM": {
      "type": "string",
      "description": "יחידת המידה של המטען",
      "maxLength": 10
    },
    "ASN_UM_UNITS": {
      "type": "string",
      "description": "כמות ביחידת המידה של המטען",
      "maxLength": 17
    },
    "ASN_WMS_STAT": {
      "type": "string",
      "description": "סטאטוס מלאי WMS",
      "maxLength": 10
    },
    "ASN_BLOCK": {
      "type": "string",
      "description": "קוד סיבה חסימה",
      "maxLength": 10
    },
    "ASN_HU_TYPE": {
      "type": "string",
      "description": "סוג יחידת ניטול",
      "maxLength": 10
    },
    "ASN_KIT_ORDER": {
      "type": "string",
      "description": "סדר בערכה",
      "maxLength": 7
    },
    "ASN_SUB_KIT": {
      "type": "string",
      "description": "תת ערכה",
      "maxLength": 20
    },
    "DOCUMENT_CATEGORY": {
      "type": "string",
      "description": "סוג מסמך מקור",
      "maxLength": 10
    },
    "SAP_DOCUMENT_TYPE": {
      "type": "string",
      "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
      "maxLength": 4
    },
    "DOCUMENT_NUM_SAP": {
      "type": "string",
      "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
      "maxLength": 20
    },
    "REF_DOC_NUM": {
      "type": "string",
      "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
      "maxLength": 10
    },
    "SUPPLYING_PLANT": {
      "type": "string",
      "description": "אתר מנפק",
      "maxLength": 4
    },
    "SUPPLYING_STORAGE_LOCATION": {
      "type": "string",
      "description": "אתר אחסון מנפק",
      "maxLength": 4
    },
    "CUSTOMER": {
      "type": "string",
      "description": "לקוח מזמין",
      "maxLength": 10
    },
    "DELIVERY_PRIORITY": {
      "type": "string",
      "description": "עדיפות אספקה",
      "maxLength": 2
    },
    "SHIP_CON": {
      "type": "string",
      "description": "סוג משלוח (סוג אספקה)",
      "maxLength": 2
    },
    "ORDERING_CUSTOMER": {
      "type": "string",
      "description": "לקוח מזמין - מקבל",
      "maxLength": 10
    },
    "TRANSIT_DOCKING_PLANT": {
      "type": "string",
      "description": "אתר ביניים (מרחב מפיץ)",
      "maxLength": 4
    },
    "EMERGENCY_COORDINATES_WIDTH": {
      "type": "string",
      "description": "נקודת נ\"צ רוחב חירום",
      "maxLength": 18
    },
    "EMERGENCY_COORDINATES_LENGTH": {
      "type": "string",
      "description": "נקודת נ\"צ אורך חירום",
      "maxLength": 18
    },
    "DOCUMENT_ITEM_SAP": {
      "type": "string",
      "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
      "maxLength": 6
    },
    "CROSS_DOCK": {
      "type": "string",
      "description": "סמן קרוסדוק",
      "maxLength": 1
    },
    "Material": {
      "type": "string",
      "description": "מקט-SKU",
      "maxLength": 120
    },
    "Batch": {
      "type": "string",
      "description": "סדרה(שורה)",
      "maxLength": 10
    },
    "Version": {
      "type": "string",
      "description": "גירסה"
    },
    "QUANTITIY": {
      "type": "string",
      "description": "כמות של חומר",
      "maxLength": 18
    },
    "RESERVE_NUM": {
      "type": "string",
      "description": "מספר שריון",
      "maxLength": 10
    },
    "FOOD_PACKING": {
      "type": "string",
      "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
      "maxLength": 1
    },
    "MESIMA_ASHBARATIT": {
      "type": "string",
      "description": "משימה השברתית (קוד מבצע)",
      "maxLength": 12
    },
    "MANPAR_NOTES": {
      "type": "string",
      "description": "הערות מנפ\"ר למחסנאי",
      "maxLength": 50
    },
    "KOSHER": {
      "type": "string",
      "description": "כושר",
      "maxLength": 2
    },
    "SERIAL_TYPE": {
      "type": "string",
      "description": "מזהה סיראלי(מסד\\צ')",
      "maxLength": 4
    },
    "MOVEMENT_TYPE": {
      "type": "string",
      "description": "קוד סוג תנועה",
      "maxLength": 3
    },
    "MOVEMENT_REASON": {
      "type": "string",
      "description": "קוד סיבה לתנועה",
      "maxLength": 4
    },
    "WMS_STATUS": {
      "type": "string",
      "description": "סטטוס זכיין",
      "maxLength": 3
    },
    "SERIAL_NUMBER": {
      "type": "string",
      "description": "סריאלי(שורה)",
      "maxLength": 18
    },
    "CYCLE_ACTIVITY_TYPE": {
      "type": "string",
      "description": "סוג פעילות מחזורית",
      "maxLength": 2
    },
    "CYCLE_ACTIVITY_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית",
      "maxLength": 8
    },
    "INSPECTION_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית - בחינה",
      "maxLength": 8
    },
    "MAINTENANCE_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית - תחזוקה",
      "maxLength": 8
    },
    "CALIBRATION_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית - כיול",
      "maxLength": 8
    },
    "CHARGE_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית - טעינה",
      "maxLength": 8
    },
    "EXTRA_ACTIVITY_DATE": {
      "type": "string",
      "description": "תאריך פעילות מחזורית - פעילות נוספת",
      "maxLength": 8
    },
    "ASN_SUB_SERIES": {
      "type": "string",
      "maxLength": 20
    },
    "WMS_DOC_TYPE": {
      "type": "string",
      "description": "סוג המסמך ב WMS",
      "maxLength": 20
    },
    "SAP_ORDER_TYPE": {
      "type": "string",
      "description": "סוג המסמך\\ ההזמנה בSAP",
      "maxLength": 4
    },
    "CREATE_DATE": {
      "type": "string",
      "description": "תאריך יצירת המסמך ב-SAP",
      "maxLength": 8
    },
    "SOLD_TO": {
      "type": "string",
      "description": "לקוח מזמין",
      "maxLength": 10
    },
    "ZZWMS_RECEIVING_DOCUMENT": {
      "type": "string",
      "description": "תעודת קליטה",
      "maxLength": 25
    },
    "ZZWMS_RECEIVING_DOC_ITEM": {
      "type": "string",
      "description": "שורה בתעודת קליטה",
      "maxLength": 7
    },
    "ORDER_QTY": {
      "type": "string",
      "description": "כמות בשורה לביצוע",
      "maxLength": 17
    },
    "FROM_BATCH": {
      "type": "string",
      "description": "הסדרה ממנה מתבצעת ההמרה",
      "maxLength": 10
    },
    "FSTK_TYPE": {
      "type": "string",
      "description": "סוג מלאי ממנו מתבצעת ההמרה",
      "maxLength": 1
    },
    "BATCH_STATUS": {
      "type": "string",
      "description": "סטטוס הסדרה",
      "maxLength": 1
    },
    "TSTK_TYPE": {
      "type": "string",
      "description": "סוג מלאי",
      "maxLength": 1
    },
    "ISSUE_PLANT": {
      "type": "string",
      "description": "אתר מנפק",
      "maxLength": 4
    },
    "ISSUE_ST_LOC": {
      "type": "string",
      "description": "אתר אחסון מנפק-שורה",
      "maxLength": 4
    },
    "RECEIVING_ST_LOC": {
      "type": "string",
      "description": "אתר אחסון מקבל-שורה",
      "maxLength": 4
    },
    "TOLERANCE": {
      "type": "string",
      "description": "אחוז טולרנס",
      "maxLength": 4
    },
    "DELETION_INDICATOR": {
      "type": "string",
      "description": "סמן מחיקה",
      "maxLength": 1
    },
    "ORDER_REASON": {
      "type": "string",
      "description": "סיבה להזמנה",
      "maxLength": 3
    },
    "EXPIRED_DATE": {
      "type": "string",
      "description": "תאריך פג תוקף",
      "maxLength": 8
    },
    "TO_RESERVATION": {
      "type": "string",
      "description": "לשריון",
      "maxLength": 10
    },
    "FROM_SERIAL_NUMBER": {
      "type": "string",
      "description": "מסד\\צ",
      "maxLength": 18
    },
    "ISSUE_STLOC": {
      "type": "string",
      "description": "אתר אחסון מנפק-שורה",
      "maxLength": 4
    },
    "FROM_MATERIAL": {
      "type": "string",
      "description": "מק\"ט צה\"לי",
      "maxLength": 120
    },
    "TO_MATERIAL": {
      "type": "string",
      "description": "מקט אליו ממירים-סדרה או מלאי",
      "maxLength": 120
    },
    "TO_BATCH_STATUS": {
      "type": "string",
      "description": "סטטוס סדרה",
      "maxLength": 1
    },
    "TO_ORDER_QTY": {
      "type": "string",
      "description": "כמות בשורה לביצוע",
      "maxLength": 17
    },
    "TO_BATCH": {
      "type": "string",
      "description": "הסדרה אליה ממתבצעת ההמרה",
      "maxLength": 10
    },
    "TO_SERIAL_NUMBER": {
      "type": "string",
      "description": "מסד\\צ",
      "maxLength": 18
    },
    "CREATE_TIME": {
      "type": "string",
      "description": "שעת מסמך - חותמת זמן (שעות ודקות)",
      "maxLength": 6
    },
    "ORDER_NUMBER": {
      "type": "string",
      "description": "מספר פקע",
      "maxLength": 25
    },
    "END_DATE": {
      "type": "string",
      "description": "תאריך סיום פקע",
      "maxLength": 8
    },
    "ORDER_INTOF": {
      "type": "string",
      "description": "שורה בפקע",
      "maxLength": 4
    },
    "FROM_ORDER_QTY": {
      "type": "string",
      "description": "כמות ערכה",
      "maxLength": 17
    },
    "KIT_LOCATION": {
      "type": "string",
      "description": "מיקום פריט בערכה",
      "maxLength": 4
    },
    "RECIVING_STLOC": {
      "type": "string",
      "description": "אתר אחסון",
      "maxLength": 4
    },
    "ORDER_INTOT": {
      "type": "string",
      "description": "שורה בפקע",
      "maxLength": 4
    },
    "MATERIALTYPE": {
      "type": "string",
      "description": "סוג הפריט צהלי או ייצרן"
    },
    "DESCRIPTION_HE": {
      "type": "string",
      "description": "תיאור הפריט של ה SKU תמיד של מקט ייצרן",
      "maxLength": 1
    },
    "DESCRIPTION_SHORT": {
      "type": "string",
      "description": "תיאור קצר של הפריט",
      "maxLength": 50
    },
    "ITEM_CLASS": {
      "type": "string",
      "description": "פרופיל פריט",
      "maxLength": 10
    },
    "IMAGE": {
      "type": "string",
      "description": "תמונת פריט"
    },
    "NEW_ITEM": {
      "type": "string",
      "description": "מקט חדש",
      "maxLength": 1
    },
    "INITIALSTATUS": {
      "type": "string",
      "description": "סטאטוס לקליטה ברירת מחדל",
      "maxLength": 10
    },
    "HUTYPE": {
      "type": "string",
      "description": "סוג יחידת ניטול",
      "maxLength": 20
    },
    "DEFAULTUOM": {
      "type": "string",
      "description": "יחידת מידה ברירת מחדל",
      "maxLength": 10
    },
    "DEFAULTRECUOM": {
      "type": "string",
      "description": "יחידת מידה ברירת מחדל לקליטה",
      "maxLength": 10
    },
    "OVERRECEIVEPCT": {
      "type": "string",
      "description": "אחוז קליטת יתר",
      "maxLength": 18
    },
    "OVERPICKPCT": {
      "type": "string",
      "description": "אחוז ליקוט יתר",
      "maxLength": 18
    },
    "NOTES": {
      "type": "string",
      "description": "הערות כלליות לפריט",
      "maxLength": 255
    },
    "COUNTTOLERANCE": {
      "type": "string",
      "description": "פקטור בספירה להתראה",
      "maxLength": 10
    },
    "CYCLECOUNTINT": {
      "type": "string",
      "description": "מספר ימים לספירה מחזורית",
      "maxLength": 10
    },
    "LOWLIMITCOUNT": {
      "type": "string",
      "description": "סף מינימום לספירה",
      "maxLength": 10
    },
    "OPORTUNITYREPLFLAG": {
      "type": "string",
      "description": "רענון מזדמן",
      "maxLength": 0
    },
    "STORAGECLASS": {
      "type": "string",
      "description": "סוג אחסון",
      "maxLength": 20
    },
    "PICKSORTORDER": {
      "type": "string",
      "description": "סדר ליקוט (מעיכות)",
      "maxLength": 10
    },
    "BASEITEM": {
      "type": "string",
      "description": "פריט בסיס",
      "maxLength": 10
    },
    "PUTAWAYNOTES": {
      "type": "string",
      "description": "הערות לפיזור",
      "maxLength": 255
    },
    "PACKNOTES": {
      "type": "string",
      "description": "הערות לאריזה",
      "maxLength": 255
    },
    "WONOTES": {
      "type": "string",
      "description": "הערות לפק\"ע",
      "maxLength": 255
    },
    "RECADDITIONALWORK": {
      "type": "string",
      "description": "עבודות משלימות לקבלה",
      "maxLength": 1
    },
    "KITFACTOR": {
      "type": "string",
      "description": "פקטור תזמון לקיט",
      "maxLength": 10
    },
    "WEIGHTTYPE": {
      "type": "string",
      "description": "סוג פריט שקיל",
      "maxLength": 20
    },
    "LINGEROUTTIME": {
      "type": "string",
      "description": "זמן שהייה מחוץ לאיזור הטמפרטורה באחסון",
      "maxLength": 18
    },
    "CONFIRMSKUONPICK": {
      "type": "string",
      "description": "דורש אימות פריט בליקוט",
      "maxLength": 1
    },
    "PRINTSKULBLREC": {
      "type": "string",
      "description": "הפקת מדבקת פריט בקבלה",
      "maxLength": 1
    },
    "REQINSPECTIONREC": {
      "type": "string",
      "description": "דורש בקרת איכות בקליטה",
      "maxLength": 1
    },
    "SAMPLESIZE": {
      "type": "string",
      "description": "גודל דוגמה",
      "maxLength": 18
    },
    "LEADITEM": {
      "type": "string",
      "description": "מק\"ט מקבץ",
      "maxLength": 120
    },
    "LEADITEM_SIZE": {
      "type": "string",
      "description": "מידה של המקט המקבץ",
      "maxLength": 18
    },
    "VELOCITYGROUP": {
      "type": "string",
      "description": "קבוצת מהירות",
      "maxLength": 10
    },
    "PHARMACYINSPECTION": {
      "type": "string",
      "description": "בקרת רוקח",
      "maxLength": 1
    },
    "G29": {
      "type": "string",
      "description": "29 ג",
      "maxLength": 1
    },
    "WEIGHTTOLERANCEPCT": {
      "type": "string",
      "description": "אחוז סטייה בשקילה",
      "maxLength": 18
    },
    "UOM": {
      "type": "string",
      "description": "יחידת המידה",
      "maxLength": 10
    },
    "EANUPC": {
      "type": "string",
      "description": "ברקוד אריזה",
      "maxLength": 20
    },
    "BRGEW": {
      "type": "string",
      "description": "משקל ברוטו",
      "maxLength": 18
    },
    "NTGEW": {
      "type": "string",
      "description": "משקל נטו",
      "maxLength": 18
    },
    "LAENG": {
      "type": "string",
      "description": "אורך",
      "maxLength": 18
    },
    "BREIT": {
      "type": "string",
      "description": "רוחב",
      "maxLength": 18
    },
    "HOEHE": {
      "type": "string",
      "description": "גובה",
      "maxLength": 18
    },
    "VOLUME": {
      "type": "string",
      "description": "נפח",
      "maxLength": 18
    },
    "MEABM": {
      "type": "string",
      "description": "יחידת מידה לייחוס",
      "maxLength": 18
    },
    "SHIPPABLE": {
      "type": "string",
      "description": "ניתן לשילוח",
      "maxLength": 1
    },
    "UNITPERLOWESTUOM": {
      "type": "string",
      "maxLength": 10
    },
    "PACKAGETYPE": {
      "type": "string",
      "description": "סוג חבילה",
      "maxLength": 18
    },
    "GRABTYPE": {
      "type": "string",
      "description": "סוג אריזה",
      "maxLength": 20
    },
    "CASEPREPARATIONTYPE": {
      "type": "string",
      "description": "סוג הכנת מארז",
      "maxLength": 20
    },
    "EACHHANDLINGTYPE": {
      "type": "string",
      "description": "כלי ניטול פריט",
      "maxLength": 20
    },
    "LABORPACKAGETYPE": {
      "type": "string",
      "description": "סוג אריזה לביצוע עבודה",
      "maxLength": 10
    },
    "LABORGRABTYPE": {
      "type": "string",
      "description": "סוג לקיחה לביצוע עבודה",
      "maxLength": 10
    },
    "LABORPREPARATIONTYPE": {
      "type": "string",
      "description": "סוג הכנה לביצוע עבודה",
      "maxLength": 10
    },
    "LABORHANDLINGTYPE": {
      "type": "string",
      "description": "סוג שינוע לביצוע עבודה",
      "maxLength": 10
    },
    "VERSIONDESC": {
      "type": "string",
      "description": "סוג שינוע לביצוע עבודה",
      "maxLength": 10
    },
    "KITTYPE": {
      "type": "string",
      "description": "סוג ערכה (אופן ניהול הערכה בסדרה חד-חד-ערכי/ כמותי/ חד-חד-ערכי יחידני/ חד-חד-ערכי מאוחד)."
    },
    "RECEIPT_TYPE": {
      "type": "string",
      "description": "סוג קליטה",
      "maxLength": 2
    },
    "QTY": {
      "type": "string",
      "description": "כמות HU שהתקבלה",
      "maxLength": 17
    },
    "INCPECTION_NUM": {
      "type": "string",
      "description": "תעודת בחינה",
      "maxLength": 25
    },
    "WAREHOUSEID": {
      "type": "string",
      "description": "מספר מחסן יעד",
      "maxLength": 10
    },
    "EXPIRY_DATE": {
      "type": "string",
      "description": "תאריך תפוגה",
      "maxLength": 8
    },
    "PROD_DATE": {
      "type": "string",
      "description": "תאריך ייצור",
      "maxLength": 8
    },
    "VENDOR_EXP_DATE": {
      "type": "string",
      "description": "תפוגת ספק",
      "maxLength": 8
    },
    "PURPOSE_KIT": {
      "type": "string",
      "description": "ייעוד הערכה",
      "maxLength": 2
    },
    "PASS_KOSHER": {
      "type": "string",
      "description": "כשר/לא כשר לפסח",
      "maxLength": 2
    },
    "AppointmentID": {
      "type": "string",
      "description": "מספר הזימון",
      "maxLength": 20
    },
    "Status": {
      "type": "string",
      "description": "סטאטוס הזימון (מאושר/מאושר)",
      "maxLength": 1
    },
    "ReasonCode": {
      "type": "string",
      "description": "קוד סיבת דחייה",
      "maxLength": 20
    },
    "Notes": {
      "type": "string",
      "description": "הערות",
      "maxLength": 255
    },
    "VehicleID": {
      "type": "string",
      "description": "מספר הרכב",
      "maxLength": 20
    },
    "Gate": {
      "type": "string",
      "description": "מספר שער",
      "maxLength": 20
    },
    "MovementType": {
      "type": "string",
      "description": "סוג תנועה",
      "maxLength": 1
    },
    "TimeOfMovement": {
      "type": "string",
      "description": "מועד התנועה בשער",
      "maxLength": 14
    },
    "APPOITMENTID": {
      "type": "string",
      "description": "מספר זימון",
      "maxLength": 20
    },
    "APPOITMENT_DATE": {
      "type": "string",
      "description": "תאריך זימון",
      "maxLength": 8
    },
    "FROMTIME": {
      "type": "string",
      "description": "שעת תחילת זימון",
      "maxLength": 6
    },
    "TOTIME": {
      "type": "string",
      "description": "שעת סיום זימון",
      "maxLength": 6
    },
    "DOCUMENT_NUM": {
      "type": "string",
      "description": "מספר מסמך SAP",
      "maxLength": 10
    },
    "DOCUMENT_ITEM": {
      "type": "string",
      "description": "מספר שורה",
      "maxLength": 5
    },
    "DISTRIBUTION_ROUTE": {
      "type": "string",
      "description": "מספר מסלול",
      "maxLength": 20
    },
    "DISTRIBUTION_DATE": {
      "type": "string",
      "description": "תאריך הפצה",
      "maxLength": 8
    },
    "DOCUMENT_TYPE_SAP": {
      "type": "string",
      "description": "סוג מסמך",
      "maxLength": 2
    },
    "ORDERID": {
      "type": "string",
      "description": "מספר תעודת יציאה",
      "maxLength": 20
    },
    "CHANGE_DATE": {
      "type": "string",
      "description": "תאריך עדכון/יצירה",
      "maxLength": 8
    },
    "RESTRICTED": {
      "type": "string",
      "description": "סטטוס הסדרה",
      "maxLength": 1
    },
    "NEXT_INSPEC": {
      "type": "string",
      "description": "תאריך ביקורת איכות",
      "maxLength": 8
    },
    "VENDOR_BATCH": {
      "type": "string",
      "description": "סדרת ספק",
      "maxLength": 15
    },
    "DATE_1": {
      "type": "string",
      "description": "תאריך ביקורת דלק"
    },
    "DATE_2": {
      "type": "string",
      "description": "תאריך ביקורת דלק"
    },
    "DATE_3": {
      "type": "string",
      "description": "תאריך ביקורת דלק"
    },
    "DATE_5": {
      "type": "string",
      "description": "תאריך 5",
      "maxLength": 8
    },
    "DATE_6": {
      "type": "string",
      "description": "תאריך 6",
      "maxLength": 8
    },
    "STATUS_ON": {
      "type": "string",
      "description": "סטטוס חסימה",
      "maxLength": 1
    }
  },
  "required": [
    "INTERFACE_NAME"
  ],
  "additionalProperties": true,
  "allOf": [
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_MATERIAL_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface1"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZQM_WMS_INSPECTION_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface2"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSDWMS_CUST_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface3"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZPUR_WMS_VEND_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface4"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INBOUND_DELIVERY_CREATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface5"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INBOUND_DELIVERY_CREATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface6"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INBOUND_DELIVERY_CREATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface7"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INBOUND_DELIVERY_CREATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface8"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface9"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface10"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface11"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface12"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface15"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface17"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface18"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface20"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface21"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface22"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface23"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INBOUND_DELIVERY_CREATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface24.1"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INT_SAP_VISUT_WMS_EQ_SP_I"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface24.2"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZSD_WMS_OUTBOUND_ORDER_DELIVER"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface25"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZIM_WMS_WORK_INSTRUCTIONS_STO"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface26.1"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZIM_WMS_WORK_INSTRUCTIONS"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface26.2"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_KIT_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface27"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_SKU_UPDATE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface29"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_DELIVERY_RECPT_IN"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface30"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_DELIVERY_RECPT_IN"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface31"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_DELIVERY_RECPT_IN"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface32"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZMM_WMS_DELIVERY_RECPT_IN"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface33"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "APPOINTMENT_ENTRY_RESPONSE"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface44"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "VEHICLE_EXIT_APPROVAL"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface47"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_INT_DELIV_RESERVE_UPD"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface64"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_ROUTE_CONFIRM"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface66"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_ROUTE_CONFIRM"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface67"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZIM_WMS_BATCH_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface71"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZPM_WMS_STATUS_NPK_OUTBOUND"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface72"
      }
    },
    {
      "if": {
        "properties": {
          "INTERFACE_NAME": {
            "const": "ZWMS_DELIVERY_CREATED"
          }
        },
        "required": [
          "INTERFACE_NAME"
        ]
      },
      "then": {
        "$ref": "#/$defs/Interface73"
      }
    }
  ],
  "$defs": {
    "Interface1": {
      "title": "Interface 1",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_MATERIAL_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "MATERIAL": {
          "type": "string",
          "description": "פריט",
          "maxLength": 120
        },
        "STATUS": {
          "type": "string",
          "description": "סטאטוס פריט",
          "maxLength": 1
        },
        "STOCK_INDICATOR": {
          "type": "string",
          "description": "אינדיקציית פריט מנוהל מלאי כן/לא",
          "maxLength": 1
        },
        "UNIT_OF_MEASURE": {
          "type": "string",
          "description": "יחידת מידה של הפריט",
          "maxLength": 10
        },
        "STORAGE_METHOD": {
          "type": "string",
          "description": "תנאי אחסנה (טור 21)",
          "maxLength": 10
        },
        "MIN_TEMPERATURE": {
          "type": "string",
          "description": "טמפ' מינימלית לאופן אחסנת הפריט",
          "maxLength": 10
        },
        "HUMIDITY": {
          "type": "string",
          "description": "אחוז לחות מקסימלי לאופן אחסנת הפריט",
          "maxLength": 18
        },
        "SUPPLY_CENTER": {
          "type": "string",
          "description": "משק על - טור 02  מערך",
          "maxLength": 10
        },
        "SUPPLY_SECTION": {
          "type": "string",
          "description": "מדור משביר טור 03 קוד מדור",
          "maxLength": 10
        },
        "PRODUCT_MANAGER": {
          "type": "string",
          "description": "מנהל פריט טור 15",
          "maxLength": 20
        },
        "MANAGER_NAME": {
          "type": "string",
          "description": "שם מנהל פריט",
          "maxLength": 20
        },
        "MANAGER_TEL": {
          "type": "string",
          "description": "טלפון מנהל פריט",
          "maxLength": 20
        },
        "GENERALSKU": {
          "type": "string",
          "description": "אינדיקציית מק\"ט כללי",
          "maxLength": 1
        },
        "VERSION": {
          "type": "string",
          "description": "אינדיקציית פריט מנוהל גרסה",
          "maxLength": 1
        },
        "SHELF_LIFE_WMS": {
          "type": "string",
          "description": "חיי מדף WMS",
          "maxLength": 10
        },
        "EXPIRTAION_DATE_INDICATOR": {
          "type": "string",
          "description": "אינדיקציית פריט ניהול פג תוקף WMS",
          "maxLength": 1
        },
        "MIN_SHELF_LIFE": {
          "type": "string",
          "description": "מינימום חיי מדף לקליטה",
          "maxLength": 10
        },
        "TAKIN_ACHZAKA": {
          "type": "string",
          "description": "חייב בנתונים אחזקתיים.",
          "maxLength": 1
        },
        "SIVUG_BITCHONI": {
          "type": "string",
          "description": "סיווג ביטחוני",
          "maxLength": 20
        },
        "ATTRACTIVE_ITEM": {
          "type": "string",
          "description": "אינדיקציית פריט חמיד (פריט אטרקטיבי)",
          "maxLength": 1
        },
        "STOCK_COUNT": {
          "type": "string",
          "description": "מס ימים לספירה מחזורית",
          "maxLength": 10
        },
        "MATERIAL_SUB_CATEGORY": {
          "type": "string",
          "description": "תת משפחה",
          "maxLength": 10
        },
        "ACCOMPANYING_ITEM": {
          "type": "string",
          "description": "אינדיקציית פריט עיקרי, מצביע האם לפריט יש נלווים",
          "maxLength": 1
        },
        "WMS_MATERIAL_GROUP": {
          "type": "string",
          "description": "קבוצת פריטים",
          "maxLength": 1
        },
        "MATERIAL_TYPE": {
          "type": "string",
          "description": "סוג חומר מהקט\"מ",
          "maxLength": 50
        },
        "BREAKABLE": {
          "type": "string",
          "description": "אינדיקציית פריט שביר",
          "maxLength": 1
        },
        "TOTAL_SHELF_LIFE": {
          "type": "string",
          "description": "סך חיי מדף לפריט",
          "maxLength": 10
        },
        "MANAGED_PART_NUMBER": {
          "type": "string",
          "description": "אינדקצית מנוהל מקט  יצרן",
          "maxLength": 1
        },
        "UN_ID": {
          "type": "string",
          "description": "שדה המייצג את החומר המסוכן",
          "maxLength": 10
        },
        "MAIN_UN": {
          "type": "string",
          "description": "שדה המצביע על האו\"ם המוביל במק\"ט מכיוון שיכול לקרות מצב שבו למק\"ט יהיה יותר מאו\"ם אחד ולכן יש לתת מענה לאו\"ם הראשי במק\"ט. סימון X עבור האו\"ם המוביל. או\"ם מוביל אחד למק\"ט",
          "maxLength": 20
        },
        "UN_EN_DESC": {
          "type": "string",
          "maxLength": 100
        },
        "MAIN_GROUP": {
          "type": "string",
          "description": "קבוצות הסיכון אליה משויך החומר",
          "maxLength": 10
        },
        "SECONDARY_GROUP": {
          "type": "string",
          "description": "קבוצת הסיכון המשנית אליה משויך החומר",
          "maxLength": 10
        },
        "EMERGENCY_CODE": {
          "type": "string",
          "description": "מסמן את אופן הטיפול בחומר בעת אירוע בטיחות בחומ\"ס. לכל תו בקוד חרום יש משמעות",
          "maxLength": 10
        },
        "NFPA_RED": {
          "type": "string",
          "description": "מידת הדליקות",
          "maxLength": 20
        },
        "NFPA_BLUE": {
          "type": "string",
          "description": "סיכון הבריאותי",
          "maxLength": 20
        },
        "NFPA_YELLOW": {
          "type": "string",
          "description": "מידת הפעילות הכימית",
          "maxLength": 20
        },
        "NFPA_WHITE": {
          "type": "string",
          "description": "סיכונים מיוחדים",
          "maxLength": 20
        },
        "MATCH_GROUP": {
          "type": "string",
          "description": "איזה קבוצות חומרים קיים פוטנציאל לתגובה כימית ולכן אסור לאחסנם או להבילם יחדיו",
          "maxLength": 50
        },
        "MATTER_STATE": {
          "type": "string",
          "description": "מצב צבירה של החומר המסוכן",
          "maxLength": 10
        },
        "PACK_TYPE": {
          "type": "string",
          "description": "אריזה של החומר כגון: חבית, ג'ריקן, מארז וכו'.",
          "maxLength": 10
        },
        "PACK_QUAN": {
          "type": "string",
          "description": "הכמות מהחומר המסוכן באריזה",
          "maxLength": 10
        },
        "UN_UNIT_OF_MEASURE": {
          "type": "string",
          "description": "יחידת המידה של החומר המסוכן לדוגמא : ק\"ג, ליטר וכו'.",
          "maxLength": 10
        },
        "CHEM_COMP": {
          "type": "string",
          "description": "הרכב הכימי של התרכובות של החומר המסוכן",
          "maxLength": 10
        },
        "CHEM_SEQUENCE": {
          "type": "string",
          "description": "מספור פנימי לנתוני חומר מסוכן",
          "maxLength": 10
        },
        "CONCENTRATION": {
          "type": "string",
          "description": "מציין אחוזים את אחוז החומר שנמצא בסה\"כ מתוך סה\"כ החומר עצמו שדה ב % מ 0.00000001 עד 100%",
          "pattern": "^-?\\d+(\\.\\d+)?$",
          "maxLength": 18
        },
        "CAS": {
          "type": "string",
          "description": "מייצג מספר זיהוי לכל חומר שתואר בספרות הכימית המקצועית",
          "maxLength": 10
        },
        "TEKEN_EXPOSURE": {
          "type": "string",
          "description": "תקן חשיפה",
          "maxLength": 50
        },
        "NIIN": {
          "type": "string",
          "description": "המקט הבינלאומי של ה הבינלאומי- מקט נטו\nNIIN==NSN",
          "maxLength": 50
        },
        "MANUFACTURER_PART_NUM": {
          "type": "string",
          "description": "מק\"ט יצרן",
          "maxLength": 60
        },
        "MANUFACTURER_NUMBER": {
          "type": "string",
          "description": "קוד ספק",
          "maxLength": 50
        },
        "MAINTENANCE_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית (תחזוקה , כיול , טעינה , בחינה) ערכים אפשריים לשדה : \n INSPECTION \n CHARGING \n CALIBRATION \n MAINTENANCE\nEXRRAACTIVITY",
          "enum": [
            "IF",
            "THEN"
          ]
        },
        "CYCLE": {
          "type": "string",
          "description": "תדירות בדיקה בימים",
          "maxLength": 10
        },
        "LOCATION": {
          "type": "string",
          "description": "מיקום פעולה לפעילות מחזורית- נדרש ברמת פקע",
          "maxLength": 100
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "MATERIAL",
        "UNIT_OF_MEASURE",
        "MATERIAL_SUB_CATEGORY",
        "ACCOMPANYING_ITEM",
        "WMS_MATERIAL_GROUP",
        "MATERIAL_TYPE",
        "NIIN",
        "MANUFACTURER_PART_NUM",
        "MANUFACTURER_NUMBER"
      ],
      "additionalProperties": true,
      "x-interface-num": "1",
      "x-interface-name": "ZMM_WMS_MATERIAL_OUTBOUND",
      "x-interface-name-heb": "פריטי קטלוג",
      "x-basic-types": [
        "ZMM_WMS_MATERIAL_OUTBOUND"
      ],
      "x-description": "ממשק פריטים (#1)",
      "x-color": "#3b82f6"
    },
    "Interface2": {
      "title": "Interface 2",
      "description": "Payload schema when INTERFACE_NAME is 'ZQM_WMS_INSPECTION_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "minLength": 4,
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "minLength": 1,
          "maxLength": 20
        },
        "INSPECTION_LOT": {
          "type": "string",
          "description": "מנת ביקורת טיב",
          "minLength": 1,
          "maxLength": 12
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט",
          "minLength": 1,
          "maxLength": 120
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "מספר ספק",
          "maxLength": 10
        },
        "MANUFACTURE_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EVALUATION_CODE": {
          "type": "string",
          "description": "קוד הערכה",
          "minLength": 1,
          "maxLength": 1
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "INSPECTION_LOT",
        "MATERIAL",
        "VENDOR_ID",
        "MANUFACTURE_DATE",
        "EVALUATION_CODE"
      ],
      "additionalProperties": true,
      "x-interface-num": "2",
      "x-interface-name": "ZQM_WMS_INSPECTION_OUTBOUND",
      "x-interface-name-heb": "בקרת איכות - בחינה במקור",
      "x-basic-types": [
        "ZQM_WMS_INSPECTION_OUTBOUND"
      ],
      "x-description": "בדיקות איכות מאושרות לקליטה – עבור משק המזון (#2)",
      "x-color": "#f59e0b"
    },
    "Interface3": {
      "title": "Interface 3",
      "description": "Payload schema when INTERFACE_NAME is 'ZSDWMS_CUST_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "minLength": 4,
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע  משתנה לפי אחראי על המלאי:\nATAL\nIDF\nAIR\nSEA...\nעבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "CUSTOMER_ID": {
          "type": "string",
          "description": "קוד לקוח",
          "minLength": 1,
          "maxLength": 10
        },
        "CUSTOMER_NAME": {
          "type": "string",
          "description": "שם לקוח",
          "minLength": 1,
          "maxLength": 35
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "minLength": 1,
          "maxLength": 2
        },
        "CUSTOMER_ACCOUNT_GROUP": {
          "type": "string",
          "description": "קבוצת לקוח"
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "קורדינטת רוחב",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "קורדינת אורך",
          "maxLength": 18
        },
        "TRANSPORTION_ZONE": {
          "type": "string",
          "description": "אזור הובלה",
          "maxLength": 20
        },
        "STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון תחת הלקוח",
          "minLength": 1,
          "maxLength": 4
        },
        "STORAGE_LOCATION_TYPE": {
          "type": "string",
          "description": "סוג אתר אחסון תחת הלקוח",
          "minLength": 1,
          "maxLength": 2
        },
        "STORAGE_LOCATION_TYPE_DESC": {
          "type": "string",
          "description": "תיאור סוג האתר אחסון",
          "minLength": 1,
          "maxLength": 30
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE"
      ],
      "additionalProperties": true,
      "x-interface-num": "3",
      "x-interface-name": "ZSDWMS_CUST_OUTBOUND",
      "x-interface-name-heb": "לקוחות",
      "x-basic-types": [
        "ZSDWMS_CUST_OUTBOUND"
      ],
      "x-description": "ממשק לקוחות - יחידות (#3)",
      "x-color": "#10b981"
    },
    "Interface4": {
      "title": "Interface 4",
      "description": "Payload schema when INTERFACE_NAME is 'ZPUR_WMS_VEND_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "minLength": 1,
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע  משתנה לפי אחראי על המלאי:\nATAL\nIDF\nAIR\nSEA...\nעבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "VENDOR_NAME": {
          "type": "string",
          "description": "שם ספק",
          "minLength": 1,
          "maxLength": 35
        },
        "VENDOR_TYPE": {
          "type": "string",
          "description": "סוג ספק",
          "minLength": 1,
          "maxLength": 2
        },
        "VENDOR_ACCOUNT_GROUP": {
          "type": "string",
          "description": "קבוצת ספק",
          "maxLength": 4
        },
        "LANGUAGE": {
          "type": "string",
          "description": "שפה",
          "maxLength": 2
        },
        "COUNTRY": {
          "type": "string",
          "description": "ארץ",
          "maxLength": 3
        },
        "CITY": {
          "type": "string",
          "description": "עיר"
        },
        "ADDRESS": {
          "type": "string",
          "description": "כתובת"
        },
        "TELEPHONE1": {
          "type": "string",
          "description": "טלפון 1",
          "maxLength": 16
        },
        "TELEPHONE2": {
          "type": "string",
          "description": "טלפון 2",
          "maxLength": 16
        },
        "EMAIL": {
          "type": "string",
          "description": "כתובת דואר אלקטרוני",
          "maxLength": 60
        },
        "CANCELED_VENDOR": {
          "type": "string",
          "description": "ספק מבוטל",
          "maxLength": 1
        },
        "BLOCKED_VENDOR": {
          "type": "string",
          "description": "ספק חסום",
          "maxLength": 1
        },
        "VENDOR_ALL_BLOCK": {
          "type": "string",
          "description": "ספק חסום לכל הארגונים",
          "maxLength": 1
        },
        "VENDOR_FAX": {
          "type": "string",
          "description": "פקס של ספק",
          "maxLength": 31
        },
        "CP_FIRST_NAME": {
          "type": "string",
          "description": "שם פרטי של איש קשר",
          "maxLength": 35
        },
        "CP_LAST_NAME": {
          "type": "string",
          "description": "שם משפחה של איש קשר",
          "maxLength": 35
        },
        "CP_TELEPHONE": {
          "type": "string",
          "description": "טלפון של איש קשר",
          "maxLength": 16
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE"
      ],
      "additionalProperties": true,
      "x-interface-num": "4",
      "x-interface-name": "ZPUR_WMS_VEND_OUTBOUND",
      "x-interface-name-heb": "ספקים",
      "x-basic-types": [
        "ZPUR_WMS_VEND_OUTBOUND"
      ],
      "x-description": "ממשק ספקים (#4)",
      "x-color": "#ef4444"
    },
    "Interface5": {
      "title": "Interface 5",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INBOUND_DELIVERY_CREATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "ממשק אספקה נכנסת",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר מסמך",
          "minLength": 1,
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 3
        },
        "SUP_PRTNR": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "PARTNER_TYPE": {
          "type": "string",
          "description": "סוג חברה",
          "maxLength": 2
        },
        "OPER_CODE": {
          "type": "string",
          "description": "קוד פעולה (יצירה או ביטול)",
          "maxLength": 1
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות כותרת",
          "maxLength": 255
        },
        "RELS_ORD": {
          "type": "string",
          "description": "מס' הוראות שחרור",
          "maxLength": 20
        },
        "BOL": {
          "type": "string",
          "description": "AWB|BOL",
          "maxLength": 20
        },
        "CONTAIN_ID": {
          "type": "string",
          "description": "מספר מכולה \\פאלט",
          "maxLength": 20
        },
        "CONTAIN_SEAL_NUM": {
          "type": "string",
          "description": "מספר סוגר מכולה",
          "maxLength": 20
        },
        "CONTAIN_TYP": {
          "type": "string",
          "description": "סוג מכולה",
          "maxLength": 2
        },
        "AIR_OR_SEA_IND": {
          "type": "string",
          "description": "אינד' אווירי או ימי",
          "maxLength": 1
        },
        "REQU_COORD": {
          "type": "string",
          "description": "אינד' נדרש תיאום",
          "maxLength": 1
        },
        "REF_DELIV": {
          "type": "string",
          "description": "מספר הזמנה מקושר",
          "maxLength": 10
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "DELIV_NOTE": {
          "type": "string",
          "description": "תעודת משלוח",
          "maxLength": 20
        },
        "SPED": {
          "type": "string",
          "description": "ספד",
          "maxLength": 20
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "קליטה למחסן המזמין (מנוהל צבאי)",
          "maxLength": 1
        },
        "PICK_POINT": {
          "type": "string",
          "description": "אתר אחסון מנפק -לטובת אתר",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 10
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "MOD_ORDER": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP)",
          "maxLength": 10
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צהל",
          "minLength": 1,
          "maxLength": 120
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "מזהה סיריאלי",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
          "maxLength": 17
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סטאטוס מלאי צפוי",
          "maxLength": 1
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות שורה",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "description": "אחוז קליטה יתר",
          "maxLength": 4
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "description": "הזמנת קרוס-דוק",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנת הקרוס-דוק",
          "maxLength": 6
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "description": "גודל ערכה",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "description": "נדרש ביקורת טיב",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "description": "מספר הזמנת סאפ\\הסבה (SAP)",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
          "maxLength": 6
        },
        "MILSTRIP": {
          "type": "string",
          "description": "מספר מילסטריפ",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "description": "פיצול מילסטריפ",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "description": "לוט",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "description": "מספר הזמנת שריון",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורה תעודת קליטה",
          "maxLength": 7
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "מספר טלפון של איש הקשר",
          "maxLength": 10
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "נ\"צ רוחב לצרכי הפצה",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "נ\"צ אורך לצרכי הפצה",
          "maxLength": 18
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סיריאלי",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "description": "תאריך ספירה אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך ביקורת איכות אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "description": "מטען"
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף(ללא סידרה)",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "description": "יחידת ניטול",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "description": "מק\"ט WMS פנימי",
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "description": "תאריך כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "description": "תאריך טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "description": "כשיר אחזקתי לניפוק",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "description": "גירסה",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "description": "תאריך צריבת גירסה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "description": "יחידת המידה של המטען"
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "description": "כמות ביחידת המידה של המטען"
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "description": "סטאטוס מלאי WMS"
        },
        "ASN_BLOCK": {
          "type": "string",
          "description": "קוד סיבה חסימה",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "description": "סדר בערכה",
          "maxLength": 7
        },
        "ASN_SUB_KIT": {
          "type": "string",
          "description": "תת ערכה",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SUP_PRTNR",
        "PARTNER_TYPE",
        "RELS_ORD",
        "BOL",
        "CONTAIN_ID",
        "CONTAIN_SEAL_NUM",
        "CONTAIN_TYP",
        "AIR_OR_SEA_IND",
        "REQU_COORD",
        "REF_DELIV",
        "RECEIVING_PLANT",
        "DELIV_NOTE",
        "SPED",
        "ARMY_MANAGED",
        "PICK_POINT",
        "DELIVERY_DATE",
        "REC_DOC_LINE",
        "DELETION_INDIC",
        "MOD_ORDER",
        "MATERIAL",
        "SERIAL_PROF",
        "QUANTITY",
        "STOCK_TYPE",
        "RECEIVING_STORAGE_LOCATION",
        "LINE_TEXT",
        "ORDER_TOLERANCE",
        "CROSS_DOC_ORDER",
        "CROSS_DOC_ORDER_LINE",
        "BATCH",
        "KIT_SIZE",
        "INSPECTION_TYPE",
        "SAP_INTER_ORDER",
        "SAP_INTER_ORDER_LINE",
        "MILSTRIP",
        "MLSTRP_SPLIT",
        "LOT",
        "RESERVATION_ORDER",
        "RECEIPT",
        "RECEIPT_LINE",
        "SERIAL",
        "ASN_MAINTENANCE_DATE",
        "ASN_LAST_CNT_DATE",
        "ASN_INSPECTION_DATE",
        "ASN_LOADID",
        "ASN_EXPIRATION_DATE",
        "ASN_HU",
        "ASN_SKU_WMS",
        "ASN_COL_DATE",
        "ASN_CHARGE_DATE",
        "ASN_EXTRA_ACTIVITY_DATE",
        "ASN_ALLOW_PICK",
        "ASN_VERSION",
        "ASN_VERSION_DATE",
        "ASN_LOAD_UM",
        "ASN_UM_UNITS",
        "ASN_WMS_STAT",
        "ASN_BLOCK",
        "ASN_HU_TYPE",
        "ASN_KIT_ORDER",
        "ASN_SUB_KIT"
      ],
      "additionalProperties": true,
      "x-interface-num": "5",
      "x-interface-name": "ZWMS_INBOUND_DELIVERY_CREATE",
      "x-interface-name-heb": "קבלה למלאי (אספקה נכנסת) רכש מקומי",
      "x-basic-types": [
        "ZWMS_IN_DELIVERY_CREATE_LOCAL",
        "ZWMS_IN_DELIVERY_CREATE_MARKET"
      ],
      "x-description": "אספקה נכנסת רכש מקומי (#5)",
      "x-color": "#8b5cf6"
    },
    "Interface6": {
      "title": "Interface 6",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INBOUND_DELIVERY_CREATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "ממשק אספקה נכנסת",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר מסמך",
          "minLength": 1,
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 3
        },
        "SUP_PRTNR": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "PARTNER_TYPE": {
          "type": "string",
          "description": "סוג חברה",
          "maxLength": 2
        },
        "OPER_CODE": {
          "type": "string",
          "description": "קוד פעולה (יצירה או ביטול)",
          "maxLength": 1
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות כותרת",
          "maxLength": 255
        },
        "RELS_ORD": {
          "type": "string",
          "description": "מס' הוראות שחרור",
          "maxLength": 20
        },
        "BOL": {
          "type": "string",
          "description": "AWB|BOL",
          "maxLength": 20
        },
        "CONTAIN_ID": {
          "type": "string",
          "description": "מספר מכולה \\פאלט",
          "maxLength": 20
        },
        "CONTAIN_SEAL_NUM": {
          "type": "string",
          "description": "מספר סוגר מכולה",
          "maxLength": 20
        },
        "CONTAIN_TYP": {
          "type": "string",
          "description": "סוג מכולה",
          "maxLength": 2
        },
        "AIR_OR_SEA_IND": {
          "type": "string",
          "description": "אינד' אווירי או ימי",
          "maxLength": 1
        },
        "REQU_COORD": {
          "type": "string",
          "description": "אינד' נדרש תיאום",
          "maxLength": 1
        },
        "REF_DELIV": {
          "type": "string",
          "description": "מספר הזמנה מקושר",
          "maxLength": 10
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "DELIV_NOTE": {
          "type": "string",
          "description": "תעודת משלוח",
          "maxLength": 20
        },
        "SPED": {
          "type": "string",
          "description": "ספד",
          "maxLength": 20
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "קליטה למחסן המזמין (מנוהל צבאי)",
          "maxLength": 1
        },
        "PICK_POINT": {
          "type": "string",
          "description": "אתר אחסון מנפק -לטובת אתר",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 10
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "MOD_ORDER": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP)",
          "maxLength": 10
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צהל",
          "minLength": 1,
          "maxLength": 120
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "מזהה סיריאלי",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
          "maxLength": 17
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סטאטוס מלאי צפוי",
          "maxLength": 1
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות שורה",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "description": "אחוז קליטה יתר",
          "maxLength": 4
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "description": "הזמנת קרוס-דוק",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנת הקרוס-דוק",
          "maxLength": 6
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "description": "גודל ערכה",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "description": "נדרש ביקורת טיב",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "description": "מספר הזמנת סאפ\\הסבה (SAP)",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
          "maxLength": 6
        },
        "MILSTRIP": {
          "type": "string",
          "description": "מספר מילסטריפ",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "description": "פיצול מילסטריפ",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "description": "לוט",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "description": "מספר הזמנת שריון",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורה תעודת קליטה",
          "maxLength": 7
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "מספר טלפון של איש הקשר",
          "maxLength": 10
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "נ\"צ רוחב לצרכי הפצה",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "נ\"צ אורך לצרכי הפצה",
          "maxLength": 18
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סיריאלי",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "description": "תאריך ספירה אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך ביקורת איכות אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "description": "מטען"
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף(ללא סידרה)",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "description": "יחידת ניטול",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "description": "מק\"ט WMS פנימי",
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "description": "תאריך כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "description": "תאריך טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "description": "כשיר אחזקתי לניפוק",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "description": "גירסה",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "description": "תאריך צריבת גירסה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "description": "יחידת המידה של המטען"
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "description": "כמות ביחידת המידה של המטען"
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "description": "סטאטוס מלאי WMS"
        },
        "ASN_BLOCK": {
          "type": "string",
          "description": "קוד סיבה חסימה",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "description": "סדר בערכה",
          "maxLength": 7
        },
        "ASN_SUB_KIT": {
          "type": "string",
          "description": "תת ערכה",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SUP_PRTNR",
        "PARTNER_TYPE",
        "RELS_ORD",
        "BOL",
        "CONTAIN_ID",
        "CONTAIN_SEAL_NUM",
        "CONTAIN_TYP",
        "AIR_OR_SEA_IND",
        "REQU_COORD",
        "REF_DELIV",
        "RECEIVING_PLANT",
        "DELIV_NOTE",
        "SPED",
        "ARMY_MANAGED",
        "PICK_POINT",
        "DELIVERY_DATE",
        "REC_DOC_LINE",
        "DELETION_INDIC",
        "MOD_ORDER",
        "MATERIAL",
        "SERIAL_PROF",
        "QUANTITY",
        "STOCK_TYPE",
        "RECEIVING_STORAGE_LOCATION",
        "LINE_TEXT",
        "ORDER_TOLERANCE",
        "CROSS_DOC_ORDER",
        "CROSS_DOC_ORDER_LINE",
        "BATCH",
        "KIT_SIZE",
        "INSPECTION_TYPE",
        "SAP_INTER_ORDER",
        "SAP_INTER_ORDER_LINE",
        "MILSTRIP",
        "MLSTRP_SPLIT",
        "LOT",
        "RESERVATION_ORDER",
        "RECEIPT",
        "RECEIPT_LINE",
        "SERIAL",
        "ASN_MAINTENANCE_DATE",
        "ASN_LAST_CNT_DATE",
        "ASN_INSPECTION_DATE",
        "ASN_LOADID",
        "ASN_EXPIRATION_DATE",
        "ASN_HU",
        "ASN_SKU_WMS",
        "ASN_COL_DATE",
        "ASN_CHARGE_DATE",
        "ASN_EXTRA_ACTIVITY_DATE",
        "ASN_ALLOW_PICK",
        "ASN_VERSION",
        "ASN_VERSION_DATE",
        "ASN_LOAD_UM",
        "ASN_UM_UNITS",
        "ASN_WMS_STAT",
        "ASN_BLOCK",
        "ASN_HU_TYPE",
        "ASN_KIT_ORDER",
        "ASN_SUB_KIT"
      ],
      "additionalProperties": true,
      "x-interface-num": "6",
      "x-interface-name": "ZWMS_INBOUND_DELIVERY_CREATE",
      "x-interface-name-heb": "קבלה למלאי (אספקה נכנסת) רכש חו\"ל",
      "x-basic-types": [
        "ZWMS_IN_DELIVERY_CREATE_ABORD"
      ],
      "x-description": "אספקה נכנסת רכש מחו\"ל (#6)",
      "x-color": "#06b6d4"
    },
    "Interface7": {
      "title": "Interface 7",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INBOUND_DELIVERY_CREATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "ממשק אספקה נכנסת",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר מסמך",
          "minLength": 1,
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 3
        },
        "SUP_PRTNR": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "PARTNER_TYPE": {
          "type": "string",
          "description": "סוג חברה",
          "maxLength": 2
        },
        "OPER_CODE": {
          "type": "string",
          "description": "קוד פעולה (יצירה או ביטול)",
          "maxLength": 1
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות כותרת",
          "maxLength": 255
        },
        "RELS_ORD": {
          "type": "string",
          "description": "מס' הוראות שחרור",
          "maxLength": 20
        },
        "BOL": {
          "type": "string",
          "description": "AWB|BOL",
          "maxLength": 20
        },
        "CONTAIN_ID": {
          "type": "string",
          "description": "מספר מכולה \\פאלט",
          "maxLength": 20
        },
        "CONTAIN_SEAL_NUM": {
          "type": "string",
          "description": "מספר סוגר מכולה",
          "maxLength": 20
        },
        "CONTAIN_TYP": {
          "type": "string",
          "description": "סוג מכולה",
          "maxLength": 2
        },
        "AIR_OR_SEA_IND": {
          "type": "string",
          "description": "אינד' אווירי או ימי",
          "maxLength": 1
        },
        "REQU_COORD": {
          "type": "string",
          "description": "אינד' נדרש תיאום",
          "maxLength": 1
        },
        "REF_DELIV": {
          "type": "string",
          "description": "מספר הזמנה מקושר",
          "maxLength": 10
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "DELIV_NOTE": {
          "type": "string",
          "description": "תעודת משלוח",
          "maxLength": 20
        },
        "SPED": {
          "type": "string",
          "description": "ספד",
          "maxLength": 20
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "קליטה למחסן המזמין (מנוהל צבאי)",
          "maxLength": 1
        },
        "PICK_POINT": {
          "type": "string",
          "description": "אתר אחסון מנפק -לטובת אתר",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 10
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "MOD_ORDER": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP)",
          "maxLength": 10
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צהל",
          "minLength": 1,
          "maxLength": 120
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "מזהה סיריאלי",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
          "maxLength": 17
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סטאטוס מלאי צפוי",
          "maxLength": 1
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות שורה",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "description": "אחוז קליטה יתר",
          "maxLength": 4
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "description": "הזמנת קרוס-דוק",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנת הקרוס-דוק",
          "maxLength": 6
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "description": "גודל ערכה",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "description": "נדרש ביקורת טיב",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "description": "מספר הזמנת סאפ\\הסבה (SAP)",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
          "maxLength": 6
        },
        "MILSTRIP": {
          "type": "string",
          "description": "מספר מילסטריפ",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "description": "פיצול מילסטריפ",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "description": "לוט",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "description": "מספר הזמנת שריון",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורה תעודת קליטה",
          "maxLength": 7
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "מספר טלפון של איש הקשר",
          "maxLength": 10
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "נ\"צ רוחב לצרכי הפצה",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "נ\"צ אורך לצרכי הפצה",
          "maxLength": 18
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סיריאלי",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "description": "תאריך ספירה אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך ביקורת איכות אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "description": "מטען"
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף(ללא סידרה)",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "description": "יחידת ניטול",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "description": "מק\"ט WMS פנימי",
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "description": "תאריך כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "description": "תאריך טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "description": "כשיר אחזקתי לניפוק",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "description": "גירסה",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "description": "תאריך צריבת גירסה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "description": "יחידת המידה של המטען"
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "description": "כמות ביחידת המידה של המטען"
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "description": "סטאטוס מלאי WMS"
        },
        "ASN_BLOCK": {
          "type": "string",
          "description": "קוד סיבה חסימה",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "description": "סדר בערכה",
          "maxLength": 7
        },
        "ASN_SUB_KIT": {
          "type": "string",
          "description": "תת ערכה",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SUP_PRTNR",
        "PARTNER_TYPE",
        "RELS_ORD",
        "BOL",
        "CONTAIN_ID",
        "CONTAIN_SEAL_NUM",
        "CONTAIN_TYP",
        "AIR_OR_SEA_IND",
        "REQU_COORD",
        "REF_DELIV",
        "RECEIVING_PLANT",
        "DELIV_NOTE",
        "SPED",
        "ARMY_MANAGED",
        "PICK_POINT",
        "DELIVERY_DATE",
        "REC_DOC_LINE",
        "DELETION_INDIC",
        "MOD_ORDER",
        "MATERIAL",
        "SERIAL_PROF",
        "QUANTITY",
        "STOCK_TYPE",
        "RECEIVING_STORAGE_LOCATION",
        "LINE_TEXT",
        "ORDER_TOLERANCE",
        "CROSS_DOC_ORDER",
        "CROSS_DOC_ORDER_LINE",
        "BATCH",
        "KIT_SIZE",
        "INSPECTION_TYPE",
        "SAP_INTER_ORDER",
        "SAP_INTER_ORDER_LINE",
        "MILSTRIP",
        "MLSTRP_SPLIT",
        "LOT",
        "RESERVATION_ORDER",
        "RECEIPT",
        "RECEIPT_LINE",
        "SERIAL",
        "ASN_MAINTENANCE_DATE",
        "ASN_LAST_CNT_DATE",
        "ASN_INSPECTION_DATE",
        "ASN_LOADID",
        "ASN_EXPIRATION_DATE",
        "ASN_HU",
        "ASN_SKU_WMS",
        "ASN_COL_DATE",
        "ASN_CHARGE_DATE",
        "ASN_EXTRA_ACTIVITY_DATE",
        "ASN_ALLOW_PICK",
        "ASN_VERSION",
        "ASN_VERSION_DATE",
        "ASN_LOAD_UM",
        "ASN_UM_UNITS",
        "ASN_WMS_STAT",
        "ASN_BLOCK",
        "ASN_HU_TYPE",
        "ASN_KIT_ORDER",
        "ASN_SUB_KIT"
      ],
      "additionalProperties": true,
      "x-interface-num": "7",
      "x-interface-name": "ZWMS_INBOUND_DELIVERY_CREATE",
      "x-interface-name-heb": "החזרה/תיקון מיחידה משיכה",
      "x-basic-types": [
        "ZWMS_UNIT_PULL_WMS"
      ],
      "x-description": "החזרה/תיקון מיחידה -משיכה  (#7)",
      "x-color": "#ec4899"
    },
    "Interface8": {
      "title": "Interface 8",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INBOUND_DELIVERY_CREATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "ממשק אספקה נכנסת",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר מסמך",
          "minLength": 1,
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 3
        },
        "SUP_PRTNR": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "PARTNER_TYPE": {
          "type": "string",
          "description": "סוג חברה",
          "maxLength": 2
        },
        "OPER_CODE": {
          "type": "string",
          "description": "קוד פעולה (יצירה או ביטול)",
          "maxLength": 1
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות כותרת",
          "maxLength": 255
        },
        "RELS_ORD": {
          "type": "string",
          "description": "מס' הוראות שחרור",
          "maxLength": 20
        },
        "BOL": {
          "type": "string",
          "description": "AWB|BOL",
          "maxLength": 20
        },
        "CONTAIN_ID": {
          "type": "string",
          "description": "מספר מכולה \\פאלט",
          "maxLength": 20
        },
        "CONTAIN_SEAL_NUM": {
          "type": "string",
          "description": "מספר סוגר מכולה",
          "maxLength": 20
        },
        "CONTAIN_TYP": {
          "type": "string",
          "description": "סוג מכולה",
          "maxLength": 2
        },
        "AIR_OR_SEA_IND": {
          "type": "string",
          "description": "אינד' אווירי או ימי",
          "maxLength": 1
        },
        "REQU_COORD": {
          "type": "string",
          "description": "אינד' נדרש תיאום",
          "maxLength": 1
        },
        "REF_DELIV": {
          "type": "string",
          "description": "מספר הזמנה מקושר",
          "maxLength": 10
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "DELIV_NOTE": {
          "type": "string",
          "description": "תעודת משלוח",
          "maxLength": 20
        },
        "SPED": {
          "type": "string",
          "description": "ספד",
          "maxLength": 20
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "קליטה למחסן המזמין (מנוהל צבאי)",
          "maxLength": 1
        },
        "PICK_POINT": {
          "type": "string",
          "description": "אתר אחסון מנפק -לטובת אתר",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 10
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "MOD_ORDER": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP)",
          "maxLength": 10
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צהל",
          "minLength": 1,
          "maxLength": 120
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "מזהה סיריאלי",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
          "maxLength": 17
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סטאטוס מלאי צפוי",
          "maxLength": 1
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות שורה",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "description": "אחוז קליטה יתר",
          "maxLength": 4
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "description": "הזמנת קרוס-דוק",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנת הקרוס-דוק",
          "maxLength": 6
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "description": "גודל ערכה",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "description": "נדרש ביקורת טיב",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "description": "מספר הזמנת סאפ\\הסבה (SAP)",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
          "maxLength": 6
        },
        "MILSTRIP": {
          "type": "string",
          "description": "מספר מילסטריפ",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "description": "פיצול מילסטריפ",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "description": "לוט",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "description": "מספר הזמנת שריון",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורה תעודת קליטה",
          "maxLength": 7
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "מספר טלפון של איש הקשר",
          "maxLength": 10
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "נ\"צ רוחב לצרכי הפצה",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "נ\"צ אורך לצרכי הפצה",
          "maxLength": 18
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סיריאלי",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "description": "תאריך ספירה אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך ביקורת איכות אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "description": "מטען"
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף(ללא סידרה)",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "description": "יחידת ניטול",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "description": "מק\"ט WMS פנימי",
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "description": "תאריך כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "description": "תאריך טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "description": "כשיר אחזקתי לניפוק",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "description": "גירסה",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "description": "תאריך צריבת גירסה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "description": "יחידת המידה של המטען"
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "description": "כמות ביחידת המידה של המטען"
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "description": "סטאטוס מלאי WMS"
        },
        "ASN_BLOCK": {
          "type": "string",
          "description": "קוד סיבה חסימה",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "description": "סדר בערכה",
          "maxLength": 7
        },
        "ASN_SUB_KIT": {
          "type": "string",
          "description": "תת ערכה",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SUP_PRTNR",
        "PARTNER_TYPE",
        "RELS_ORD",
        "BOL",
        "CONTAIN_ID",
        "CONTAIN_SEAL_NUM",
        "CONTAIN_TYP",
        "AIR_OR_SEA_IND",
        "REQU_COORD",
        "REF_DELIV",
        "RECEIVING_PLANT",
        "DELIV_NOTE",
        "SPED",
        "ARMY_MANAGED",
        "PICK_POINT",
        "DELIVERY_DATE",
        "REC_DOC_LINE",
        "DELETION_INDIC",
        "MOD_ORDER",
        "MATERIAL",
        "SERIAL_PROF",
        "QUANTITY",
        "STOCK_TYPE",
        "RECEIVING_STORAGE_LOCATION",
        "LINE_TEXT",
        "ORDER_TOLERANCE",
        "CROSS_DOC_ORDER",
        "CROSS_DOC_ORDER_LINE",
        "BATCH",
        "KIT_SIZE",
        "INSPECTION_TYPE",
        "SAP_INTER_ORDER",
        "SAP_INTER_ORDER_LINE",
        "MILSTRIP",
        "MLSTRP_SPLIT",
        "LOT",
        "RESERVATION_ORDER",
        "RECEIPT",
        "RECEIPT_LINE",
        "SERIAL",
        "ASN_MAINTENANCE_DATE",
        "ASN_LAST_CNT_DATE",
        "ASN_INSPECTION_DATE",
        "ASN_LOADID",
        "ASN_EXPIRATION_DATE",
        "ASN_HU",
        "ASN_SKU_WMS",
        "ASN_COL_DATE",
        "ASN_CHARGE_DATE",
        "ASN_EXTRA_ACTIVITY_DATE",
        "ASN_ALLOW_PICK",
        "ASN_VERSION",
        "ASN_VERSION_DATE",
        "ASN_LOAD_UM",
        "ASN_UM_UNITS",
        "ASN_WMS_STAT",
        "ASN_BLOCK",
        "ASN_HU_TYPE",
        "ASN_KIT_ORDER",
        "ASN_SUB_KIT"
      ],
      "additionalProperties": true,
      "x-interface-num": "8",
      "x-interface-name": "ZWMS_INBOUND_DELIVERY_CREATE",
      "x-interface-name-heb": "החזרה/תיקון מיחידה דחיפה",
      "x-basic-types": [
        "ZWMS_UNIT_PUSH_WMS"
      ],
      "x-description": "החזרה מיחידה/תיקון - דחיפה (#8)",
      "x-color": "#84cc16"
    },
    "Interface9": {
      "title": "Interface 9",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "9",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "ניפוק/אספקה ליחידה ממחסן מנוהל WMS",
      "x-basic-types": [
        "ZWMS_WMS_PULL_PUSH_UNIT",
        "ZWMS_WMS_Emergency_Unit",
        "ZWMS_WMS_Loan_Unit"
      ],
      "x-description": "אספקה ליחידה-ממחסן מנוהל   SCExpert  (#9)",
      "x-color": "#f97316"
    },
    "Interface10": {
      "title": "Interface 10",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "10",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "ניפוק/אספקה ליחידה מסוג משיכה ממחסן מנוהל SAP",
      "x-basic-types": [
        "ZWMS_SAP_Pull_Unit"
      ],
      "x-description": "אספקה ליחידה מסוג משיכה - ממחסן מנוהל ב-SAP (#10)",
      "x-color": "#6366f1"
    },
    "Interface11": {
      "title": "Interface 11",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "11",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "אספקה ליחידה מסוג דחיפה ממחסן מנוהל SAP",
      "x-basic-types": [
        "ZWMS_SAP_Push_Unit"
      ],
      "x-description": "אספקה ליחידה מסוג דחיפה - ממחסן מנוהל ב-SAP (#11)",
      "x-color": "#14b8a6"
    },
    "Interface12": {
      "title": "Interface 12",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "12",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "אספקה ליחידה מסוג טרנזיט ממחסן מנוהל WMS יצירת תעודת יציאה",
      "x-basic-types": [
        "ZWMS_Transit_WMS_Push",
        "ZWMS_Transit_SAP_Push_WMS"
      ],
      "x-description": "אספקה ליחידה טרנזיט -יצירת תעודת יציאה (#12)",
      "x-color": "#f43f5e"
    },
    "Interface15": {
      "title": "Interface 15",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "15",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "החלפות",
      "x-basic-types": [
        "ZWMS_TRADE_WMS_PUSH_UNIT"
      ],
      "x-description": "החלפות (#15)",
      "x-color": "#a855f7"
    },
    "Interface17": {
      "title": "Interface 17",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "17",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "החזרה לספק",
      "x-basic-types": [
        "ZWMS_WMS_VENDOR",
        "ZWMS_SAP_VENDOR"
      ],
      "x-description": "החזרה לספק (#17)",
      "x-color": "#22c55e"
    },
    "Interface18": {
      "title": "Interface 18",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "18",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "אספקת מכירה פריטית",
      "x-basic-types": [
        "ZWMS_SALES_Paritit"
      ],
      "x-description": "אספקת מכירה - פריטית (#18)",
      "x-color": "#eab308"
    },
    "Interface19": {
      "title": "Interface 19",
      "description": "Interface 19 — מכירה - LOT - פק\"ע (#19)",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_DOC_TYPE": {
          "type": "string",
          "description": "סוג המסמך ב WMS",
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר אספקה/הזמנה- מספר תעודה ב WMS",
          "maxLength": 10
        },
        "SAP_ORDER_TYPE": {
          "type": "string",
          "description": "סוג המסמך\\ ההזמנה בSAP",
          "maxLength": 4
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירת המסמך ב-SAP",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות לכותרת",
          "maxLength": 255
        },
        "SOLD_TO": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "ZZWMS_RECEIVING_DOCUMENT": {
          "type": "string",
          "description": "תעודת קליטה",
          "maxLength": 25
        },
        "ZZWMS_RECEIVING_DOC_ITEM": {
          "type": "string",
          "description": "שורה בתעודת קליטה",
          "maxLength": 7
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורה בהזמנה",
          "maxLength": 6
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צה\"לי",
          "maxLength": 100
        },
        "ORDER_QTY": {
          "type": "string",
          "description": "כמות בשורה לביצוע",
          "maxLength": 17
        },
        "FROM_BATCH": {
          "type": "string",
          "description": "הסדרה ממנה מתבצעת ההמרה",
          "maxLength": 10
        },
        "FSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי ממנו מתבצעת ההמרה",
          "maxLength": 1
        },
        "BATCH_STATUS": {
          "type": "string",
          "description": "סטטוס הסדרה",
          "maxLength": 1
        },
        "TSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "ISSUE_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "ISSUE_ST_LOC": {
          "type": "string",
          "description": "אתר אחסון מנפק-שורה",
          "maxLength": 4
        },
        "RECEIVING_ST_LOC": {
          "type": "string",
          "description": "אתר אחסון מקבל-שורה",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך יעד לביצוע",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות לכותרת",
          "maxLength": 255
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "ניהול צבאי\\זכיין",
          "maxLength": 1
        },
        "TOLERANCE": {
          "type": "string",
          "description": "אחוז טולרנס",
          "maxLength": 4
        },
        "DELETION_INDICATOR": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "ORDER_REASON": {
          "type": "string",
          "description": "סיבה להזמנה",
          "maxLength": 3
        },
        "EXPIRED_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "קוד ספק",
          "maxLength": 10
        },
        "TO_RESERVATION": {
          "type": "string",
          "description": "לשריון",
          "maxLength": 10
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "פרופיל סריאלי",
          "maxLength": 4
        },
        "FROM_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_DOC_TYPE",
        "REC_DOC",
        "SAP_ORDER_TYPE",
        "CREATE_DATE",
        "REC_DOC_LINE",
        "MATERIAL",
        "ORDER_QTY",
        "ISSUE_PLANT",
        "ISSUE_ST_LOC",
        "DELIVERY_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "19",
      "x-interface-name": "",
      "x-interface-name-heb": "",
      "x-basic-types": [],
      "x-description": "מכירה - LOT - פק\"ע (#19)",
      "x-color": "#3b82f6"
    },
    "Interface20": {
      "title": "Interface 20",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "20",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "מכירה LOT תעודת יציאה",
      "x-basic-types": [
        "ZWMS_SALES_LOTS"
      ],
      "x-description": "מכירה - LOT – תעודת יציאה (#20)",
      "x-color": "#f59e0b"
    },
    "Interface21": {
      "title": "Interface 21",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "21",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "מכירה מחסן עולמי",
      "x-basic-types": [
        "ZWMS_SALES_WORLD"
      ],
      "x-description": "מכירה – מחסן עולמי  (#21)",
      "x-color": "#10b981"
    },
    "Interface22": {
      "title": "Interface 22",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "22",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "ויסות פנימי/חיצוני לצורך קליטה (תעודת כניסה, תעודת יציאה, בקשה לשינוע)",
      "x-basic-types": [
        "ZWMS_Int_SAP_VISUT_SAP_EQ_SP",
        "ZWMS_Int_WMS_Visut_WMS",
        "ZWMS_Int_WMS_Visut_SAP",
        "ZWMS_Ext_WMS_Visut_WMS_O",
        "ZWMS_Ext_WMS_Visut_SAP"
      ],
      "x-description": "וויסות שינוע פנימי/חיצוני (#22)",
      "x-color": "#ef4444"
    },
    "Interface23": {
      "title": "Interface 23",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "23",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "תעודת יציאה בויסות בין מרחבים",
      "x-basic-types": [
        "ZWMS_Int_SAP_Visut_WMS_NE_SP_O",
        "ZWMS_Int_SAP_Visut_SAP_NE_SP",
        "ZWMS_Ext_SAP_Visut_WMS_O",
        "ZWMS_Ext_SAP_Visut_SAP"
      ],
      "x-description": "וויסות שינוע מרחבי  (#23)",
      "x-color": "#8b5cf6"
    },
    "Interface24.1": {
      "title": "Interface 24.1",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INBOUND_DELIVERY_CREATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "ממשק אספקה נכנסת",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "ATAL קבוע",
          "minLength": 1,
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר מסמך",
          "minLength": 1,
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 3
        },
        "SUP_PRTNR": {
          "type": "string",
          "description": "קוד ספק",
          "minLength": 1,
          "maxLength": 10
        },
        "PARTNER_TYPE": {
          "type": "string",
          "description": "סוג חברה",
          "maxLength": 2
        },
        "OPER_CODE": {
          "type": "string",
          "description": "קוד פעולה (יצירה או ביטול)",
          "maxLength": 1
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות כותרת",
          "maxLength": 255
        },
        "RELS_ORD": {
          "type": "string",
          "description": "מס' הוראות שחרור",
          "maxLength": 20
        },
        "BOL": {
          "type": "string",
          "description": "AWB|BOL",
          "maxLength": 20
        },
        "CONTAIN_ID": {
          "type": "string",
          "description": "מספר מכולה \\פאלט",
          "maxLength": 20
        },
        "CONTAIN_SEAL_NUM": {
          "type": "string",
          "description": "מספר סוגר מכולה",
          "maxLength": 20
        },
        "CONTAIN_TYP": {
          "type": "string",
          "description": "סוג מכולה",
          "maxLength": 2
        },
        "AIR_OR_SEA_IND": {
          "type": "string",
          "description": "אינד' אווירי או ימי",
          "maxLength": 1
        },
        "REQU_COORD": {
          "type": "string",
          "description": "אינד' נדרש תיאום",
          "maxLength": 1
        },
        "REF_DELIV": {
          "type": "string",
          "description": "מספר הזמנה מקושר",
          "maxLength": 10
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "DELIV_NOTE": {
          "type": "string",
          "description": "תעודת משלוח",
          "maxLength": 20
        },
        "SPED": {
          "type": "string",
          "description": "ספד",
          "maxLength": 20
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "קליטה למחסן המזמין (מנוהל צבאי)",
          "maxLength": 1
        },
        "PICK_POINT": {
          "type": "string",
          "description": "אתר אחסון מנפק -לטובת אתר",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 10
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "MOD_ORDER": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP)",
          "maxLength": 10
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צהל",
          "minLength": 1,
          "maxLength": 120
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "מזהה סיריאלי",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות מוזמנת לפי יחידת המידה הבסיסית",
          "maxLength": 17
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סטאטוס מלאי צפוי",
          "maxLength": 1
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות שורה",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "description": "אחוז קליטה יתר",
          "maxLength": 4
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "description": "הזמנת קרוס-דוק",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנת הקרוס-דוק",
          "maxLength": 6
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "description": "גודל ערכה",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "description": "נדרש ביקורת טיב",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "description": "מספר הזמנת סאפ\\הסבה (SAP)",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "description": "(SAP) מספר שורת הזמנת סאפ\\הסבה",
          "maxLength": 6
        },
        "MILSTRIP": {
          "type": "string",
          "description": "מספר מילסטריפ",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "description": "פיצול מילסטריפ",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "description": "לוט",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "description": "מספר הזמנת שריון",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורה תעודת קליטה",
          "maxLength": 7
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "מספר טלפון של איש הקשר",
          "maxLength": 10
        },
        "COORDINATES_WIDTH": {
          "type": "string",
          "description": "נ\"צ רוחב לצרכי הפצה",
          "maxLength": 18
        },
        "COORDINATES_LENGTH": {
          "type": "string",
          "description": "נ\"צ אורך לצרכי הפצה",
          "maxLength": 18
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סיריאלי",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "description": "תאריך ספירה אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך ביקורת איכות אחרון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "description": "מטען"
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף(ללא סידרה)",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "description": "יחידת ניטול",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "description": "מק\"ט WMS פנימי",
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "description": "תאריך כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "description": "תאריך טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "description": "כשיר אחזקתי לניפוק",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "description": "גירסה",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "description": "תאריך צריבת גירסה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "description": "יחידת המידה של המטען"
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "description": "כמות ביחידת המידה של המטען"
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "description": "סטאטוס מלאי WMS"
        },
        "ASN_BLOCK": {
          "type": "string",
          "description": "קוד סיבה חסימה",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "description": "סדר בערכה",
          "maxLength": 7
        },
        "ASN_SUB_KIT": {
          "type": "string",
          "description": "תת ערכה",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SUP_PRTNR",
        "PARTNER_TYPE",
        "RELS_ORD",
        "BOL",
        "CONTAIN_ID",
        "CONTAIN_SEAL_NUM",
        "CONTAIN_TYP",
        "AIR_OR_SEA_IND",
        "REQU_COORD",
        "REF_DELIV",
        "RECEIVING_PLANT",
        "DELIV_NOTE",
        "SPED",
        "ARMY_MANAGED",
        "PICK_POINT",
        "DELIVERY_DATE",
        "REC_DOC_LINE",
        "DELETION_INDIC",
        "MOD_ORDER",
        "MATERIAL",
        "SERIAL_PROF",
        "QUANTITY",
        "STOCK_TYPE",
        "RECEIVING_STORAGE_LOCATION",
        "LINE_TEXT",
        "ORDER_TOLERANCE",
        "CROSS_DOC_ORDER",
        "CROSS_DOC_ORDER_LINE",
        "BATCH",
        "KIT_SIZE",
        "INSPECTION_TYPE",
        "SAP_INTER_ORDER",
        "SAP_INTER_ORDER_LINE",
        "MILSTRIP",
        "MLSTRP_SPLIT",
        "LOT",
        "RESERVATION_ORDER",
        "RECEIPT",
        "RECEIPT_LINE",
        "SERIAL",
        "ASN_MAINTENANCE_DATE",
        "ASN_LAST_CNT_DATE",
        "ASN_INSPECTION_DATE",
        "ASN_LOADID",
        "ASN_EXPIRATION_DATE",
        "ASN_HU",
        "ASN_SKU_WMS",
        "ASN_COL_DATE",
        "ASN_CHARGE_DATE",
        "ASN_EXTRA_ACTIVITY_DATE",
        "ASN_ALLOW_PICK",
        "ASN_VERSION",
        "ASN_VERSION_DATE",
        "ASN_LOAD_UM",
        "ASN_UM_UNITS",
        "ASN_WMS_STAT",
        "ASN_BLOCK",
        "ASN_HU_TYPE",
        "ASN_KIT_ORDER",
        "ASN_SUB_KIT"
      ],
      "additionalProperties": true,
      "x-interface-num": "24.1",
      "x-interface-name": "ZWMS_INBOUND_DELIVERY_CREATE",
      "x-interface-name-heb": "תעודת כניסה בויסות בין מרחבים - לפי זכיין נקרא 24.1 ויסות מרחבי במרחב המקבל ?",
      "x-basic-types": [
        "ZWMS_Ext_SAP_Visut_WMS_I",
        "ZWMS_Ext_WMS_Visut_WMS_I",
        "ZWMS_Int_SAP_Visut_WMS_EQ_SP_I",
        "ZWMS_Int_SAP_Visut_WMS_NE_SP_I",
        "ZWMS_Int_SAP_Visut_SAP_NE_SP_I"
      ],
      "x-description": "וויסות מרחבי במרחב המקבל (#24.1)",
      "x-color": "#06b6d4"
    },
    "Interface24.2": {
      "title": "Interface 24.2",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INT_SAP_VISUT_WMS_EQ_SP_I'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "maxLength": 4
        },
        "REC_DOC": {
          "type": "string",
          "maxLength": 10
        },
        "WMS_ORD_TP": {
          "type": "string",
          "maxLength": 3
        },
        "SHIP_CON": {
          "type": "string",
          "maxLength": 2
        },
        "RELS_ORD": {
          "type": "string",
          "maxLength": 20
        },
        "PICK_POINT": {
          "type": "string",
          "maxLength": 4
        },
        "SERIAL_PROF": {
          "type": "string",
          "enum": [
            "ZMSD",
            "ZDIK"
          ]
        },
        "LINE_TEXT": {
          "type": "string",
          "maxLength": 255
        },
        "ORDER_TOLERANCE": {
          "type": "string",
          "maxLength": 3
        },
        "CROSS_DOC_ORDER": {
          "type": "string",
          "maxLength": 10
        },
        "CROSS_DOC_ORDER_LINE": {
          "type": "string",
          "maxLength": 5
        },
        "BATCH": {
          "type": "string",
          "maxLength": 10
        },
        "KIT_SIZE": {
          "type": "string",
          "maxLength": 7
        },
        "INSPECTION_TYPE": {
          "type": "string",
          "maxLength": 1
        },
        "SAP_INTER_ORDER": {
          "type": "string",
          "maxLength": 10
        },
        "SAP_INTER_ORDER_LINE": {
          "type": "string",
          "maxLength": 5
        },
        "MILSTRIP": {
          "type": "string",
          "maxLength": 14
        },
        "MLSTRP_SPLIT": {
          "type": "string",
          "maxLength": 1
        },
        "LOT": {
          "type": "string",
          "maxLength": 8
        },
        "RESERVATION_ORDER": {
          "type": "string",
          "maxLength": 10
        },
        "RECEIPT": {
          "type": "string",
          "maxLength": 20
        },
        "RECEIPT_LINE": {
          "type": "string",
          "maxLength": 7
        },
        "SERIAL": {
          "type": "string",
          "maxLength": 18
        },
        "ASN_MAINTENANCE_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LAST_CNT_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_INSPECTION_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOADID": {
          "type": "string",
          "maxLength": 20
        },
        "ASN_EXPIRATION_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_HU": {
          "type": "string",
          "maxLength": 20
        },
        "ASN_SKU_WMS": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "ASN_COL_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_CHARGE_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_ALLOW_PICK": {
          "type": "string",
          "maxLength": 1
        },
        "ASN_VERSION": {
          "type": "string",
          "maxLength": 50
        },
        "ASN_VERSION_DATE": {
          "type": "string",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ASN_LOAD_UM": {
          "type": "string",
          "maxLength": 10
        },
        "ASN_UM_UNITS": {
          "type": "string",
          "maxLength": 17
        },
        "ASN_WMS_STAT": {
          "type": "string",
          "maxLength": 10
        },
        "ASN_BLOCK": {
          "type": "string",
          "maxLength": 10
        },
        "ASN_HU_TYPE": {
          "type": "string",
          "maxLength": 10
        },
        "ASN_KIT_ORDER": {
          "type": "string",
          "maxLength": 7
        },
        "ASN_SUB_SERIES": {
          "type": "string",
          "maxLength": 20
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "REC_DOC",
        "WMS_ORD_TP",
        "SHIP_CON",
        "PICK_POINT",
        "ORDER_TOLERANCE",
        "SERIAL"
      ],
      "additionalProperties": true,
      "x-interface-num": "24.2",
      "x-interface-name": "ZWMS_INT_SAP_VISUT_WMS_EQ_SP_I",
      "x-interface-name-heb": "",
      "x-basic-types": [],
      "x-description": "וויסות לשינוע פנימי ממחסן SAP (#24.2)",
      "x-color": "#ec4899"
    },
    "Interface25": {
      "title": "Interface 25",
      "description": "Payload schema when INTERFACE_NAME is 'ZSD_WMS_OUTBOUND_ORDER_DELIVER'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 30
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנת WMS",
          "maxLength": 3
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "סוג מסמך מקור",
          "maxLength": 2
        },
        "SAP_DOCUMENT_TYPE": {
          "type": "string",
          "description": "סוג מסמך הקוד ב SAP (לא חובה) (סוג אובייקט מקור מה SAP )",
          "maxLength": 4
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר אסמכתא SAP (מספר ההזמנה \\אספקה) שדה מוביל  תהליכי, במידה והזמנה מפוצלת שדה זה שדה מרכז",
          "maxLength": 10
        },
        "REF_DOC_NUM": {
          "type": "string",
          "description": "מספר הזמנת מקור (SAP) (עבור החזרה לספק)",
          "maxLength": 10
        },
        "SUPPLYING_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך אספקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "SUPPLYING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מנפק",
          "maxLength": 4
        },
        "CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "CUSTOMER_TYPE": {
          "type": "string",
          "description": "סוג לקוח",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסון מקבל",
          "maxLength": 4
        },
        "DELIVERY_PRIORITY": {
          "type": "string",
          "description": "עדיפות אספקה",
          "maxLength": 2
        },
        "SHIP_CON": {
          "type": "string",
          "description": "סוג משלוח (סוג אספקה)",
          "maxLength": 2
        },
        "ORDERING_CUSTOMER": {
          "type": "string",
          "description": "לקוח מזמין - מקבל",
          "maxLength": 10
        },
        "CONTACT_PERSON_NAME": {
          "type": "string",
          "description": "שם איש קשר",
          "maxLength": 35
        },
        "CONTACT_PERSON_PHONE": {
          "type": "string",
          "description": "טלפון איש קשר",
          "maxLength": 10
        },
        "TRANSIT_DOCKING_PLANT": {
          "type": "string",
          "description": "אתר ביניים (מרחב מפיץ)",
          "maxLength": 4
        },
        "EMERGENCY_COORDINATES_WIDTH": {
          "type": "string",
          "description": "נקודת נ\"צ רוחב חירום",
          "maxLength": 18
        },
        "EMERGENCY_COORDINATES_LENGTH": {
          "type": "string",
          "description": "נקודת נ\"צ אורך חירום",
          "maxLength": 18
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה במסמך SAP (הזמנה\\אספקה)",
          "minLength": 1,
          "maxLength": 6
        },
        "DELETION_INDIC": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "CROSS_DOCK": {
          "type": "string",
          "description": "סמן קרוסדוק",
          "maxLength": 1
        },
        "Material": {
          "type": "string",
          "description": "מקט-SKU",
          "minLength": 1,
          "maxLength": 120
        },
        "Batch": {
          "type": "string",
          "description": "סדרה(שורה)",
          "maxLength": 10
        },
        "Version": {
          "type": "string",
          "description": "גירסה"
        },
        "QUANTITIY": {
          "type": "string",
          "description": "כמות של חומר",
          "maxLength": 18
        },
        "STOCK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "RESERVE_NUM": {
          "type": "string",
          "description": "מספר שריון",
          "maxLength": 10
        },
        "FOOD_PACKING": {
          "type": "string",
          "description": "סמן מארזי מזון (הרכבת מנות מוצבים)",
          "maxLength": 1
        },
        "MESIMA_ASHBARATIT": {
          "type": "string",
          "description": "משימה השברתית (קוד מבצע)",
          "maxLength": 12
        },
        "MANPAR_NOTES": {
          "type": "string",
          "description": "הערות מנפ\"ר למחסנאי",
          "maxLength": 50
        },
        "KOSHER": {
          "type": "string",
          "description": "כושר",
          "maxLength": 2
        },
        "SERIAL_TYPE": {
          "type": "string",
          "description": "מזהה סיראלי(מסד\\צ')",
          "maxLength": 4
        },
        "MOVEMENT_TYPE": {
          "type": "string",
          "description": "קוד סוג תנועה",
          "maxLength": 3
        },
        "MOVEMENT_REASON": {
          "type": "string",
          "description": "קוד סיבה לתנועה",
          "maxLength": 4
        },
        "WMS_STATUS": {
          "type": "string",
          "description": "סטטוס זכיין",
          "maxLength": 3
        },
        "SERIAL_NUMBER": {
          "type": "string",
          "description": "סריאלי(שורה)",
          "maxLength": 18
        },
        "CYCLE_ACTIVITY_TYPE": {
          "type": "string",
          "description": "סוג פעילות מחזורית",
          "maxLength": 2
        },
        "CYCLE_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "INSPECTION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - בחינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MAINTENANCE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - תחזוקה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CALIBRATION_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - כיול",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "CHARGE_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - טעינה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXTRA_ACTIVITY_DATE": {
          "type": "string",
          "description": "תאריך פעילות מחזורית - פעילות נוספת",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_ORD_TP",
        "DOCUMENT_CATEGORY",
        "DOCUMENT_NUM_SAP",
        "SUPPLYING_PLANT",
        "DELIVERY_DATE",
        "SUPPLYING_STORAGE_LOCATION",
        "CUSTOMER",
        "CUSTOMER_TYPE",
        "SHIP_CON",
        "ORDERING_CUSTOMER",
        "DOCUMENT_ITEM_SAP",
        "Material",
        "QUANTITIY"
      ],
      "additionalProperties": true,
      "x-interface-num": "25",
      "x-interface-name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
      "x-interface-name-heb": "אספקה ללא סימוכין לצורך ניפוק הפצה לספק",
      "x-basic-types": [
        "ZWMS_NO_REF_WMS",
        "ZWMS_DELL_SAP"
      ],
      "x-description": "אספקה ללא סימוכין לצורך ניפוק לספק (#25)",
      "x-color": "#84cc16"
    },
    "Interface26.1": {
      "title": "Interface 26.1",
      "description": "Payload schema when INTERFACE_NAME is 'ZIM_WMS_WORK_INSTRUCTIONS_STO'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_DOC_TYPE": {
          "type": "string",
          "description": "סוג המסמך ב WMS",
          "maxLength": 20
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר אספקה/הזמנה- מספר תעודה ב WMS",
          "maxLength": 10
        },
        "SAP_ORDER_TYPE": {
          "type": "string",
          "description": "סוג המסמך\\ ההזמנה בSAP",
          "maxLength": 4
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירת המסמך ב-SAP",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות לכותרת",
          "maxLength": 255
        },
        "SOLD_TO": {
          "type": "string",
          "description": "לקוח מזמין",
          "maxLength": 10
        },
        "ZZWMS_RECEIVING_DOCUMENT": {
          "type": "string",
          "description": "תעודת קליטה",
          "maxLength": 25
        },
        "ZZWMS_RECEIVING_DOC_ITEM": {
          "type": "string",
          "description": "שורה בתעודת קליטה",
          "maxLength": 7
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורה בהזמנה",
          "maxLength": 6
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צה\"לי",
          "maxLength": 100
        },
        "ORDER_QTY": {
          "type": "string",
          "description": "כמות בשורה לביצוע",
          "maxLength": 17
        },
        "FROM_BATCH": {
          "type": "string",
          "description": "הסדרה ממנה מתבצעת ההמרה",
          "maxLength": 10
        },
        "FSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי ממנו מתבצעת ההמרה",
          "maxLength": 1
        },
        "BATCH_STATUS": {
          "type": "string",
          "description": "סטטוס הסדרה",
          "maxLength": 1
        },
        "TSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "ISSUE_PLANT": {
          "type": "string",
          "description": "אתר מנפק",
          "maxLength": 4
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר מקבל",
          "maxLength": 4
        },
        "ISSUE_ST_LOC": {
          "type": "string",
          "description": "אתר אחסון מנפק-שורה",
          "maxLength": 4
        },
        "RECEIVING_ST_LOC": {
          "type": "string",
          "description": "אתר אחסון מקבל-שורה",
          "maxLength": 4
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך יעד לביצוע",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "LINE_TEXT": {
          "type": "string",
          "description": "הערות לכותרת",
          "maxLength": 255
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "ניהול צבאי\\זכיין",
          "maxLength": 1
        },
        "TOLERANCE": {
          "type": "string",
          "description": "אחוז טולרנס",
          "maxLength": 4
        },
        "DELETION_INDICATOR": {
          "type": "string",
          "description": "סמן מחיקה",
          "maxLength": 1
        },
        "ORDER_REASON": {
          "type": "string",
          "description": "סיבה להזמנה",
          "maxLength": 3
        },
        "EXPIRED_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "קוד ספק",
          "maxLength": 10
        },
        "TO_RESERVATION": {
          "type": "string",
          "description": "לשריון",
          "maxLength": 10
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "פרופיל סריאלי",
          "maxLength": 4
        },
        "FROM_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_DOC_TYPE",
        "REC_DOC",
        "SAP_ORDER_TYPE",
        "CREATE_DATE",
        "REC_DOC_LINE",
        "MATERIAL",
        "ORDER_QTY",
        "ISSUE_PLANT",
        "ISSUE_ST_LOC",
        "DELIVERY_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "26.1",
      "x-interface-name": "ZIM_WMS_WORK_INSTRUCTIONS_STO",
      "x-interface-name-heb": "עבודות ערך מוסף מה SAP שינוי מאפייני מלאי הנחיות מלאי – הזמנה",
      "x-basic-types": [
        "ZIM_WMS_WORK_INSTRUCTIONS_STO"
      ],
      "x-description": "פקודת עבודה מ-SAP שינוי מאפייני מלאי (#26.1)",
      "x-color": "#f97316"
    },
    "Interface26.2": {
      "title": "Interface 26.2",
      "description": "Payload schema when INTERFACE_NAME is 'ZIM_WMS_WORK_INSTRUCTIONS'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "WMS_DOC_TYPE": {
          "type": "string",
          "description": "סוג המסמך ב WMS",
          "maxLength": 20
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירת המסמך ב-SAP",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "DELIVERY_DATE": {
          "type": "string",
          "description": "תאריך יעד לביצוע",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "HEADER_TEXT": {
          "type": "string",
          "description": "הערות לכותרת",
          "maxLength": 255
        },
        "ARMY_MANAGED": {
          "type": "string",
          "description": "ניהול צבאי\\זכיין",
          "maxLength": 1
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר אספקה/ מספר תעודה ב WMS",
          "maxLength": 10
        },
        "ISSUE_PLANT": {
          "type": "string",
          "description": "אתר אספקה",
          "maxLength": 4
        },
        "SAP_ORDER_TYPE": {
          "type": "string",
          "description": "סוג המסמך\\ ההזמנה בSAP",
          "maxLength": 4
        },
        "ISSUE_STLOC": {
          "type": "string",
          "description": "אתר אחסון מנפק-שורה",
          "maxLength": 4
        },
        "FROM_MATERIAL": {
          "type": "string",
          "description": "מק\"ט צה\"לי",
          "minLength": 1,
          "maxLength": 120
        },
        "FSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "BATCH_STATUS": {
          "type": "string",
          "description": "סטטוס סדרה",
          "maxLength": 1
        },
        "ORDER_QTY": {
          "type": "string",
          "description": "כמות בשורה לביצוע",
          "maxLength": 17
        },
        "FROM_BATCH": {
          "type": "string",
          "description": "הסדרה ממנה ממתבצעת ההמרה",
          "maxLength": 10
        },
        "SERIAL_PROF": {
          "type": "string",
          "description": "פרופיל סריאלי",
          "maxLength": 4
        },
        "FROM_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        },
        "TO_MATERIAL": {
          "type": "string",
          "description": "מקט אליו ממירים-סדרה או מלאי",
          "minLength": 1,
          "maxLength": 120
        },
        "TSTK_TYPE": {
          "type": "string",
          "description": "סוג מלאי",
          "maxLength": 1
        },
        "TO_BATCH_STATUS": {
          "type": "string",
          "description": "סטטוס סדרה",
          "maxLength": 1
        },
        "TO_ORDER_QTY": {
          "type": "string",
          "description": "כמות בשורה לביצוע",
          "maxLength": 15
        },
        "TO_BATCH": {
          "type": "string",
          "description": "הסדרה אליה ממתבצעת ההמרה",
          "maxLength": 10
        },
        "TO_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "WMS_DOC_TYPE",
        "CREATE_DATE",
        "DELIVERY_DATE",
        "REC_DOC",
        "ISSUE_PLANT",
        "SAP_ORDER_TYPE",
        "ISSUE_STLOC",
        "FROM_MATERIAL",
        "ORDER_QTY",
        "TO_MATERIAL"
      ],
      "additionalProperties": true,
      "x-interface-num": "26.2",
      "x-interface-name": "ZIM_WMS_WORK_INSTRUCTIONS",
      "x-interface-name-heb": "עבודות ערך מוסף מה SAP שינוי מאפייני מלאי הנחיות מלאי – אספקה",
      "x-basic-types": [
        "ZIM_WMS_WORK_INSTRUCTIONS"
      ],
      "x-description": "פקודת עבודה מ-SAP שינוי מאפייני מלאי (#26.2)",
      "x-color": "#6366f1"
    },
    "Interface27": {
      "title": "Interface 27",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_KIT_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "CREATE_TIME": {
          "type": "string",
          "description": "שעת מסמך - חותמת זמן (שעות ודקות)",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך מסמך - חותמת זמן",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "ORDER_NUMBER": {
          "type": "string",
          "description": "מספר פקע",
          "maxLength": 25
        },
        "END_DATE": {
          "type": "string",
          "description": "תאריך סיום פקע",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "WMS_DOC_TYPE": {
          "type": "string",
          "description": "סוג המסמך ב WMS",
          "enum": [
            "1.assembly",
            "2.dissassmbly"
          ]
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "אתר",
          "maxLength": 4
        },
        "ORDER_INTOF": {
          "type": "string",
          "description": "שורה בפקע",
          "maxLength": 4
        },
        "FROM_BATCH": {
          "type": "string",
          "description": "סידרה ערכה",
          "maxLength": 10
        },
        "FROM_MATERIAL": {
          "type": "string",
          "description": "מק\"ט ערכה",
          "minLength": 1,
          "maxLength": 120
        },
        "FROM_ORDER_QTY": {
          "type": "string",
          "description": "כמות ערכה",
          "maxLength": 17
        },
        "ISSUE_STLOC": {
          "type": "string",
          "description": "אתר אחסון",
          "maxLength": 4
        },
        "KIT_LOCATION": {
          "type": "string",
          "description": "מיקום פריט בערכה",
          "maxLength": 4
        },
        "RECIVING_STLOC": {
          "type": "string",
          "description": "אתר אחסון",
          "maxLength": 4
        },
        "TO_MATERIAL": {
          "type": "string",
          "description": "מקט"
        },
        "TO_ORDER_QTY": {
          "type": "string",
          "description": "כמות",
          "maxLength": 17
        },
        "TO_BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "ORDER_INTOT": {
          "type": "string",
          "description": "שורה בפקע",
          "maxLength": 4
        },
        "FROM_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        },
        "TO_SERIAL_NUMBER": {
          "type": "string",
          "description": "מסד\\צ",
          "maxLength": 18
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "CREATE_TIME",
        "CREATE_DATE",
        "ORDER_NUMBER",
        "END_DATE",
        "WMS_DOC_TYPE",
        "RECEIVING_PLANT",
        "ORDER_INTOF",
        "FROM_MATERIAL",
        "FROM_ORDER_QTY",
        "ISSUE_STLOC",
        "KIT_LOCATION",
        "RECIVING_STLOC",
        "TO_MATERIAL",
        "TO_ORDER_QTY",
        "ORDER_INTOT"
      ],
      "additionalProperties": true,
      "x-interface-num": "27",
      "x-interface-name": "ZMM_WMS_KIT_OUTBOUND",
      "x-interface-name-heb": "עבודות ערך מוסף מה SAP הרכבה",
      "x-basic-types": [
        "ZMM_WMS_PPROD_CREATE_KIT",
        "ZMM_WMS_KIT_UPDATE",
        "ZMM_WMS_KITM_UPDATE_KIT",
        "ZMM_WMS_PPROD_DISM_KIT"
      ],
      "x-description": "עבודות ערך מוסף מ-SAP פירוק/הרכבה (#27)",
      "x-color": "#14b8a6"
    },
    "Interface29": {
      "title": "Interface 29",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_SKU_UPDATE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד דינמי בהתאם בעלים של המלאי",
          "maxLength": 20
        },
        "MATERIAL": {
          "type": "string",
          "description": "מקט צהלי",
          "minLength": 1,
          "maxLength": 120
        },
        "MATERIALTYPE": {
          "type": "string",
          "description": "סוג הפריט צהלי או ייצרן"
        },
        "DESCRIPTION_HE": {
          "type": "string",
          "description": "תיאור הפריט של ה SKU תמיד של מקט ייצרן",
          "minLength": 100,
          "maxLength": 1
        },
        "DESCRIPTION_SHORT": {
          "type": "string",
          "description": "תיאור קצר של הפריט",
          "maxLength": 50
        },
        "MANUFACTURER_NUMBER": {
          "type": "string",
          "description": "קוד ספק"
        },
        "ITEM_CLASS": {
          "type": "string",
          "description": "פרופיל פריט",
          "maxLength": 10
        },
        "STATUS": {
          "type": "string",
          "description": "סטאטוס פריט",
          "maxLength": 1
        },
        "WMS_MATERIAL_GROUP": {
          "type": "string",
          "description": "קבוצת פריטים",
          "maxLength": 10
        },
        "IMAGE": {
          "type": "string",
          "description": "תמונת פריט"
        },
        "NEW_ITEM": {
          "type": "string",
          "description": "מקט חדש",
          "maxLength": 1
        },
        "STOCK_INDICATOR": {
          "type": "string",
          "description": "מנוהל מלאי כן/לא",
          "maxLength": 1
        },
        "INITIALSTATUS": {
          "type": "string",
          "description": "סטאטוס לקליטה ברירת מחדל",
          "maxLength": 10
        },
        "HUTYPE": {
          "type": "string",
          "description": "סוג יחידת ניטול",
          "maxLength": 20
        },
        "DEFAULTUOM": {
          "type": "string",
          "description": "יחידת מידה ברירת מחדל",
          "maxLength": 10
        },
        "DEFAULTRECUOM": {
          "type": "string",
          "description": "יחידת מידה ברירת מחדל לקליטה",
          "maxLength": 10
        },
        "OVERRECEIVEPCT": {
          "type": "string",
          "description": "אחוז קליטת יתר",
          "maxLength": 18
        },
        "OVERPICKPCT": {
          "type": "string",
          "description": "אחוז ליקוט יתר",
          "maxLength": 18
        },
        "NOTES": {
          "type": "string",
          "description": "הערות כלליות לפריט",
          "maxLength": 255
        },
        "COUNTTOLERANCE": {
          "type": "string",
          "description": "פקטור בספירה להתראה",
          "maxLength": 10
        },
        "CYCLECOUNTINT": {
          "type": "string",
          "description": "מספר ימים לספירה מחזורית",
          "maxLength": 10
        },
        "LOWLIMITCOUNT": {
          "type": "string",
          "description": "סף מינימום לספירה",
          "maxLength": 10
        },
        "OPORTUNITYREPLFLAG": {
          "type": "string",
          "description": "רענון מזדמן",
          "minLength": 1
        },
        "STORAGECLASS": {
          "type": "string",
          "description": "סוג אחסון",
          "maxLength": 20
        },
        "PICKSORTORDER": {
          "type": "string",
          "description": "סדר ליקוט (מעיכות)",
          "maxLength": 10
        },
        "BASEITEM": {
          "type": "string",
          "description": "פריט בסיס",
          "maxLength": 10
        },
        "PUTAWAYNOTES": {
          "type": "string",
          "description": "הערות לפיזור",
          "maxLength": 255
        },
        "PACKNOTES": {
          "type": "string",
          "description": "הערות לאריזה",
          "maxLength": 255
        },
        "WONOTES": {
          "type": "string",
          "description": "הערות לפק\"ע",
          "maxLength": 255
        },
        "RECADDITIONALWORK": {
          "type": "string",
          "description": "עבודות משלימות לקבלה",
          "maxLength": 1
        },
        "KITFACTOR": {
          "type": "string",
          "description": "פקטור תזמון לקיט",
          "maxLength": 10
        },
        "GENERALSKU": {
          "type": "string",
          "description": "מק\"ט כללי",
          "maxLength": 1
        },
        "WEIGHTTYPE": {
          "type": "string",
          "description": "סוג פריט שקיל",
          "maxLength": 20
        },
        "LINGEROUTTIME": {
          "type": "string",
          "description": "זמן שהייה מחוץ לאיזור הטמפרטורה באחסון",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONFIRMSKUONPICK": {
          "type": "string",
          "description": "דורש אימות פריט בליקוט",
          "maxLength": 1
        },
        "PRINTSKULBLREC": {
          "type": "string",
          "description": "הפקת מדבקת פריט בקבלה",
          "maxLength": 1
        },
        "REQINSPECTIONREC": {
          "type": "string",
          "description": "דורש בקרת איכות בקליטה",
          "maxLength": 1
        },
        "SAMPLESIZE": {
          "type": "string",
          "description": "גודל דוגמה",
          "maxLength": 18
        },
        "LEADITEM": {
          "type": "string",
          "description": "מק\"ט מקבץ",
          "maxLength": 120
        },
        "LEADITEM_SIZE": {
          "type": "string",
          "description": "מידה של המקט המקבץ",
          "maxLength": 18
        },
        "VELOCITYGROUP": {
          "type": "string",
          "description": "קבוצת מהירות",
          "maxLength": 10
        },
        "PHARMACYINSPECTION": {
          "type": "string",
          "description": "בקרת רוקח",
          "maxLength": 1
        },
        "G29": {
          "type": "string",
          "description": "29 ג",
          "maxLength": 1
        },
        "WEIGHTTOLERANCEPCT": {
          "type": "string",
          "description": "אחוז סטייה בשקילה",
          "maxLength": 18
        },
        "UOM": {
          "type": "string",
          "description": "יחידת המידה",
          "maxLength": 10
        },
        "EANUPC": {
          "type": "string",
          "description": "ברקוד אריזה",
          "maxLength": 20
        },
        "QUANTITY": {
          "type": "string",
          "description": "יחידות",
          "maxLength": 18
        },
        "BRGEW": {
          "type": "string",
          "description": "משקל ברוטו",
          "maxLength": 18
        },
        "NTGEW": {
          "type": "string",
          "description": "משקל נטו",
          "maxLength": 18
        },
        "LAENG": {
          "type": "string",
          "description": "אורך",
          "maxLength": 18
        },
        "BREIT": {
          "type": "string",
          "description": "רוחב",
          "maxLength": 18
        },
        "HOEHE": {
          "type": "string",
          "description": "גובה",
          "maxLength": 18
        },
        "VOLUME": {
          "type": "string",
          "description": "נפח",
          "maxLength": 18
        },
        "MEABM": {
          "type": "string",
          "description": "יחידת מידה לייחוס",
          "maxLength": 18
        },
        "SHIPPABLE": {
          "type": "string",
          "description": "ניתן לשילוח",
          "maxLength": 1
        },
        "UNITPERLOWESTUOM": {
          "type": "string",
          "maxLength": 10
        },
        "PACKAGETYPE": {
          "type": "string",
          "description": "סוג חבילה",
          "maxLength": 18
        },
        "GRABTYPE": {
          "type": "string",
          "description": "סוג אריזה",
          "maxLength": 20
        },
        "CASEPREPARATIONTYPE": {
          "type": "string",
          "description": "סוג הכנת מארז",
          "maxLength": 20
        },
        "EACHHANDLINGTYPE": {
          "type": "string",
          "description": "כלי ניטול פריט",
          "maxLength": 20
        },
        "LABORPACKAGETYPE": {
          "type": "string",
          "description": "סוג אריזה לביצוע עבודה",
          "maxLength": 10
        },
        "LABORGRABTYPE": {
          "type": "string",
          "description": "סוג לקיחה לביצוע עבודה",
          "maxLength": 10
        },
        "LABORPREPARATIONTYPE": {
          "type": "string",
          "description": "סוג הכנה לביצוע עבודה",
          "maxLength": 10
        },
        "LABORHANDLINGTYPE": {
          "type": "string",
          "description": "סוג שינוע לביצוע עבודה",
          "maxLength": 10
        },
        "VERSION": {
          "type": "string",
          "description": "סוג הכנה לביצוע עבודה",
          "maxLength": 10
        },
        "VERSIONDESC": {
          "type": "string",
          "description": "סוג שינוע לביצוע עבודה",
          "maxLength": 10
        },
        "KITTYPE": {
          "type": "string",
          "description": "סוג ערכה (אופן ניהול הערכה בסדרה חד-חד-ערכי/ כמותי/ חד-חד-ערכי יחידני/ חד-חד-ערכי מאוחד).",
          "enum": [
            "a",
            "b",
            "c",
            "d"
          ]
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "MATERIAL",
        "MATERIALTYPE",
        "DESCRIPTION_HE",
        "MANUFACTURER_NUMBER",
        "STATUS",
        "NEW_ITEM",
        "STOCK_INDICATOR",
        "INITIALSTATUS",
        "DEFAULTUOM",
        "DEFAULTRECUOM",
        "UOM",
        "QUANTITY",
        "NTGEW",
        "SHIPPABLE"
      ],
      "additionalProperties": true,
      "x-interface-num": "29",
      "x-interface-name": "ZMM_WMS_SKU_UPDATE",
      "x-interface-name-heb": "עדכון פריט",
      "x-basic-types": [
        "ZMM_WMS_SKU_UPDATE"
      ],
      "x-description": "עדכון נתוני פריט (#29)",
      "x-color": "#f43f5e"
    },
    "Interface30": {
      "title": "Interface 30",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_DELIVERY_RECPT_IN'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 20
        },
        "CREATE_TIME": {
          "type": "string",
          "description": "זמן יצירה",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "RECEIPT_TYPE": {
          "type": "string",
          "description": "סוג קליטה",
          "maxLength": 2
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "מאחסן מקבל",
          "maxLength": 4
        },
        "MATERIAL": {
          "type": "string",
          "description": "פריט",
          "minLength": 1,
          "maxLength": 100
        },
        "QTY": {
          "type": "string",
          "description": "כמות HU שהתקבלה",
          "minLength": 1,
          "maxLength": 17
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנה",
          "maxLength": 3
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר הזמנה (אספקה)",
          "maxLength": 10
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 6
        },
        "INCPECTION_NUM": {
          "type": "string",
          "description": "תעודת בחינה",
          "maxLength": 25
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורת קליטה",
          "maxLength": 20
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות",
          "maxLength": 10
        },
        "WAREHOUSEID": {
          "type": "string",
          "description": "מספר מחסן יעד",
          "maxLength": 10
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "EXPIRY_DATE": {
          "type": "string",
          "description": "תאריך תפוגה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PROD_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "מספר ספק",
          "maxLength": 10
        },
        "VENDOR_EXP_DATE": {
          "type": "string",
          "description": "תפוגת ספק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PURPOSE_KIT": {
          "type": "string",
          "description": "ייעוד הערכה",
          "maxLength": 2
        },
        "PASS_KOSHER": {
          "type": "string",
          "description": "כשר/לא כשר לפסח",
          "maxLength": 2
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "CREATE_TIME",
        "CREATE_DATE",
        "RECEIPT_TYPE",
        "RECEIVING_PLANT",
        "MATERIAL",
        "QTY",
        "RECEIVING_STORAGE_LOCATION",
        "WMS_ORD_TP",
        "REC_DOC",
        "REC_DOC_LINE",
        "INCPECTION_NUM",
        "RECEIVING_STORAGE_LOCATION",
        "MATERIAL",
        "QUANTITY",
        "EXPIRY_DATE",
        "PROD_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "30",
      "x-interface-name": "ZMM_WMS_DELIVERY_RECPT_IN",
      "x-interface-name-heb": "סיום קליטת שורת תעודת קליטה",
      "x-basic-types": [
        "ZMM_WMS_DELIVERY_RECPT_ALL_IN"
      ],
      "x-description": "סיום קליטת שורת תעודת קליטה (#30)",
      "x-color": "#a855f7"
    },
    "Interface31": {
      "title": "Interface 31",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_DELIVERY_RECPT_IN'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 20
        },
        "CREATE_TIME": {
          "type": "string",
          "description": "זמן יצירה",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "RECEIPT_TYPE": {
          "type": "string",
          "description": "סוג קליטה",
          "maxLength": 2
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "מאחסן מקבל",
          "maxLength": 4
        },
        "MATERIAL": {
          "type": "string",
          "description": "פריט",
          "minLength": 1,
          "maxLength": 100
        },
        "QTY": {
          "type": "string",
          "description": "כמות HU שהתקבלה",
          "minLength": 1,
          "maxLength": 17
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנה",
          "maxLength": 3
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר הזמנה (אספקה)",
          "maxLength": 10
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 6
        },
        "INCPECTION_NUM": {
          "type": "string",
          "description": "תעודת בחינה",
          "maxLength": 25
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורת קליטה",
          "maxLength": 20
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות",
          "maxLength": 10
        },
        "WAREHOUSEID": {
          "type": "string",
          "description": "מספר מחסן יעד",
          "maxLength": 10
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "EXPIRY_DATE": {
          "type": "string",
          "description": "תאריך תפוגה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PROD_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "מספר ספק",
          "maxLength": 10
        },
        "VENDOR_EXP_DATE": {
          "type": "string",
          "description": "תפוגת ספק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PURPOSE_KIT": {
          "type": "string",
          "description": "ייעוד הערכה",
          "maxLength": 2
        },
        "PASS_KOSHER": {
          "type": "string",
          "description": "כשר/לא כשר לפסח",
          "maxLength": 2
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "CREATE_TIME",
        "CREATE_DATE",
        "RECEIPT_TYPE",
        "RECEIVING_PLANT",
        "MATERIAL",
        "QTY",
        "RECEIVING_STORAGE_LOCATION",
        "WMS_ORD_TP",
        "REC_DOC",
        "REC_DOC_LINE",
        "INCPECTION_NUM",
        "RECEIVING_STORAGE_LOCATION",
        "MATERIAL",
        "QUANTITY",
        "EXPIRY_DATE",
        "PROD_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "31",
      "x-interface-name": "ZMM_WMS_DELIVERY_RECPT_IN",
      "x-interface-name-heb": "סגירת/ביטול תעודת קליטה",
      "x-basic-types": [
        "ZMM_WMS_DELIVERY_RECPT_PRTL_IN"
      ],
      "x-description": "סגירת/ביטול תעודת קליטה (#31)",
      "x-color": "#22c55e"
    },
    "Interface32": {
      "title": "Interface 32",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_DELIVERY_RECPT_IN'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 20
        },
        "CREATE_TIME": {
          "type": "string",
          "description": "זמן יצירה",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "RECEIPT_TYPE": {
          "type": "string",
          "description": "סוג קליטה",
          "maxLength": 2
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "מאחסן מקבל",
          "maxLength": 4
        },
        "MATERIAL": {
          "type": "string",
          "description": "פריט",
          "minLength": 1,
          "maxLength": 100
        },
        "QTY": {
          "type": "string",
          "description": "כמות HU שהתקבלה",
          "minLength": 1,
          "maxLength": 17
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנה",
          "maxLength": 3
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר הזמנה (אספקה)",
          "maxLength": 10
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 6
        },
        "INCPECTION_NUM": {
          "type": "string",
          "description": "תעודת בחינה",
          "maxLength": 25
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורת קליטה",
          "maxLength": 20
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות",
          "maxLength": 10
        },
        "WAREHOUSEID": {
          "type": "string",
          "description": "מספר מחסן יעד",
          "maxLength": 10
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "EXPIRY_DATE": {
          "type": "string",
          "description": "תאריך תפוגה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PROD_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "מספר ספק",
          "maxLength": 10
        },
        "VENDOR_EXP_DATE": {
          "type": "string",
          "description": "תפוגת ספק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PURPOSE_KIT": {
          "type": "string",
          "description": "ייעוד הערכה",
          "maxLength": 2
        },
        "PASS_KOSHER": {
          "type": "string",
          "description": "כשר/לא כשר לפסח",
          "maxLength": 2
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "CREATE_TIME",
        "CREATE_DATE",
        "RECEIPT_TYPE",
        "RECEIVING_PLANT",
        "MATERIAL",
        "QTY",
        "RECEIVING_STORAGE_LOCATION",
        "WMS_ORD_TP",
        "REC_DOC",
        "REC_DOC_LINE",
        "INCPECTION_NUM",
        "RECEIVING_STORAGE_LOCATION",
        "MATERIAL",
        "QUANTITY",
        "EXPIRY_DATE",
        "PROD_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "32",
      "x-interface-name": "ZMM_WMS_DELIVERY_RECPT_IN",
      "x-interface-name-heb": "סגירת תעודת כניסה",
      "x-basic-types": [
        "ZMM_WMS_DELIVERY_CLOSE_IN"
      ],
      "x-description": "סגירת תעודת כניסה (#32)",
      "x-color": "#eab308"
    },
    "Interface33": {
      "title": "Interface 33",
      "description": "Payload schema when INTERFACE_NAME is 'ZMM_WMS_DELIVERY_RECPT_IN'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 20
        },
        "CREATE_TIME": {
          "type": "string",
          "description": "זמן יצירה",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CREATE_DATE": {
          "type": "string",
          "description": "תאריך יצירה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "RECEIPT_TYPE": {
          "type": "string",
          "description": "סוג קליטה",
          "maxLength": 2
        },
        "RECEIPT": {
          "type": "string",
          "description": "מספר תעודת קליטה",
          "maxLength": 20
        },
        "RECEIVING_PLANT": {
          "type": "string",
          "description": "מאחסן מקבל",
          "maxLength": 4
        },
        "MATERIAL": {
          "type": "string",
          "description": "פריט",
          "minLength": 1,
          "maxLength": 100
        },
        "QTY": {
          "type": "string",
          "description": "כמות HU שהתקבלה",
          "minLength": 1,
          "maxLength": 17
        },
        "RECEIVING_STORAGE_LOCATION": {
          "type": "string",
          "description": "אתר אחסנה מקבל",
          "maxLength": 4
        },
        "WMS_ORD_TP": {
          "type": "string",
          "description": "סוג הזמנה",
          "maxLength": 3
        },
        "REC_DOC": {
          "type": "string",
          "description": "מספר הזמנה (אספקה)",
          "maxLength": 10
        },
        "REC_DOC_LINE": {
          "type": "string",
          "description": "מספר שורת הזמנה (אספקה)",
          "maxLength": 6
        },
        "INCPECTION_NUM": {
          "type": "string",
          "description": "תעודת בחינה",
          "maxLength": 25
        },
        "RECEIPT_LINE": {
          "type": "string",
          "description": "שורת קליטה",
          "maxLength": 20
        },
        "QUANTITY": {
          "type": "string",
          "description": "כמות",
          "maxLength": 10
        },
        "WAREHOUSEID": {
          "type": "string",
          "description": "מספר מחסן יעד",
          "maxLength": 10
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "maxLength": 10
        },
        "EXPIRY_DATE": {
          "type": "string",
          "description": "תאריך תפוגה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PROD_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "מספר ספק",
          "maxLength": 10
        },
        "VENDOR_EXP_DATE": {
          "type": "string",
          "description": "תפוגת ספק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "PURPOSE_KIT": {
          "type": "string",
          "description": "ייעוד הערכה",
          "maxLength": 2
        },
        "PASS_KOSHER": {
          "type": "string",
          "description": "כשר/לא כשר לפסח",
          "maxLength": 2
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "CREATE_TIME",
        "CREATE_DATE",
        "RECEIPT_TYPE",
        "RECEIVING_PLANT",
        "MATERIAL",
        "QTY",
        "RECEIVING_STORAGE_LOCATION",
        "WMS_ORD_TP",
        "REC_DOC",
        "REC_DOC_LINE",
        "INCPECTION_NUM",
        "RECEIVING_STORAGE_LOCATION",
        "MATERIAL",
        "QUANTITY",
        "EXPIRY_DATE",
        "PROD_DATE"
      ],
      "additionalProperties": true,
      "x-interface-num": "33",
      "x-interface-name": "ZMM_WMS_DELIVERY_RECPT_IN",
      "x-interface-name-heb": "ביטול קליטה למטען",
      "x-basic-types": [
        "ZMM_WMS_DELIVERY_RECPT_CNCL_IN"
      ],
      "x-description": "ביטול קליטה מטען  (#33)",
      "x-color": "#3b82f6"
    },
    "Interface44": {
      "title": "Interface 44",
      "description": "Payload schema when INTERFACE_NAME is 'APPOINTMENT_ENTRY_RESPONSE'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 50
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "AppointmentID": {
          "type": "string",
          "description": "מספר הזימון",
          "maxLength": 20
        },
        "Status": {
          "type": "string",
          "description": "סטאטוס הזימון (מאושר/מאושר)",
          "maxLength": 1
        },
        "ReasonCode": {
          "type": "string",
          "description": "קוד סיבת דחייה",
          "maxLength": 20
        },
        "Notes": {
          "type": "string",
          "description": "הערות",
          "maxLength": 255
        }
      },
      "required": [
        "DATE",
        "TIME",
        "AppointmentID",
        "Status"
      ],
      "additionalProperties": true,
      "x-interface-num": "44",
      "x-interface-name": "APPOINTMENT_ENTRY_RESPONSE",
      "x-interface-name-heb": "",
      "x-basic-types": [],
      "x-description": "עדכון סטאטוס בקשה אישור כניסה (#44)",
      "x-color": "#f59e0b"
    },
    "Interface45": {
      "title": "Interface 45",
      "description": "Interface 45 — דיווח על יציאת/כניסת רכב  (#45)",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 50
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "VehicleID": {
          "type": "string",
          "description": "מספר הרכב",
          "maxLength": 20
        },
        "Gate": {
          "type": "string",
          "description": "מספר שער",
          "maxLength": 20
        },
        "MovementType": {
          "type": "string",
          "description": "סוג תנועה",
          "maxLength": 1
        },
        "TimeOfMovement": {
          "type": "string",
          "description": "מועד התנועה בשער",
          "enum": [
            "0",
            "1"
          ]
        },
        "AppointmentID": {
          "type": "string",
          "description": "מספר הזימון",
          "maxLength": 20
        }
      },
      "required": [
        "DATE",
        "TIME",
        "VehicleID",
        "Gate",
        "MovementType",
        "TimeOfMovement"
      ],
      "additionalProperties": true,
      "x-interface-num": "45",
      "x-interface-name": "",
      "x-interface-name-heb": "",
      "x-basic-types": [],
      "x-description": "דיווח על יציאת/כניסת רכב  (#45)",
      "x-color": "#10b981"
    },
    "Interface47": {
      "title": "Interface 47",
      "description": "Payload schema when INTERFACE_NAME is 'VEHICLE_EXIT_APPROVAL'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 50
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "AppointmentID": {
          "type": "string",
          "description": "מספר הזימון",
          "maxLength": 20
        },
        "VehicleID": {
          "type": "string",
          "description": "מספר הרכב",
          "maxLength": 20
        }
      },
      "required": [
        "DATE",
        "TIME",
        "AppointmentID",
        "VehicleID"
      ],
      "additionalProperties": true,
      "x-interface-num": "47",
      "x-interface-name": "VEHICLE_EXIT_APPROVAL",
      "x-interface-name-heb": "",
      "x-basic-types": [],
      "x-description": "אישור יציאת רכב מהמתחם  (#47)",
      "x-color": "#ef4444"
    },
    "Interface64": {
      "title": "Interface 64",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_INT_DELIV_RESERVE_UPD'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "maxLength": 20
        },
        "APPOITMENTID": {
          "type": "string",
          "description": "מספר זימון",
          "maxLength": 20
        },
        "APPOITMENT_DATE": {
          "type": "string",
          "description": "תאריך זימון",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "FROMTIME": {
          "type": "string",
          "description": "שעת תחילת זימון",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "TOTIME": {
          "type": "string",
          "description": "שעת סיום זימון",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "STATUS": {
          "type": "string",
          "description": "סטטוס",
          "maxLength": 10
        },
        "DOCUMENT_NUM": {
          "type": "string",
          "description": "מספר מסמך SAP",
          "maxLength": 10
        },
        "DOCUMENT_ITEM": {
          "type": "string",
          "description": "מספר שורה",
          "maxLength": 5
        },
        "DOCUMENT_CATEGORY": {
          "type": "string",
          "description": "הזמנה/אספקה",
          "maxLength": 10
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "APPOITMENTID",
        "APPOITMENT_DATE",
        "FROMTIME",
        "TOTIME",
        "STATUS",
        "DOCUMENT_NUM",
        "DOCUMENT_ITEM",
        "DOCUMENT_CATEGORY"
      ],
      "additionalProperties": true,
      "x-interface-num": "64",
      "x-interface-name": "ZWMS_INT_DELIV_RESERVE_UPD",
      "x-interface-name-heb": "עדכון תוצאות הזימון אישור/דחייה של הביטחון",
      "x-basic-types": [
        "ZWMS_INT_DELIVERY_RESERVE_UPD"
      ],
      "x-description": "עדכון תוצאות הזימון – אישור/דחייה של הביטחון (#64)",
      "x-color": "#8b5cf6"
    },
    "Interface66": {
      "title": "Interface 66",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_ROUTE_CONFIRM'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 4
        },
        "DISTRIBUTION_ROUTE": {
          "type": "string",
          "description": "מספר מסלול",
          "maxLength": 20
        },
        "DISTRIBUTION_DATE": {
          "type": "string",
          "description": "תאריך הפצה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "STATUS": {
          "type": "string",
          "description": "סטטוס",
          "minLength": 2,
          "maxLength": 1
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר הזמנה",
          "minLength": 1,
          "maxLength": 20
        },
        "DOCUMENT_TYPE_SAP": {
          "type": "string",
          "description": "סוג מסמך",
          "maxLength": 2
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה ב-SAP",
          "maxLength": 6
        },
        "ORDERID": {
          "type": "string",
          "description": "מספר תעודת יציאה",
          "minLength": 1,
          "maxLength": 20
        },
        "DOCUMENT_ITEM": {
          "type": "string",
          "description": "מספר שורת תעודת יציאה",
          "maxLength": 5
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "DISTRIBUTION_ROUTE",
        "DISTRIBUTION_DATE",
        "STATUS",
        "DOCUMENT_NUM_SAP",
        "DOCUMENT_TYPE_SAP",
        "DOCUMENT_ITEM_SAP",
        "ORDERID",
        "DOCUMENT_ITEM"
      ],
      "additionalProperties": true,
      "x-interface-num": "66",
      "x-interface-name": "ZWMS_ROUTE_CONFIRM",
      "x-interface-name-heb": "אישור מסלול",
      "x-basic-types": [
        "ZWMS_ROUTE_CONFIRM"
      ],
      "x-description": "אישור מסלול (#66)",
      "x-color": "#06b6d4"
    },
    "Interface67": {
      "title": "Interface 67",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_ROUTE_CONFIRM'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "maxLength": 20
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד קבוע עבור שלושת המרכזים צה\"ל IDF קוד. ATAL קבוע",
          "maxLength": 4
        },
        "DISTRIBUTION_ROUTE": {
          "type": "string",
          "description": "מספר מסלול",
          "maxLength": 20
        },
        "DISTRIBUTION_DATE": {
          "type": "string",
          "description": "תאריך הפצה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "STATUS": {
          "type": "string",
          "description": "סטטוס",
          "minLength": 2,
          "maxLength": 1
        },
        "DOCUMENT_NUM_SAP": {
          "type": "string",
          "description": "מספר הזמנה",
          "minLength": 1,
          "maxLength": 20
        },
        "DOCUMENT_TYPE_SAP": {
          "type": "string",
          "description": "סוג מסמך",
          "maxLength": 2
        },
        "DOCUMENT_ITEM_SAP": {
          "type": "string",
          "description": "מספר שורה ב-SAP",
          "maxLength": 6
        },
        "ORDERID": {
          "type": "string",
          "description": "מספר תעודת יציאה",
          "minLength": 1,
          "maxLength": 20
        },
        "DOCUMENT_ITEM": {
          "type": "string",
          "description": "מספר שורת תעודת יציאה",
          "maxLength": 5
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "DISTRIBUTION_ROUTE",
        "DISTRIBUTION_DATE",
        "STATUS",
        "DOCUMENT_NUM_SAP",
        "DOCUMENT_TYPE_SAP",
        "DOCUMENT_ITEM_SAP",
        "ORDERID",
        "DOCUMENT_ITEM"
      ],
      "additionalProperties": true,
      "x-interface-num": "67",
      "x-interface-name": "ZWMS_ROUTE_CONFIRM",
      "x-interface-name-heb": "ביטול אישור מסלול",
      "x-basic-types": [
        "ZWMS_ROUTE_CONFIRM"
      ],
      "x-description": "ביטול אישור מסלול (#67)",
      "x-color": "#ec4899"
    },
    "Interface71": {
      "title": "Interface 71",
      "description": "Payload schema when INTERFACE_NAME is 'ZIM_WMS_BATCH_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "minLength": 1,
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "minLength": 1,
          "maxLength": 20
        },
        "CHANGE_DATE": {
          "type": "string",
          "description": "תאריך עדכון/יצירה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט",
          "maxLength": 100
        },
        "BATCH": {
          "type": "string",
          "description": "סדרה",
          "minLength": 1,
          "maxLength": 10
        },
        "RESTRICTED": {
          "type": "string",
          "description": "סטטוס הסדרה",
          "maxLength": 1
        },
        "PROD_DATE": {
          "type": "string",
          "description": "תאריך ייצור",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "EXPIRY_DATE": {
          "type": "string",
          "description": "תאריך פג תוקף",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "NEXT_INSPEC": {
          "type": "string",
          "description": "תאריך ביקורת איכות",
          "maxLength": 8
        },
        "VENDOR_BATCH": {
          "type": "string",
          "description": "סדרת ספק",
          "maxLength": 15
        },
        "VENDOR_ID": {
          "type": "string",
          "description": "קוד ספק",
          "maxLength": 10
        },
        "PASS_KOSHER": {
          "type": "string",
          "description": "כשר/לא כשר לפסח",
          "maxLength": 2
        },
        "DATE_1": {
          "type": "string",
          "description": "תאריך ביקורת דלק"
        },
        "DATE_2": {
          "type": "string",
          "description": "תאריך ביקורת דלק"
        },
        "DATE_3": {
          "type": "string",
          "description": "תאריך ביקורת דלק"
        },
        "VENDOR_EXP_DATE": {
          "type": "string",
          "description": "תאריך פגת יצרן לפריט רפואה",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "DATE_5": {
          "type": "string",
          "description": "תאריך 5",
          "maxLength": 8
        },
        "DATE_6": {
          "type": "string",
          "description": "תאריך 6",
          "maxLength": 8
        },
        "PURPOSE_KIT": {
          "type": "string",
          "description": "ייעוד הערכה",
          "maxLength": 2
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "MATERIAL",
        "BATCH",
        "RESTRICTED"
      ],
      "additionalProperties": true,
      "x-interface-num": "71",
      "x-interface-name": "ZIM_WMS_BATCH_OUTBOUND",
      "x-interface-name-heb": "עדכון/יצירת סדרה",
      "x-basic-types": [
        "ZIM_WMS_BATCH_OUTBOUND"
      ],
      "x-description": "יצירת/עדכון סדרה  (#71)",
      "x-color": "#84cc16"
    },
    "Interface72": {
      "title": "Interface 72",
      "description": "Payload schema when INTERFACE_NAME is 'ZPM_WMS_STATUS_NPK_OUTBOUND'",
      "type": "object",
      "properties": {
        "INTERFACE_NAME": {
          "type": "string",
          "description": "שם הממשק שיועבר",
          "minLength": 1,
          "maxLength": 40
        },
        "ID": {
          "type": "string",
          "description": "מספר חד חד ערכי (מה SAP זה יהיה מספר IDOC).",
          "minLength": 1,
          "maxLength": 16
        },
        "PLANT": {
          "type": "string",
          "description": "אתר יעד",
          "maxLength": 4
        },
        "DATE": {
          "type": "string",
          "description": "תאריך שליחת הממשק",
          "pattern": "^\\d{8}$",
          "examples": [
            "20240315"
          ]
        },
        "TIME": {
          "type": "string",
          "description": "שעת שליחת הממשק",
          "pattern": "^\\d{6}$",
          "examples": [
            "143022"
          ]
        },
        "CONSIGNEE": {
          "type": "string",
          "description": "קוד מאחסן - קוד הבעלים של המלאי. קוד קבוע עבור שלושת המרכזים צה\"ל",
          "enum": [
            "ATAL",
            "IDF",
            "AIR"
          ]
        },
        "SERIAL": {
          "type": "string",
          "description": "מספר סריאלי",
          "minLength": 1,
          "maxLength": 18
        },
        "MATERIAL": {
          "type": "string",
          "description": "מק\"ט צה\"ל",
          "maxLength": 100
        },
        "STATUS_ON": {
          "type": "string",
          "description": "סטטוס חסימה",
          "maxLength": 1
        }
      },
      "required": [
        "ID",
        "PLANT",
        "DATE",
        "TIME",
        "CONSIGNEE",
        "SERIAL",
        "MATERIAL"
      ],
      "additionalProperties": true,
      "x-interface-num": "72",
      "x-interface-name": "ZPM_WMS_STATUS_NPK_OUTBOUND",
      "x-interface-name-heb": "כושר אחזקת צ'",
      "x-basic-types": [
        "ZPM_EQUIPMENT_STATUS_NIPUK"
      ],
      "x-description": "כושר אחזקת צ' (#72)",
      "x-color": "#f97316"
    },
    "Interface73": {
      "title": "Interface 73",
      "description": "Payload schema when INTERFACE_NAME is 'ZWMS_DELIVERY_CREATED'",
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": true,
      "x-interface-num": "73",
      "x-interface-name": "ZWMS_DELIVERY_CREATED",
      "x-interface-name-heb": "אספקה יוצאת",
      "x-basic-types": [
        "ZWMS_DELIVERY_CREATED"
      ],
      "x-description": "עדכון תעודת משלוח (#73)",
      "x-color": "#6366f1"
    }
  },
  "x-meta": {
    "catalogue-field-count": 323,
    "interface-count": 40,
    "routable-count": 38,
    "unroutable-count": 2,
    "version": "1.0.0",
    "generated-at": "2026-02-26T12:20:34+00:00",
    "interfaces": [
      {
        "num": "1",
        "name": "ZMM_WMS_MATERIAL_OUTBOUND",
        "name_heb": "פריטי קטלוג",
        "description": "ממשק פריטים (#1)",
        "basic_types": [
          "ZMM_WMS_MATERIAL_OUTBOUND"
        ],
        "color": "#3b82f6"
      },
      {
        "num": "2",
        "name": "ZQM_WMS_INSPECTION_OUTBOUND",
        "name_heb": "בקרת איכות - בחינה במקור",
        "description": "בדיקות איכות מאושרות לקליטה – עבור משק המזון (#2)",
        "basic_types": [
          "ZQM_WMS_INSPECTION_OUTBOUND"
        ],
        "color": "#f59e0b"
      },
      {
        "num": "3",
        "name": "ZSDWMS_CUST_OUTBOUND",
        "name_heb": "לקוחות",
        "description": "ממשק לקוחות - יחידות (#3)",
        "basic_types": [
          "ZSDWMS_CUST_OUTBOUND"
        ],
        "color": "#10b981"
      },
      {
        "num": "4",
        "name": "ZPUR_WMS_VEND_OUTBOUND",
        "name_heb": "ספקים",
        "description": "ממשק ספקים (#4)",
        "basic_types": [
          "ZPUR_WMS_VEND_OUTBOUND"
        ],
        "color": "#ef4444"
      },
      {
        "num": "5",
        "name": "ZWMS_INBOUND_DELIVERY_CREATE",
        "name_heb": "קבלה למלאי (אספקה נכנסת) רכש מקומי",
        "description": "אספקה נכנסת רכש מקומי (#5)",
        "basic_types": [
          "ZWMS_IN_DELIVERY_CREATE_LOCAL",
          "ZWMS_IN_DELIVERY_CREATE_MARKET"
        ],
        "color": "#8b5cf6"
      },
      {
        "num": "6",
        "name": "ZWMS_INBOUND_DELIVERY_CREATE",
        "name_heb": "קבלה למלאי (אספקה נכנסת) רכש חו\"ל",
        "description": "אספקה נכנסת רכש מחו\"ל (#6)",
        "basic_types": [
          "ZWMS_IN_DELIVERY_CREATE_ABORD"
        ],
        "color": "#06b6d4"
      },
      {
        "num": "7",
        "name": "ZWMS_INBOUND_DELIVERY_CREATE",
        "name_heb": "החזרה/תיקון מיחידה משיכה",
        "description": "החזרה/תיקון מיחידה -משיכה  (#7)",
        "basic_types": [
          "ZWMS_UNIT_PULL_WMS"
        ],
        "color": "#ec4899"
      },
      {
        "num": "8",
        "name": "ZWMS_INBOUND_DELIVERY_CREATE",
        "name_heb": "החזרה/תיקון מיחידה דחיפה",
        "description": "החזרה מיחידה/תיקון - דחיפה (#8)",
        "basic_types": [
          "ZWMS_UNIT_PUSH_WMS"
        ],
        "color": "#84cc16"
      },
      {
        "num": "9",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "ניפוק/אספקה ליחידה ממחסן מנוהל WMS",
        "description": "אספקה ליחידה-ממחסן מנוהל   SCExpert  (#9)",
        "basic_types": [
          "ZWMS_WMS_PULL_PUSH_UNIT",
          "ZWMS_WMS_Emergency_Unit",
          "ZWMS_WMS_Loan_Unit"
        ],
        "color": "#f97316"
      },
      {
        "num": "10",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "ניפוק/אספקה ליחידה מסוג משיכה ממחסן מנוהל SAP",
        "description": "אספקה ליחידה מסוג משיכה - ממחסן מנוהל ב-SAP (#10)",
        "basic_types": [
          "ZWMS_SAP_Pull_Unit"
        ],
        "color": "#6366f1"
      },
      {
        "num": "11",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "אספקה ליחידה מסוג דחיפה ממחסן מנוהל SAP",
        "description": "אספקה ליחידה מסוג דחיפה - ממחסן מנוהל ב-SAP (#11)",
        "basic_types": [
          "ZWMS_SAP_Push_Unit"
        ],
        "color": "#14b8a6"
      },
      {
        "num": "12",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "אספקה ליחידה מסוג טרנזיט ממחסן מנוהל WMS יצירת תעודת יציאה",
        "description": "אספקה ליחידה טרנזיט -יצירת תעודת יציאה (#12)",
        "basic_types": [
          "ZWMS_Transit_WMS_Push",
          "ZWMS_Transit_SAP_Push_WMS"
        ],
        "color": "#f43f5e"
      },
      {
        "num": "15",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "החלפות",
        "description": "החלפות (#15)",
        "basic_types": [
          "ZWMS_TRADE_WMS_PUSH_UNIT"
        ],
        "color": "#a855f7"
      },
      {
        "num": "17",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "החזרה לספק",
        "description": "החזרה לספק (#17)",
        "basic_types": [
          "ZWMS_WMS_VENDOR",
          "ZWMS_SAP_VENDOR"
        ],
        "color": "#22c55e"
      },
      {
        "num": "18",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "אספקת מכירה פריטית",
        "description": "אספקת מכירה - פריטית (#18)",
        "basic_types": [
          "ZWMS_SALES_Paritit"
        ],
        "color": "#eab308"
      },
      {
        "num": "19",
        "name": "",
        "name_heb": "",
        "description": "מכירה - LOT - פק\"ע (#19)",
        "basic_types": [],
        "color": "#3b82f6"
      },
      {
        "num": "20",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "מכירה LOT תעודת יציאה",
        "description": "מכירה - LOT – תעודת יציאה (#20)",
        "basic_types": [
          "ZWMS_SALES_LOTS"
        ],
        "color": "#f59e0b"
      },
      {
        "num": "21",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "מכירה מחסן עולמי",
        "description": "מכירה – מחסן עולמי  (#21)",
        "basic_types": [
          "ZWMS_SALES_WORLD"
        ],
        "color": "#10b981"
      },
      {
        "num": "22",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "ויסות פנימי/חיצוני לצורך קליטה (תעודת כניסה, תעודת יציאה, בקשה לשינוע)",
        "description": "וויסות שינוע פנימי/חיצוני (#22)",
        "basic_types": [
          "ZWMS_Int_SAP_VISUT_SAP_EQ_SP",
          "ZWMS_Int_WMS_Visut_WMS",
          "ZWMS_Int_WMS_Visut_SAP",
          "ZWMS_Ext_WMS_Visut_WMS_O",
          "ZWMS_Ext_WMS_Visut_SAP"
        ],
        "color": "#ef4444"
      },
      {
        "num": "23",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "תעודת יציאה בויסות בין מרחבים",
        "description": "וויסות שינוע מרחבי  (#23)",
        "basic_types": [
          "ZWMS_Int_SAP_Visut_WMS_NE_SP_O",
          "ZWMS_Int_SAP_Visut_SAP_NE_SP",
          "ZWMS_Ext_SAP_Visut_WMS_O",
          "ZWMS_Ext_SAP_Visut_SAP"
        ],
        "color": "#8b5cf6"
      },
      {
        "num": "24.1",
        "name": "ZWMS_INBOUND_DELIVERY_CREATE",
        "name_heb": "תעודת כניסה בויסות בין מרחבים - לפי זכיין נקרא 24.1 ויסות מרחבי במרחב המקבל ?",
        "description": "וויסות מרחבי במרחב המקבל (#24.1)",
        "basic_types": [
          "ZWMS_Ext_SAP_Visut_WMS_I",
          "ZWMS_Ext_WMS_Visut_WMS_I",
          "ZWMS_Int_SAP_Visut_WMS_EQ_SP_I",
          "ZWMS_Int_SAP_Visut_WMS_NE_SP_I",
          "ZWMS_Int_SAP_Visut_SAP_NE_SP_I"
        ],
        "color": "#06b6d4"
      },
      {
        "num": "24.2",
        "name": "ZWMS_INT_SAP_VISUT_WMS_EQ_SP_I",
        "name_heb": "",
        "description": "וויסות לשינוע פנימי ממחסן SAP (#24.2)",
        "basic_types": [],
        "color": "#ec4899"
      },
      {
        "num": "25",
        "name": "ZSD_WMS_OUTBOUND_ORDER_DELIVER",
        "name_heb": "אספקה ללא סימוכין לצורך ניפוק הפצה לספק",
        "description": "אספקה ללא סימוכין לצורך ניפוק לספק (#25)",
        "basic_types": [
          "ZWMS_NO_REF_WMS",
          "ZWMS_DELL_SAP"
        ],
        "color": "#84cc16"
      },
      {
        "num": "26.1",
        "name": "ZIM_WMS_WORK_INSTRUCTIONS_STO",
        "name_heb": "עבודות ערך מוסף מה SAP שינוי מאפייני מלאי הנחיות מלאי – הזמנה",
        "description": "פקודת עבודה מ-SAP שינוי מאפייני מלאי (#26.1)",
        "basic_types": [
          "ZIM_WMS_WORK_INSTRUCTIONS_STO"
        ],
        "color": "#f97316"
      },
      {
        "num": "26.2",
        "name": "ZIM_WMS_WORK_INSTRUCTIONS",
        "name_heb": "עבודות ערך מוסף מה SAP שינוי מאפייני מלאי הנחיות מלאי – אספקה",
        "description": "פקודת עבודה מ-SAP שינוי מאפייני מלאי (#26.2)",
        "basic_types": [
          "ZIM_WMS_WORK_INSTRUCTIONS"
        ],
        "color": "#6366f1"
      },
      {
        "num": "27",
        "name": "ZMM_WMS_KIT_OUTBOUND",
        "name_heb": "עבודות ערך מוסף מה SAP הרכבה",
        "description": "עבודות ערך מוסף מ-SAP פירוק/הרכבה (#27)",
        "basic_types": [
          "ZMM_WMS_PPROD_CREATE_KIT",
          "ZMM_WMS_KIT_UPDATE",
          "ZMM_WMS_KITM_UPDATE_KIT",
          "ZMM_WMS_PPROD_DISM_KIT"
        ],
        "color": "#14b8a6"
      },
      {
        "num": "29",
        "name": "ZMM_WMS_SKU_UPDATE",
        "name_heb": "עדכון פריט",
        "description": "עדכון נתוני פריט (#29)",
        "basic_types": [
          "ZMM_WMS_SKU_UPDATE"
        ],
        "color": "#f43f5e"
      },
      {
        "num": "30",
        "name": "ZMM_WMS_DELIVERY_RECPT_IN",
        "name_heb": "סיום קליטת שורת תעודת קליטה",
        "description": "סיום קליטת שורת תעודת קליטה (#30)",
        "basic_types": [
          "ZMM_WMS_DELIVERY_RECPT_ALL_IN"
        ],
        "color": "#a855f7"
      },
      {
        "num": "31",
        "name": "ZMM_WMS_DELIVERY_RECPT_IN",
        "name_heb": "סגירת/ביטול תעודת קליטה",
        "description": "סגירת/ביטול תעודת קליטה (#31)",
        "basic_types": [
          "ZMM_WMS_DELIVERY_RECPT_PRTL_IN"
        ],
        "color": "#22c55e"
      },
      {
        "num": "32",
        "name": "ZMM_WMS_DELIVERY_RECPT_IN",
        "name_heb": "סגירת תעודת כניסה",
        "description": "סגירת תעודת כניסה (#32)",
        "basic_types": [
          "ZMM_WMS_DELIVERY_CLOSE_IN"
        ],
        "color": "#eab308"
      },
      {
        "num": "33",
        "name": "ZMM_WMS_DELIVERY_RECPT_IN",
        "name_heb": "ביטול קליטה למטען",
        "description": "ביטול קליטה מטען  (#33)",
        "basic_types": [
          "ZMM_WMS_DELIVERY_RECPT_CNCL_IN"
        ],
        "color": "#3b82f6"
      },
      {
        "num": "44",
        "name": "APPOINTMENT_ENTRY_RESPONSE",
        "name_heb": "",
        "description": "עדכון סטאטוס בקשה אישור כניסה (#44)",
        "basic_types": [],
        "color": "#f59e0b"
      },
      {
        "num": "45",
        "name": "",
        "name_heb": "",
        "description": "דיווח על יציאת/כניסת רכב  (#45)",
        "basic_types": [],
        "color": "#10b981"
      },
      {
        "num": "47",
        "name": "VEHICLE_EXIT_APPROVAL",
        "name_heb": "",
        "description": "אישור יציאת רכב מהמתחם  (#47)",
        "basic_types": [],
        "color": "#ef4444"
      },
      {
        "num": "64",
        "name": "ZWMS_INT_DELIV_RESERVE_UPD",
        "name_heb": "עדכון תוצאות הזימון אישור/דחייה של הביטחון",
        "description": "עדכון תוצאות הזימון – אישור/דחייה של הביטחון (#64)",
        "basic_types": [
          "ZWMS_INT_DELIVERY_RESERVE_UPD"
        ],
        "color": "#8b5cf6"
      },
      {
        "num": "66",
        "name": "ZWMS_ROUTE_CONFIRM",
        "name_heb": "אישור מסלול",
        "description": "אישור מסלול (#66)",
        "basic_types": [
          "ZWMS_ROUTE_CONFIRM"
        ],
        "color": "#06b6d4"
      },
      {
        "num": "67",
        "name": "ZWMS_ROUTE_CONFIRM",
        "name_heb": "ביטול אישור מסלול",
        "description": "ביטול אישור מסלול (#67)",
        "basic_types": [
          "ZWMS_ROUTE_CONFIRM"
        ],
        "color": "#ec4899"
      },
      {
        "num": "71",
        "name": "ZIM_WMS_BATCH_OUTBOUND",
        "name_heb": "עדכון/יצירת סדרה",
        "description": "יצירת/עדכון סדרה  (#71)",
        "basic_types": [
          "ZIM_WMS_BATCH_OUTBOUND"
        ],
        "color": "#84cc16"
      },
      {
        "num": "72",
        "name": "ZPM_WMS_STATUS_NPK_OUTBOUND",
        "name_heb": "כושר אחזקת צ'",
        "description": "כושר אחזקת צ' (#72)",
        "basic_types": [
          "ZPM_EQUIPMENT_STATUS_NIPUK"
        ],
        "color": "#f97316"
      },
      {
        "num": "73",
        "name": "ZWMS_DELIVERY_CREATED",
        "name_heb": "אספקה יוצאת",
        "description": "עדכון תעודת משלוח (#73)",
        "basic_types": [
          "ZWMS_DELIVERY_CREATED"
        ],
        "color": "#6366f1"
      }
    ]
  }
};

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
const ROUTABLE_NAMES = new Set(
  COMMON_SCHEMA.allOf.map(b => b.if.properties.INTERFACE_NAME.const)
);

// Map interface-name → colour from $defs
const IFACE_COLOURS = Object.fromEntries(
  Object.entries(COMMON_SCHEMA.$defs).map(([key, def]) => [
    def["x-interface-num"], def["x-color"] ?? "#4b5563"
  ])
);

// All interfaces from x-meta, enriched
const INTERFACES = COMMON_SCHEMA["x-meta"].interfaces.map((m) => ({
  num:     m.num,
  name:    m.name,
  title:   m.title || `Interface ${m.num}`,
  desc:    m.description || "",
  color:   m.color ?? IFACE_COLOURS[m.num] ?? "#4b5563",
  routed:  ROUTABLE_NAMES.has(m.name),
  fields:  Object.keys(COMMON_SCHEMA.$defs[`Interface${m.num}`]?.properties ?? {}),
  required: COMMON_SCHEMA.$defs[`Interface${m.num}`]?.required ?? [],
}));

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
function ValidatorApp() {
  const [payloadText, setPayloadText]   = useState(SAMPLES.if2_pass.payload);
  const [result, setResult]             = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeInterface, setActiveInterface] = useState(null);
  const [mainTab, setMainTab]           = useState("validator");

  const validate = useCallback(() => {
    setIsValidating(true);
    setTimeout(() => {
      const r = runValidation(payloadText);
      setResult(r);
      setActiveInterface(r.routedTo?.["x-interface-num"] ?? null);
      setIsValidating(false);
    }, 400);
  }, [payloadText]);

  useEffect(() => { validate(); }, []);

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

  // Fetch /me whenever token changes — validates the token is still good
  useEffect(() => {
    if (!token) { setUser(null); return; }
    fetch(`${API_AUTH}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setUser)
      .catch(() => { localStorage.removeItem("wms_token"); setToken(null); });
  }, [token]);

  const handleLogin  = useCallback(t => setToken(t), []);
  const handleLogout = useCallback(() => {
    localStorage.removeItem("wms_token");
    setToken(null);
    setScreen("login");
  }, []);

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (token) {
    return (
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <_TopNav user={user} onLogout={handleLogout} />
        <div style={{ flex:1 }}>
          <ValidatorApp />
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
    goForgot={() => setScreen("forgot")} />;
}