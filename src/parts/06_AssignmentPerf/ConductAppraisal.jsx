/**
 * parts/06_AssignmentPerf/ConductAppraisal.jsx
 * Manager conducts a full performance appraisal for an employee.
 * Parameters scored 1–5 across categories, weighted average computed.
 */
import { useState, useEffect } from 'react';
import { User, Calendar, Save, X, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { C, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { Avatar, InputField } from '@components/common';

// Appraisal parameters by category
const APPRAISAL_PARAMS = {
  'Work Quality': [
    { key: 'accuracy',      label: 'Accuracy & Thoroughness', weight: 15 },
    { key: 'output',        label: 'Output & Productivity',   weight: 15 },
    { key: 'initiative',    label: 'Initiative & Ownership',  weight: 10 },
  ],
  'Skills & Knowledge': [
    { key: 'technical',     label: 'Technical / Functional Skills', weight: 15 },
    { key: 'learning',      label: 'Learning & Development',        weight: 10 },
    { key: 'problemsolve',  label: 'Problem Solving',               weight: 10 },
  ],
  'Behaviour & Attitude': [
    { key: 'teamwork',      label: 'Teamwork & Collaboration', weight: 10 },
    { key: 'communication', label: 'Communication Skills',     weight: 10 },
    { key: 'attitude',      label: 'Attitude & Professionalism', weight: 5 },
  ],
};

const ALL_PARAMS = Object.values(APPRAISAL_PARAMS).flat();
const TOTAL_WEIGHT = ALL_PARAMS.reduce((s, p) => s + p.weight, 0); // should be 100

const RATING_LABELS = { 5:'Outstanding', 4:'Exceeds Expectations', 3:'Meets Expectations', 2:'Below Expectations', 1:'Needs Improvement' };
const PERIODS = ['Annual 2024–25','Annual 2025–26','H1 2025','H2 2025','Q1 2025','Q2 2025','Q3 2025','Q4 2025'];

let _aid = Date.now() + 3000;
const genAppraisalId = () => `APR-${String(++_aid).slice(-6)}`;

export default function ConductAppraisal({ currentUser, users, allUsers, editTarget, onSave, onCancel }) {
  const [employeeId,  setEmployeeId]  = useState(editTarget?.employeeId || '');
  const [period,      setPeriod]      = useState(editTarget?.period || PERIODS[0]);
  const [scores,      setScores]      = useState(editTarget?.scores || {});
  const [summary,     setSummary]     = useState(editTarget?.summary || '');
  const [strengths,   setStrengths]   = useState(editTarget?.strengths || '');
  const [improvement, setImprovement] = useState(editTarget?.improvement || '');
  const [goalsNext,   setGoalsNext]   = useState(editTarget?.goalsNext || '');
  const [expanded,    setExpanded]    = useState({ 'Work Quality': true, 'Skills & Knowledge': true, 'Behaviour & Attitude': true });
  const [errors,      setErrors]      = useState({});

  const emp = allUsers.find(u => u.id === employeeId);

  // Compute weighted overall score
  const filledCount = ALL_PARAMS.filter(p => scores[p.key]).length;
  const weightedScore = filledCount === ALL_PARAMS.length
    ? ALL_PARAMS.reduce((s, p) => s + (scores[p.key] || 0) * p.weight, 0) / TOTAL_WEIGHT
    : 0;
  const overall = parseFloat(weightedScore.toFixed(2));
  const overallColor = RATING_COLORS[Math.round(overall)] || C.muted;

  const setScore = (key, val) => setScores(p => ({ ...p, [key]: val }));
  const toggleCat = (cat) => setExpanded(p => ({ ...p, [cat]: !p[cat] }));

  const validate = () => {
    const e = {};
    if (!employeeId) e.emp = 'Select an employee';
    if (filledCount < ALL_PARAMS.length) e.scores = 'Please rate all parameters';
    if (!summary.trim()) e.summary = 'Overall summary is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id:          editTarget?.id || genAppraisalId(),
      employeeId, period, scores, summary, strengths, improvement, goalsNext,
      overallScore: overall,
      conductedBy: currentUser.id,
      dept:        emp?.dept || '',
      designation: emp?.designation || '',
      status:      'submitted',
      createdAt:   editTarget?.createdAt || new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    });
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 24, animation: 'scaleIn .2s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700 }}>
            {editTarget ? 'Edit Appraisal' : 'Conduct Performance Appraisal'}
          </h3>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Score each parameter 1–5. Overall is auto-computed with weights.</p>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}><X size={18}/></button>
      </div>

      {/* Employee + Period */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 20px', marginBottom: 8 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
            Employee <span style={{ color: C.red }}>*</span>
          </label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}
              style={{ width: '100%', background: C.surface, border: `1px solid ${errors.emp ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px 10px 38px', color: employeeId ? C.text : C.muted, fontSize: 13, outline: 'none', appearance: 'none' }}>
              <option value="">Select employee to appraise…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.designation}</option>)}
            </select>
          </div>
          {errors.emp && <p style={{ color: C.red, fontSize: 11, marginTop: -12, marginBottom: 12 }}>{errors.emp}</p>}
          {emp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.surface, borderRadius: 10, marginBottom: 16 }}>
              <Avatar name={emp.name} size={30} bg={ROLE_COLORS[emp.role]}/>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{emp.name}</p>
                <p style={{ fontSize: 11, color: C.muted }}>{emp.designation} · {emp.dept}</p>
              </div>
            </div>
          )}
        </div>
        <InputField label="Appraisal Period" icon={<Calendar size={14}/>} value={period} onChange={setPeriod} options={PERIODS}/>
      </div>

      {/* Live overall score */}
      {overall > 0 && (
        <div style={{ background: `${overallColor}10`, border: `1px solid ${overallColor}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 36, fontWeight: 800, color: overallColor, lineHeight: 1 }}>{overall}</p>
            <p style={{ fontSize: 10, color: overallColor, marginTop: 2 }}>out of 5.00</p>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: overallColor }}>{RATING_LABELS[Math.round(overall)]}</p>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{filledCount}/{ALL_PARAMS.length} parameters rated · Weighted average</p>
          </div>
        </div>
      )}

      {/* Parameter scoring by category */}
      {errors.scores && <p style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{errors.scores}</p>}
      {Object.entries(APPRAISAL_PARAMS).map(([cat, params]) => (
        <div key={cat} style={{ background: C.surface, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          {/* Category header */}
          <div onClick={() => toggleCat(cat)}
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expanded[cat] ? `1px solid ${C.border}` : 'none' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: C.muted }}>{params.filter(p => scores[p.key]).length}/{params.length} rated</span>
              {expanded[cat] ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
            </div>
          </div>

          {expanded[cat] && (
            <div style={{ padding: '12px 16px' }}>
              {params.map(param => {
                const r = scores[param.key] || 0;
                const rColor = RATING_COLORS[r] || C.muted;
                return (
                  <div key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{param.label}</p>
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Weight: {param.weight}%</p>
                    </div>
                    {/* Star buttons */}
                    <div style={{ display: 'flex', gap: 5 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setScore(param.key, n)} type="button"
                          style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${r >= n ? rColor : C.border}`, background: r >= n ? `${rColor}22` : 'none', color: r >= n ? rColor : C.faint, fontSize: 15, cursor: 'pointer', transition: 'all .1s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ★
                        </button>
                      ))}
                    </div>
                    {r > 0 && (
                      <div style={{ minWidth: 110, padding: '3px 10px', borderRadius: 99, background: `${rColor}15`, border: `1px solid ${rColor}30`, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: rColor }}>{r}/5 · {RATING_LABELS[r]?.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Qualitative sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginTop: 20 }}>
        {[
          { label:'Overall Summary', key:'summary', required:true, val:summary, set:setSummary, placeholder:'Summarise overall performance for this period…' },
          { label:'Key Strengths',   key:'strengths', val:strengths, set:setStrengths, placeholder:'List key strengths demonstrated…' },
          { label:'Areas for Improvement', key:'improvement', val:improvement, set:setImprovement, placeholder:'Areas where growth is needed…' },
          { label:'Goals for Next Period',  key:'goalsNext',   val:goalsNext,   set:setGoalsNext,   placeholder:'Recommended goals for next appraisal cycle…' },
        ].map(({ label, key, required, val, set, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
              {label}{required && <span style={{ color: C.red }}> *</span>}
            </label>
            <textarea value={val} onChange={e => set(e.target.value)} rows={3} placeholder={placeholder}
              style={{ width: '100%', background: C.surface, border: `1px solid ${errors[key] ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: '"DM Sans",sans-serif' }}
              onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}/>
            {errors[key] && <p style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors[key]}</p>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 20, borderTop: `1px solid ${C.border}`, marginTop: 20 }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave}
          style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.accent}40` }}>
          <Save size={14}/> Submit Appraisal
        </button>
      </div>
    </div>
  );
}
