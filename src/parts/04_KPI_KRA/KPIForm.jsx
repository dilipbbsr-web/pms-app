/**
 * parts/04_KPI_KRA/KPIForm.jsx
 * Add / Edit a KPI entry with:
 *  — KPI name (from dept catalogue or custom)
 *  — KRA linkage
 *  — Target, Actual, Period (monthly/quarterly/annual)
 *  — Rating auto-computed from achievement %
 *  — Weight for scorecard
 */

import { useState, useEffect } from 'react';
import { BarChart2, Target, Calendar, Hash, Percent, Tag, Save, X } from 'lucide-react';
import { C, RATING_COLORS } from '@constants/theme';
import { KPI_CATEGORIES, DEFAULT_KRAS } from '@constants/departments';
import { InputField } from '@components/common';

const PERIODS  = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];
const QUARTERS = ['Q1 (Apr–Jun)', 'Q2 (Jul–Sep)', 'Q3 (Oct–Dec)', 'Q4 (Jan–Mar)'];

let _kid = Date.now() + 1000;
const genKPIId = () => `KPI-${String(++_kid).slice(-6)}`;

function calcRating(actual, target) {
  if (!target || !actual) return 0;
  const pct = (parseFloat(actual) / parseFloat(target)) * 100;
  if (pct >= 100) return 5;
  if (pct >= 85)  return 4;
  if (pct >= 70)  return 3;
  if (pct >= 50)  return 2;
  return 1;
}

function calcAchievement(actual, target) {
  if (!target || !actual) return 0;
  return Math.min(200, Math.round((parseFloat(actual) / parseFloat(target)) * 100));
}

export default function KPIForm({ editKPI, currentUser, users, onSave, onCancel }) {
  const isEdit = !!editKPI?.id;
  const kpiOpts = KPI_CATEGORIES[currentUser.dept] || [];
  const kraOpts = DEFAULT_KRAS[currentUser.designation] || [];

  const blank = {
    kpiName: '', kraLink: '', period: 'Quarterly', quarter: 'Q1 (Apr–Jun)',
    year: new Date().getFullYear().toString(),
    targetValue: '', actualValue: '', weight: 10, notes: '',
    metricUnit: '%',
  };

  const [form,   setForm]   = useState(isEdit ? { ...blank, ...editKPI } : blank);
  const [errors, setErrors] = useState({});

  const f = k => v => { setForm(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const achievement = calcAchievement(form.actualValue, form.targetValue);
  const rating      = calcRating(form.actualValue, form.targetValue);
  const ratingColor = RATING_COLORS[rating] || C.muted;

  const RATING_LABELS = { 5: 'Outstanding', 4: 'Exceeds', 3: 'Meets', 2: 'Below', 1: 'Poor', 0: '—' };

  const validate = () => {
    const e = {};
    if (!form.kpiName.trim()) e.kpiName = 'KPI name is required';
    if (!form.targetValue)    e.targetValue = 'Target value is required';
    if (form.weight < 1 || form.weight > 100) e.weight = 'Weight must be 1–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id:          isEdit ? editKPI.id : genKPIId(),
      employeeId:  currentUser.id,
      dept:        currentUser.dept,
      designation: currentUser.designation,
      achievement, rating,
      createdAt:   isEdit ? editKPI.createdAt : new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    });
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 24, animation: 'scaleIn .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit KPI Entry' : 'Add KPI Entry'}</h3>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{currentUser.designation} · {currentUser.dept}</p>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}><X size={18}/></button>
      </div>

      {/* Row 1: KPI name + KRA */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 20px' }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
            KPI Name <span style={{ color: C.red }}>*</span>
          </label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <BarChart2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
            <select value={form.kpiName} onChange={e => f('kpiName')(e.target.value)}
              style={{ width: '100%', background: C.surface, border: `1px solid ${errors.kpiName ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px 10px 38px', color: form.kpiName ? C.text : C.muted, fontSize: 13, outline: 'none', appearance: 'none' }}>
              <option value="">Select KPI or type custom…</option>
              {kpiOpts.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          {errors.kpiName && <p style={{ color: C.red, fontSize: 11, marginTop: -12, marginBottom: 12 }}>{errors.kpiName}</p>}
        </div>
        <InputField label="Link to KRA" icon={<Target size={14}/>} value={form.kraLink} onChange={f('kraLink')} options={kraOpts}/>
      </div>

      {/* Row 2: Period + Quarter + Year + Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 16px' }}>
        <InputField label="Period"    icon={<Calendar size={14}/>} value={form.period}  onChange={f('period')}  options={PERIODS}/>
        <InputField label="Quarter"   icon={<Calendar size={14}/>} value={form.quarter} onChange={f('quarter')} options={QUARTERS}/>
        <InputField label="Year"      icon={<Calendar size={14}/>} value={form.year}    onChange={f('year')}    placeholder="2025"/>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Weight (%) <span style={{ color: C.red }}>*</span></label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Percent size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
            <input type="number" min="1" max="100" value={form.weight} onChange={e => f('weight')(Number(e.target.value))}
              style={{ width: '100%', background: C.surface, border: `1px solid ${errors.weight ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px 10px 34px', color: C.text, fontSize: 13, outline: 'none' }}/>
          </div>
        </div>
      </div>

      {/* Row 3: Target + Actual + Unit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
        <div>
          <InputField label="Target Value" icon={<Hash size={14}/>} value={form.targetValue} onChange={f('targetValue')} placeholder="e.g. 100" required error={errors.targetValue}/>
        </div>
        <InputField label="Actual Value"  icon={<Hash size={14}/>} value={form.actualValue} onChange={f('actualValue')} placeholder="e.g. 87"/>
        <InputField label="Metric Unit"   icon={<Tag size={14}/>}  value={form.metricUnit}  onChange={f('metricUnit')}
          options={['%', 'Number', '₹', 'Hours', 'Days', 'Score', 'Count']}/>
      </div>

      {/* Live achievement preview */}
      {form.targetValue && (
        <div style={{ marginBottom: 16, padding: '14px 18px', background: C.surface, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Achievement</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ratingColor }}>{achievement}%</span>
            </div>
            <div style={{ height: 8, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(achievement, 100)}%`, background: ratingColor, borderRadius: 99, transition: 'width .4s ease' }}/>
            </div>
          </div>
          {rating > 0 && (
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: ratingColor }}>{rating}/5</p>
              <p style={{ fontSize: 11, color: ratingColor, fontWeight: 600 }}>{RATING_LABELS[rating]}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Notes</label>
        <textarea value={form.notes} onChange={e => f('notes')(e.target.value)} rows={2}
          placeholder="Any context, blockers, or observations…"
          style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: '"DM Sans",sans-serif' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}/>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave}
          style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.accent}40` }}>
          <Save size={14}/> {isEdit ? 'Update KPI' : 'Save KPI'}
        </button>
      </div>
    </div>
  );
}
