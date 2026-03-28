/**
 * parts/03_GoalSetting/TeamGoals.jsx
 * Manager / Admin view of team goals.
 * approvalMode=true → shows only pending, with Approve/Reject actions + comment box
 */

import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { C, ROLE_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const STATUS_META = {
  draft:      { label: 'Draft',       color: '#64748B' },
  submitted:  { label: 'Submitted',   color: '#3B82F6' },
  approved:   { label: 'L1 Approved', color: '#14B8A6' },
  l2approved: { label: 'L2 Approved', color: '#8B5CF6' },
  completed:  { label: 'Completed',   color: '#10B981' },
  rejected:   { label: 'Rejected',    color: '#EF4444' },
};

export default function TeamGoals({ goals, users, currentUser, onStatusChange, approvalMode = false }) {
  const [expanded,  setExpanded]  = useState({});
  const [comments,  setComments]  = useState({});
  const [filterEmp, setFilterEmp] = useState('');

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const getUser = id => users.find(u => u.id === id);

  const filtered = filterEmp ? goals.filter(g => g.employeeId === filterEmp) : goals;

  // Unique employees in this goal list (for filter dropdown)
  const empIds = [...new Set(goals.map(g => g.employeeId))];

  if (goals.length === 0) return (
    <EmptyState icon="👥" title={approvalMode ? 'No pending approvals' : 'No team goals found'}
      description={approvalMode ? 'All goal submissions have been reviewed.' : 'Your team has not set any goals yet.'}/>
  );

  return (
    <div>
      {/* Employee filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: filterEmp ? C.text : C.muted, fontSize: 13, outline: 'none', minWidth: 180 }}>
          <option value="">All Employees ({goals.length})</option>
          {empIds.map(id => {
            const u = getUser(id);
            return u ? <option key={id} value={id}>{u.name}</option> : null;
          })}
        </select>
        <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} goal{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(goal => {
          const emp  = getUser(goal.employeeId);
          const meta = STATUS_META[goal.status] || STATUS_META.draft;
          const open = expanded[goal.id];
          const pct  = goal.targetValue
            ? Math.min(100, Math.round((parseFloat(goal.currentValue || 0) / parseFloat(goal.targetValue)) * 100))
            : 0;

          return (
            <div key={goal.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeft: `4px solid ${meta.color}` }}>

              {/* Header row */}
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggle(goal.id)}>
                {/* Employee info */}
                {emp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
                    <Avatar name={emp.name} size={34} bg={ROLE_COLORS[emp.role]}/>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{emp.name}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{emp.designation}</p>
                    </div>
                  </div>
                )}

                {/* Goal info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Badge label={meta.label} color={meta.color}/>
                    <Badge label={goal.priority} color={PRIORITY_COLORS[goal.priority]}/>
                    <span style={{ fontSize: 11, color: C.muted }}>{goal.category}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{goal.title}</p>
                </div>

                {/* Progress */}
                <div style={{ minWidth: 120, textAlign: 'right' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? C.green : C.accent, marginBottom: 4 }}>{pct}%</p>
                  <div style={{ height: 5, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? C.green : C.accent, borderRadius: 99 }}/>
                  </div>
                </div>

                {open ? <ChevronUp size={15} color={C.muted}/> : <ChevronDown size={15} color={C.muted}/>}
              </div>

              {/* Expanded */}
              {open && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${C.border}` }}>
                  {/* Goal details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, paddingTop: 14, marginBottom: 12 }}>
                    {[
                      { label: 'Goal ID',  val: goal.id },
                      { label: 'Weight',   val: `${goal.weight}%` },
                      { label: 'Target',   val: goal.targetDate },
                      { label: 'KRA Link', val: goal.kraLink || '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ background: C.surface, borderRadius: 8, padding: '8px 12px' }}>
                        <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {goal.description && (
                    <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.6, padding: '10px 12px', background: C.surface, borderRadius: 8 }}>{goal.description}</p>
                  )}

                  {/* Approval actions */}
                  {approvalMode && goal.status === 'submitted' && (
                    <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}25`, borderRadius: 12, padding: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 10 }}>Review this goal submission</p>
                      <textarea
                        value={comments[goal.id] || ''}
                        onChange={e => setComments(p => ({ ...p, [goal.id]: e.target.value }))}
                        placeholder="Add a comment (optional — required for rejection)…"
                        rows={2}
                        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, resize: 'none', outline: 'none', marginBottom: 10, fontFamily: '"DM Sans",sans-serif' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onStatusChange(goal.id, 'approved', comments[goal.id] || '')}
                          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: C.green, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <CheckCircle size={14}/> Approve
                        </button>
                        <button onClick={() => {
                          if (!comments[goal.id]?.trim()) { alert('Please add a rejection reason.'); return; }
                          onStatusChange(goal.id, 'rejected', comments[goal.id]);
                        }}
                          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <XCircle size={14}/> Reject
                        </button>
                      </div>
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
