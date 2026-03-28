/**
 * parts/03_GoalSetting/MyGoals.jsx
 * Employee's own goals:
 *  — Kanban-style status columns OR list view
 *  — Progress bars per goal
 *  — Edit (draft only) / Delete / Submit actions
 *  — Goal detail expand
 */

import { useState } from 'react';
import { Edit2, Trash2, Send, Eye, ChevronDown, ChevronUp, Target, Flag, Calendar, Percent } from 'lucide-react';
import { C, PRIORITY_COLORS, STATUS_COLORS } from '@constants/theme';
import { ActionBtn, Badge, EmptyState } from '@components/common';

const STATUS_META = {
  draft:     { label: 'Draft',        color: '#64748B' },
  submitted: { label: 'Submitted',    color: '#3B82F6' },
  approved:  { label: 'L1 Approved',  color: '#14B8A6' },
  l2approved:{ label: 'L2 Approved',  color: '#8B5CF6' },
  completed: { label: 'Completed',    color: '#10B981' },
  rejected:  { label: 'Rejected',     color: '#EF4444' },
};

export default function MyGoals({ goals, currentUser, users, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState({});
  const [filter,   setFilter]   = useState('all');

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const statuses = ['all', ...Object.keys(STATUS_META)];
  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter);

  // Summary counts
  const counts = Object.keys(STATUS_META).reduce((acc, s) => {
    acc[s] = goals.filter(g => g.status === s).length; return acc;
  }, {});

  if (goals.length === 0) return (
    <EmptyState icon="🎯" title="No goals set yet"
      description="Create your first goal and submit it for your manager's approval."
      action={null}/>
  );

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_META).map(([s, meta]) => (
          counts[s] > 0 && (
            <div key={s} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }}/>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{meta.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: meta.color, fontFamily: 'Outfit,sans-serif' }}>{counts[s]}</span>
            </div>
          )
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${filter === s ? C.accent : C.border}`, background: filter === s ? `${C.accent}20` : 'none', color: filter === s ? C.accent : C.muted, fontSize: 12, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
            {s === 'all' ? `All (${goals.length})` : STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Goal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: 32 }}>No goals in this status</p>}
        {filtered.map(goal => {
          const meta   = STATUS_META[goal.status] || STATUS_META.draft;
          const open   = expanded[goal.id];
          const pct    = goal.targetValue
            ? Math.min(100, Math.round((parseFloat(goal.currentValue || 0) / parseFloat(goal.targetValue)) * 100))
            : 0;
          const isDraft = goal.status === 'draft';

          return (
            <div key={goal.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeft: `4px solid ${meta.color}` }}>

              {/* Main row */}
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => toggle(goal.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted, background: C.faint, padding: '2px 7px', borderRadius: 4 }}>{goal.id}</span>
                    <Badge label={meta.label} color={meta.color}/>
                    <Badge label={goal.priority} color={PRIORITY_COLORS[goal.priority]}/>
                    <Badge label={goal.category} color={C.blue}/>
                    {goal.kraLink && <Badge label={`KRA: ${goal.kraLink}`} color={C.purple}/>}
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{goal.title}</h4>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>Progress · {goal.metricType}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 100 ? C.green : C.accent }}>{pct}%  ({goal.currentValue || 0} / {goal.targetValue} {goal.metricType === 'Percentage (%)' ? '%' : ''})</span>
                    </div>
                    <div style={{ height: 6, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? C.green : `linear-gradient(90deg,${C.accent},${C.blue})`, borderRadius: 99, transition: 'width .6s ease' }}/>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{goal.weight}%</span>
                  {isDraft && <ActionBtn icon={<Edit2 size={13}/>}  color={C.accent} title="Edit"   onClick={e => { e.stopPropagation(); onEdit(goal); }}/>}
                  {isDraft && <ActionBtn icon={<Send size={13}/>}   color={C.blue}   title="Submit" onClick={e => { e.stopPropagation(); onStatusChange(goal.id, 'submitted'); }}/>}
                  {isDraft && <ActionBtn icon={<Trash2 size={13}/>} color={C.red}    title="Delete" onClick={e => { e.stopPropagation(); onDelete(goal.id); }}/>}
                  {open ? <ChevronUp size={15} color={C.muted}/> : <ChevronDown size={15} color={C.muted}/>}
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, paddingTop: 14 }}>
                    {[
                      { icon: <Calendar size={13}/>, label: 'Start',  val: goal.startDate  },
                      { icon: <Calendar size={13}/>, label: 'Target', val: goal.targetDate },
                      { icon: <Percent size={13}/>,  label: 'Weight', val: `${goal.weight}%` },
                      { icon: <Target size={13}/>,   label: 'KPI',    val: goal.kpiLink || '—' },
                      { icon: <Flag size={13}/>,     label: 'KRA',    val: goal.kraLink || '—' },
                      { icon: <Flag size={13}/>,     label: 'Tags',   val: goal.tags || '—'    },
                    ].map(({ icon, label, val }) => (
                      <div key={label} style={{ background: C.surface, borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, marginBottom: 4 }}>
                          {icon}<span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                  {goal.description && (
                    <div style={{ marginTop: 12, padding: '12px 14px', background: C.surface, borderRadius: 10 }}>
                      <p style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description</p>
                      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{goal.description}</p>
                    </div>
                  )}
                  {/* Approval comments */}
                  {goal.approvedComment && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: `${C.green}10`, borderRadius: 10, border: `1px solid ${C.green}30` }}>
                      <p style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 3 }}>Approval Comment</p>
                      <p style={{ fontSize: 13, color: C.text }}>{goal.approvedComment}</p>
                    </div>
                  )}
                  {goal.rejectedComment && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: `${C.red}10`, borderRadius: 10, border: `1px solid ${C.red}30` }}>
                      <p style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 3 }}>Rejection Reason</p>
                      <p style={{ fontSize: 13, color: C.text }}>{goal.rejectedComment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
