/**
 * parts/03_GoalSetting/GoalTemplates.jsx
 * Pre-built SMART goal templates per department / designation.
 * Employee clicks "Use Template" → GoalForm pre-filled.
 */

import { useState } from 'react';
import { LayoutTemplate, ChevronRight, Search } from 'lucide-react';
import { C, DEPT_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';

// Template catalogue
const TEMPLATES = {
  'Human Resources': [
    { title: 'Reduce Time-to-Hire by 20%',                category: 'Performance',       priority: 'high',   weight: 20, metricType: 'Percentage (%)', targetValue: '20', kraLink: 'Talent Acquisition' },
    { title: 'Achieve 90% Onboarding Satisfaction Score', category: 'Customer Satisfaction', priority: 'medium', weight: 15, metricType: 'Percentage (%)', targetValue: '90', kraLink: 'On-boarding' },
    { title: 'Complete 2 HR Certification Courses',       category: 'Learning & Development', priority: 'low', weight: 10, metricType: 'Number',          targetValue: '2',  kraLink: 'L&D Oversight' },
  ],
  'Software Development': [
    { title: 'Achieve Sprint Velocity of 40 Story Points', category: 'Performance',       priority: 'high',   weight: 25, metricType: 'Number',           targetValue: '40', kraLink: 'Sprint Execution' },
    { title: 'Reduce Bug Escape Rate to Below 5%',        category: 'Technical',          priority: 'high',   weight: 20, metricType: 'Percentage (%)',   targetValue: '5',  kraLink: 'Code Quality' },
    { title: 'Complete AWS Solutions Architect Course',   category: 'Learning & Development', priority: 'medium', weight: 10, metricType: 'Yes / No',      targetValue: 'Yes', kraLink: 'Learning & Development' },
    { title: 'Achieve 80% Test Coverage',                 category: 'Technical',          priority: 'medium', weight: 15, metricType: 'Percentage (%)',   targetValue: '80', kraLink: 'Code Quality' },
  ],
  'Sales & Service': [
    { title: 'Achieve 100% of Quarterly Sales Target',    category: 'Revenue',            priority: 'high',   weight: 30, metricType: 'Percentage (%)',   targetValue: '100', kraLink: 'Quota Achievement' },
    { title: 'Maintain CSAT Score Above 4.5/5',          category: 'Customer Satisfaction', priority: 'high', weight: 20, metricType: 'Score (1–5)',      targetValue: '4.5', kraLink: 'CSAT' },
    { title: 'Generate 50 New Qualified Leads per Month', category: 'Performance',       priority: 'medium', weight: 15, metricType: 'Number',             targetValue: '50', kraLink: 'Lead Generation' },
  ],
  'IT Infrastructure': [
    { title: 'Maintain 99.9% System Uptime',              category: 'Performance',        priority: 'high',   weight: 30, metricType: 'Percentage (%)',   targetValue: '99.9', kraLink: 'Server Management' },
    { title: 'Resolve 95% of Tickets within SLA',        category: 'Performance',        priority: 'high',   weight: 20, metricType: 'Percentage (%)',   targetValue: '95', kraLink: 'Ticket Resolution' },
    { title: 'Complete Security Patch Compliance to 100%',category: 'Compliance',        priority: 'medium', weight: 15, metricType: 'Percentage (%)',   targetValue: '100', kraLink: 'Patch Management' },
  ],
  'BPO / KPO': [
    { title: 'Achieve AHT of Under 5 Minutes',            category: 'Performance',        priority: 'high',   weight: 25, metricType: 'Number',            targetValue: '5',  kraLink: 'Handle Time' },
    { title: 'Maintain FCR Rate Above 85%',               category: 'Customer Satisfaction', priority: 'high', weight: 20, metricType: 'Percentage (%)',   targetValue: '85', kraLink: 'FCR' },
    { title: 'Achieve Quality Score of 90%+',             category: 'Performance',        priority: 'medium', weight: 15, metricType: 'Percentage (%)',   targetValue: '90', kraLink: 'Quality Score' },
  ],
  'Administration': [
    { title: 'Reduce Facility Maintenance Response Time to 2 Hours', category: 'Process Improvement', priority: 'high', weight: 20, metricType: 'Number', targetValue: '2', kraLink: 'Facility Maintenance' },
    { title: 'Achieve 100% Vendor SLA Compliance',         category: 'Compliance',       priority: 'high',   weight: 20, metricType: 'Percentage (%)',   targetValue: '100', kraLink: 'Vendor SLAs' },
    { title: 'Improve Visitor Satisfaction Rating to 4.8', category: 'Customer Satisfaction', priority: 'medium', weight: 15, metricType: 'Score (1–5)',  targetValue: '4.8', kraLink: 'Visitor Handling' },
  ],
};

export default function GoalTemplates({ currentUser, onUseTemplate }) {
  const [q,           setQ]           = useState('');
  const [activeDept,  setActiveDept]  = useState(currentUser.dept || DEPARTMENTS[0]);

  const templates = TEMPLATES[activeDept] || [];
  const filtered  = q ? templates.filter(t => t.title.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase())) : templates;

  return (
    <div>
      {/* Dept tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {DEPARTMENTS.map(d => (
          <button key={d} onClick={() => setActiveDept(d)}
            style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${activeDept === d ? DEPT_COLORS[d] : C.border}`, background: activeDept === d ? `${DEPT_COLORS[d]}18` : 'none', color: activeDept === d ? DEPT_COLORS[d] : C.muted, fontSize: 12, fontWeight: activeDept === d ? 700 : 400, cursor: 'pointer' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search templates…"
          style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px 8px 30px', color: C.text, fontSize: 13, outline: 'none' }}/>
      </div>

      {/* Template cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {filtered.map((t, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', borderTop: `3px solid ${DEPT_COLORS[activeDept] || C.accent}`, transition: 'transform .2s, box-shadow .2s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${DEPT_COLORS[activeDept] || C.accent}20`; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${PRIORITY_COLORS[t.priority]}18`, color: PRIORITY_COLORS[t.priority], border: `1px solid ${PRIORITY_COLORS[t.priority]}35`, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30` }}>{t.category}</span>
              </div>
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>Weight: {t.weight}%</span>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{t.title}</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: C.muted }}>Target: <strong style={{ color: C.text }}>{t.targetValue} {t.metricType === 'Percentage (%)' ? '%' : ''}</strong></span>
              <span style={{ fontSize: 11, color: C.purple }}>KRA: {t.kraLink}</span>
            </div>

            <button onClick={() => onUseTemplate({ ...t, description: '', startDate: new Date().toISOString().split('T')[0], targetDate: '', currentValue: '0', kpiLink: '', tags: '' })}
              style={{ width: '100%', padding: '9px', borderRadius: 9, border: `1px solid ${DEPT_COLORS[activeDept] || C.accent}50`, background: `${DEPT_COLORS[activeDept] || C.accent}10`, color: DEPT_COLORS[activeDept] || C.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = `${DEPT_COLORS[activeDept] || C.accent}22`}
              onMouseOut={e => e.currentTarget.style.background = `${DEPT_COLORS[activeDept] || C.accent}10`}>
              Use This Template <ChevronRight size={13}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
