/**
 * parts/01_UserManagement/LoginScreen.jsx
 * Full-page login with:
 *  — Email + password with show/hide
 *  — Role-based quick-login buttons (demo)
 *  — Account deactivation guard
 *  — Animated entrance
 */

import { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, XCircle, AlertTriangle } from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES } from '@constants/roles';

export default function LoginScreen({ users, onLogin }) {
  const [email,  setEmail]  = useState('');
  const [pwd,    setPwd]    = useState('');
  const [show,   setShow]   = useState(false);
  const [err,    setErr]    = useState('');
  const [busy,   setBusy]   = useState(false);
  const [shake,  setShake]  = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = () => {
    if (!email || !pwd) { setErr('Please enter both email and password.'); triggerShake(); return; }
    setBusy(true); setErr('');
    setTimeout(() => {
      const u = users.find(u => u.email === email && u.password === pwd);
      if (!u) {
        setErr('Invalid email or password. Please try again.');
        triggerShake(); setBusy(false); return;
      }
      if (u.status === 'inactive') {
        setErr('This account has been deactivated. Please contact your Super Admin.');
        triggerShake(); setBusy(false); return;
      }
      onLogin(u);
    }, 700);
  };

  const quickLogin = (role) => {
    const u = users.find(x => x.role === role && x.status === 'active');
    if (u) { setEmail(u.email); setPwd(u.password); setErr(''); }
  };

  const QUICK = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full access'       },
    { role: 'admin',       label: 'Admin',        desc: 'Add & modify'     },
    { role: 'employee',    label: 'Employee',     desc: 'Own profile only' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 50%, #1a1f35 0%, ${C.bg} 60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* Decorative background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp .4s ease' }}>

        {/* ── Logo ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px',
            background: `linear-gradient(135deg,${C.accent},${C.accentDim})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 32px ${C.accent}50`,
          }}>
            <Shield size={30} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>
            PerfManager <span style={{ color: C.accent }}>Pro</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Performance Management System</p>
        </div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: shake ? 'shake .4s ease' : 'none',
        }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
            Sign In
          </h2>

          {/* Error banner */}
          {err && (
            <div style={{
              background: `${C.red}15`, border: `1px solid ${C.red}40`, borderRadius: 10,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            }}>
              <XCircle size={15} color={C.red} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.red }}>{err}</span>
            </div>
          )}

          {/* Email */}
          <Field label="Email Address" required>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
              <input value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                type="email" placeholder="your.email@company.com"
                style={inputStyle()} autoComplete="email"
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password" required style={{ marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
              <input value={pwd} onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                type={show ? 'text' : 'password'} placeholder="••••••••"
                style={{ ...inputStyle(), paddingRight: 40 }} autoComplete="current-password"
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border} />
              <button onClick={() => setShow(s => !s)} type="button"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          {/* Sign-in button */}
          <button onClick={handleLogin} disabled={busy || !email || !pwd}
            style={{
              width: '100%', padding: 13, borderRadius: 12, border: 'none',
              background: (!busy && email && pwd)
                ? `linear-gradient(135deg,${C.accent},${C.accentDim})`
                : C.faint,
              color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.3px',
              cursor: (!busy && email && pwd) ? 'pointer' : 'not-allowed',
              transition: 'all .2s',
              boxShadow: (!busy && email && pwd) ? `0 4px 16px ${C.accent}45` : 'none',
            }}
            onMouseOver={e => { if (!busy && email && pwd) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
            {busy ? 'Authenticating…' : 'Sign In →'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo Quick Login</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Quick login buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK.map(({ role, label, desc }) => (
              <button key={role} onClick={() => quickLogin(role)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${ROLE_COLORS[role]}35`,
                  background: `${ROLE_COLORS[role]}10`,
                  transition: 'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = `${ROLE_COLORS[role]}20`; e.currentTarget.style.borderColor = `${ROLE_COLORS[role]}60`; }}
                onMouseOut={e => { e.currentTarget.style.background = `${ROLE_COLORS[role]}10`; e.currentTarget.style.borderColor = `${ROLE_COLORS[role]}35`; }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: ROLE_COLORS[role] }}>{label}</p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: C.muted, fontSize: 11, marginTop: 20 }}>
          © 2025 PerfManager Pro · All rights reserved · v1.0
        </p>
      </div>

      {/* Keyframe injector */}
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} 80%{transform:translateX(-4px)} }
      `}</style>
    </div>
  );
}

function Field({ label, required, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function inputStyle() {
  return {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: '10px 12px 10px 38px', color: C.text,
    fontSize: 13, outline: 'none', transition: 'border .2s',
  };
}
