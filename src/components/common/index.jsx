/**
 * components/common/index.jsx
 * All shared, reusable UI building blocks.
 * Import individually:  import { Avatar, Badge, Modal } from '@components/common'
 */

import { useState } from 'react';
import { X, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '@constants/theme';

// ─────────────────────────────────────────────────────────────────
// Avatar  — initials circle
// ─────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 40, bg = C.blue }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg + '30', border: `2px solid ${bg}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: bg, fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      fontFamily: 'Outfit, sans-serif',
    }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Badge  — coloured pill label
// ─────────────────────────────────────────────────────────────────
export function Badge({ label, color = C.blue }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 99, fontSize: '11px', fontWeight: 600,
      background: `${color}20`, color, border: `1px solid ${color}40`,
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// StatCard  — metric summary tile
// ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = C.accent, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '20px', borderTop: `3px solid ${color}`, cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .2s, box-shadow .2s',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? `0 8px 32px ${color}20` : 'none',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: C.text }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: C.muted, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Modal  — centered overlay dialog
// ─────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(4px)',
      }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
        width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'scaleIn .25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, borderRadius: 8, padding: 4, display: 'flex', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// InputField  — labelled input or select with icon
// ─────────────────────────────────────────────────────────────────
export function InputField({
  label, icon, value, onChange, type = 'text',
  placeholder = '', options, required, error,
  disabled = false, hint,
}) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? C.red : focus ? C.accent : C.border;
  const base = {
    width: '100%', background: C.surface, border: `1px solid ${borderColor}`,
    borderRadius: 10, padding: '10px 12px 10px 38px', color: C.text,
    fontSize: '13px', transition: 'border .2s', opacity: disabled ? 0.5 : 1,
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
          {label}{required && <span style={{ color: C.red }}> *</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focus ? C.accent : C.muted, pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        {options ? (
          <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
            style={{ ...base, appearance: 'none' }}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
            <option value="">Select…</option>
            {options.map(o => (
              <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                {typeof o === 'string' ? o : o.label}
              </option>
            ))}
          </select>
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)} type={type}
            placeholder={placeholder} disabled={disabled} style={base}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        )}
      </div>
      {error && <p style={{ color: C.red, fontSize: '11px', marginTop: 4 }}>{error}</p>}
      {hint && !error && <p style={{ color: C.muted, fontSize: '11px', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PasswordField  — input with show/hide + generate button
// ─────────────────────────────────────────────────────────────────
export function PasswordField({ value, onChange, onGenerate, label = 'Password', required, error }) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input value={value} onChange={e => onChange(e.target.value)} type={show ? 'text' : 'password'}
            style={{ width: '100%', background: C.surface, border: `1px solid ${error ? C.red : focus ? C.accent : C.border}`, borderRadius: 10, padding: '10px 36px 10px 12px', color: C.text, fontSize: '13px', transition: 'border .2s' }}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
          <button onClick={() => setShow(!show)} type="button"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {onGenerate && (
          <button onClick={onGenerate} type="button"
            style={{ padding: '0 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            Generate
          </button>
        )}
      </div>
      {error && <p style={{ color: C.red, fontSize: '11px', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ActionBtn  — small icon button (view / edit / delete)
// ─────────────────────────────────────────────────────────────────
export function ActionBtn({ icon, color = C.blue, title, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button title={title} onClick={onClick} type="button"
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: `1px solid ${hover ? color : C.border}`,
        background: hover ? `${color}20` : 'transparent',
        color: hover ? color : C.muted,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s', cursor: 'pointer',
      }}
      onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onChange, total, perPage }) {
  if (pages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
      <span style={{ fontSize: '12px', color: C.muted }}>Showing {start}–{end} of {total}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: page === 1 ? C.faint : C.text, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${page === p ? C.accent : C.border}`, background: page === p ? `${C.accent}20` : 'none', color: page === p ? C.accent : C.text, fontSize: '13px', fontWeight: page === p ? 600 : 400, cursor: 'pointer' }}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages}
          style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: page === pages ? C.faint : C.text, cursor: page === pages ? 'not-allowed' : 'pointer' }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: C.text }}>{title}</h2>
        {subtitle && <p style={{ color: C.muted, fontSize: '13px', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>{icon}</div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</h3>
      {description && <p style={{ fontSize: '13px', marginBottom: 16 }}>{description}</p>}
      {action}
    </div>
  );
}
