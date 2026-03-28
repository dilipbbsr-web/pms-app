/**
 * parts/03_GoalSetting/GoalForm.jsx
 * Create / Edit a SMART goal:
 *  — Title, Description, Category, Priority
 *  — Start date, Target date, Weight (%)
 *  — Target metric (numeric or % or text)
 *  — KRA linkage (from dept default KRAs)
 *  — Submit as Draft or Submit for Approval
 */

import { useState } from 'react';
import { Target, Calendar, Percent, Hash, AlignLeft, Tag, Flag, Save, X, Send } from 'lucide-react';
import { C } from '@constants/theme';
import { DEFAULT_KRAS, KPI_CATEGORIES } from '@constants/departments';
import { PRIORITY_COLORS } from '@constants/theme';
import { InputField } from '@components/common';

const CATEGORIES = ['Performance', 'Learning & Development', 'Leadership', 'Process Improvement', 'Revenue', 'Customer Satisfaction', 'Technical', 'Compliance'];
const PRIORITIES = ['high', 'medium', 'low'];
const METRIC_TYPES = ['Percentage (%)', 'Number', 'Yes / No', 'Score (1–5)', 'Currency (₹)'];

let _gid = Date.now();
const genGoalId = () => `GOAL-${String(++_gid).slice(-6)}`;

export default function GoalForm({ editGoal, currentUser, users, onSave, onCancel }) {
  const isEdit = !!editGoal?.id;
  const kras   = DEFAULT_KRAS[currentUser.designation] || [];
  const kpis   = KPI_CATEGORIES[currentUser.dept]      || [];

  const blank = {
    title: '', description: '', category: 'Performance', priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '', weight: 10,
    metricType: 'Percentage (%)', targetValue: '', currentValue: '0',
    kraLink: '', kpiLink: '', tags: '',
    status: 'draft',
  };

  const [form,   setForm]   = useState(editGoal ? { ...blank, ...editGoal } : blank);
  const [errors, setErrors] = useState({});

  const f = k => v => { setForm(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title      = 'Goal title is required';
    if (!form.targetDate)      e.targetDate = 'Target date is required';
    if (!form.targetValue)     e.targetValue= 'Target value is required';
    if (form.weight < 1 || form.weight > 100) e.weight = 'Weight must be between 1 and 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (submitForApproval = false) => {
    if (!validate()) return;
    const goal = {
      ...form,
      id:         isEdit ? editGoal.id : genGoalId(),
      employeeId: currentUser.id,
      dept:       currentUser.dept,
      designation:currentUser.designation,
      status:     submitForApproval ? 'submitted' : 'draft',
      createdAt:  isEdit ? editGoal.createdAt : new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      progress:   isEdit ? editGoal.progress : 0,
    };
    onSave(goal);
  };

  const progressPct = form.targetValue && form.currentValue
    ? Math.min(100, Math.round((parseFloat(form.currentValue) / parseFloat(form.targetValue)) * 100))
    : 0;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 24, animation: 'scaleIn .2s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit Goal' : 'Create New Goal'}</h3>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>SMART goal for {currentUser.designation} · {currentUser.dept}</p>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={18}/></button>
      </div>

      {/* Row 1: Title + Category */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 20px' }}>
        <InputField label="Goal Title" icon={<Target size={14}/>} value={form.title} onChange={f('title')} placeholder="e.g. Improve sprint velocity by 20%" required error={errors.title}/>
        <InputField label="Category"   icon={<Tag size={14}/>}    value={form.category} onChange={f('category')} options={CATEGORIES}/>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Description</label>
        <textarea value={form.description} onChange={e => f('description')(e.target.value)} rows={3}
          placeholder="Describe what success looks like, how it will be measured, and why it matters…"
          style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: '"DM Sans",sans-serif' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}/>
      </div>

      {/* Row 2: Priority + Weight + Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 16px' }}>
        {/* Priority */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Priority</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => f('priority')(p)} type="button"
                style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${form.priority === p ? PRIORITY_COLORS[p] : C.border}`, background: form.priority === p ? `${PRIORITY_COLORS[p]}20` : 'none', color: form.priority === p ? PRIORITY_COLORS[p] : C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Weight (%) <span style={{ color: C.red }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <Percent size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
            <input type="number" min="1" max="100" value={form.weight} onChange={e => f('weight')(Number(e.target.value))}
              style={{ width: '100%', background: C.surface, border: `1px solid ${errors.weight ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px 10px 34px', color: C.text, fontSize: 13, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}/>
          </div>
          {errors.weight && <p style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{errors.weight}</p>}
        </div>

        <InputField label="Start Date"  icon={<Calendar size={14}/>} value={form.startDate}  onChange={f('startDate')}  type="date"/>
        <div>
          <InputField label="Target Date" icon={<Calendar size={14}/>} value={form.targetDate} onChange={f('targetDate')} type="date" required error={errors.targetDate}/>
        </div>
      </div>

      {/* Row 3: Metric type + target + current */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
        <InputField label="Metric Type"    icon={<Hash size={14}/>}    value={form.metricType}    onChange={f('metricType')}    options={METRIC_TYPES}/>
        <div>
          <InputField label="Target Value"  icon={<Hash size={14}/>}    value={form.targetValue}   onChange={f('targetValue')}   placeholder="e.g. 90" required error={errors.targetValue}/>
        </div>
        <InputField label="Current Value"  icon={<Hash size={14}/>}    value={form.currentValue}  onChange={f('currentValue')}  placeholder="e.g. 0"/>
      </div>

      {/* Live progress preview */}
      {form.targetValue && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: C.surface, borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Progress preview</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{progressPct}%</span>
          </div>
          <div style={{ height: 6, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? C.green : C.accent, borderRadius: 99, transition: 'width .4s ease' }}/>
          </div>
        </div>
      )}

      {/* Row 4: KRA + KPI linkage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <InputField label="Link to KRA" icon={<Flag size={14}/>} value={form.kraLink} onChange={f('kraLink')}
          options={kras.length ? kras : ['No KRAs defined']}
          hint="Links this goal to your role's key result area"/>
        <InputField label="Link to KPI" icon={<Flag size={14}/>} value={form.kpiLink} onChange={f('kpiLink')}
          options={kpis.length ? kpis : ['No KPIs defined']}
          hint="Links this goal to a department KPI"/>
      </div>

      {/* Tags */}
      <InputField label="Tags" icon={<Tag size={14}/>} value={form.tags} onChange={f('tags')} placeholder="e.g. Q1-2025, sprint, customer (comma-separated)" hint="Optional — used for filtering"/>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        <button onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={14}/> Cancel
        </button>
        <button onClick={() => handleSave(false)}
          style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={14}/> Save as Draft
        </button>
        <button onClick={() => handleSave(true)}
          style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.accent}40` }}>
          <Send size={14}/> Submit for Approval
        </button>
      </div>
    </div>
  );
}
