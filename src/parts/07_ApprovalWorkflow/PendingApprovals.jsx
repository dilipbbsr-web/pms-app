/**
 * parts/07_ApprovalWorkflow/PendingApprovals.jsx
 * Unified pending approval queue with 3-level chain visualization.
 */
import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, MessageSquare, GitBranch, ArrowRight } from 'lucide-react';
import { C, ROLE_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const LEVEL_COLORS = { L1: '#14B8A6', L2: '#8B5CF6', L3: '#F59E0B' };
const TYPE_COLORS  = { Goal: '#3B82F6', Appraisal: '#10B981', KPI: '#F97316', Task: '#8B5CF6' };

export default function PendingApprovals({ queue, users, currentUser, myLevel, onApprove, onReject }) {
  const [expanded, setExpanded] = useState({});
  const [comments, setComments] = useState({});
  const [done,     setDone]     = useState({});

  const toggle  = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const getUser = id => users.find(u => u.id === id);

  if (queue.length === 0) return (
    <div>
      {/* 3-level chain diagram */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <GitBranch size={15} color={C.purple}/>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700 }}>3-Level Approval Chain</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {['L1','L2','L3'].map((lvl, i) => {
            const labels = { L1:'Team Lead / Peer Manager', L2:'HOD / Senior Manager', L3:'HR / Super Admin' };
            const isCurrent = myLevel === lvl;
            return (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: '10px 18px', borderRadius: 12, border: `1px solid ${isCurrent?LEVEL_COLORS[lvl]:C.border}`, background: isCurrent?`${LEVEL_COLORS[lvl]}15`:C.surface, minWidth: 160 }}>
                  <p style={{ fontSize: 11, color: isCurrent?LEVEL_COLORS[lvl]:C.muted, fontWeight: 700, marginBottom: 2 }}>{lvl} {isCurrent && '← You'}</p>
                  <p style={{ fontSize: 12, color: isCurrent?C.text:C.muted }}>{labels[lvl]}</p>
                </div>
                {i < 2 && <ArrowRight size={16} color={C.faint}/>}
              </div>
            );
          })}
        </div>
      </div>
      <EmptyState icon="✅" title="No pending approvals" description="All submissions have been reviewed. Check the History tab to see past actions."/>
    </div>
  );

  return (
    <div>
      {/* Chain diagram compact */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <GitBranch size={13} color={C.purple}/>
        <span style={{ fontSize: 12, color: C.muted }}>Approval chain:</span>
        {['L1','L2','L3'].map((lvl, i) => {
          const isCurrent = myLevel === lvl;
          return (
            <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <ArrowRight size={13} color={C.faint}/>}
              <span style={{ fontSize: 12, fontWeight: isCurrent?700:400, color: isCurrent?LEVEL_COLORS[lvl]:C.muted, padding: isCurrent?'2px 8px':'0', borderRadius: isCurrent?99:0, background: isCurrent?`${LEVEL_COLORS[lvl]}20`:'none', border: isCurrent?`1px solid ${LEVEL_COLORS[lvl]}35`:'none' }}>
                {lvl}{isCurrent?' (you)':''}
              </span>
            </div>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>{queue.length} pending</span>
      </div>

      {/* Queue items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {queue.map(item => {
          const emp      = getUser(item.employeeId);
          const open     = expanded[item.id];
          const approved = done[item.id] === 'approved';
          const rejected = done[item.id] === 'rejected';
          const typeColor= TYPE_COLORS[item.itemType] || C.accent;

          return (
            <div key={item.id} style={{
              background: C.card, borderRadius: 14,
              border: `1px solid ${approved?C.green:rejected?C.red:C.border}`,
              overflow: 'hidden',
              borderLeft: `4px solid ${approved?C.green:rejected?C.red:typeColor}`,
            }}>
              {/* Main row */}
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggle(item.id)}>
                {/* Employee */}
                {emp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                    <Avatar name={emp.name} size={34} bg={ROLE_COLORS[emp.role]}/>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{emp.name}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{emp.designation}</p>
                    </div>
                  </div>
                )}

                {/* Item info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                    <Badge label={item.itemType} color={typeColor}/>
                    <code style={{ fontSize: 11, color: C.muted, background: C.faint, padding: '2px 7px', borderRadius: 4 }}>{item.displayId}</code>
                    <Badge label={`Level: ${item.currentLevel}`} color={LEVEL_COLORS[item.currentLevel]}/>
                    {item.priority && <Badge label={item.priority} color={PRIORITY_COLORS[item.priority]}/>}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.title}</p>
                  {item.kraLink && <p style={{ fontSize: 11, color: C.purple, marginTop: 2 }}>KRA: {item.kraLink}</p>}
                </div>

                {/* Status / expand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {approved && <Badge label="Approved" color={C.green}/>}
                  {rejected && <Badge label="Rejected" color={C.red}/>}
                  {open ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                </div>
              </div>

              {/* Expanded */}
              {open && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${C.border}` }}>
                  {/* Item details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, paddingTop: 14, marginBottom: 14 }}>
                    {[
                      { label:'Submitted By', val:emp?.name||'—'           },
                      { label:'Department',   val:emp?.dept||'—'            },
                      { label:'Item Type',    val:item.itemType             },
                      { label:'Period/Target', val:item.targetDate||item.period||'—' },
                      ...(item.weight ? [{ label:'Weight', val:`${item.weight}%` }] : []),
                      ...(item.category ? [{ label:'Category', val:item.category }] : []),
                    ].map(({ label, val }) => (
                      <div key={label} style={{ background: C.surface, borderRadius: 8, padding: '8px 12px' }}>
                        <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {item.description && (
                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, padding: '10px 12px', background: C.surface, borderRadius: 8, marginBottom: 14 }}>{item.description}</p>
                  )}

                  {/* Approve / Reject panel */}
                  {!approved && !rejected && (
                    <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}25`, borderRadius: 12, padding: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 10 }}>
                        {myLevel} Review — {item.itemType}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <MessageSquare size={13} color={C.muted}/>
                        <span style={{ fontSize: 11, color: C.muted }}>Comment (required for rejection)</span>
                      </div>
                      <textarea
                        value={comments[item.id] || ''}
                        onChange={e => setComments(p => ({ ...p, [item.id]: e.target.value }))}
                        placeholder="Add a review comment…"
                        rows={2}
                        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, resize: 'none', outline: 'none', marginBottom: 10, fontFamily: '"DM Sans",sans-serif' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { onApprove(item, comments[item.id]||''); setDone(p=>({...p,[item.id]:'approved'})); }}
                          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: C.green, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <CheckCircle size={14}/> Approve
                        </button>
                        <button
                          onClick={() => {
                            if (!comments[item.id]?.trim()) { toast.error('Add a rejection reason first'); return; }
                            onReject(item, comments[item.id]);
                            setDone(p=>({...p,[item.id]:'rejected'}));
                          }}
                          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <XCircle size={14}/> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {approved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: `${C.green}10`, borderRadius: 10, border: `1px solid ${C.green}30` }}>
                      <CheckCircle size={14} color={C.green}/>
                      <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Approved by you at {myLevel}</p>
                    </div>
                  )}
                  {rejected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: `${C.red}10`, borderRadius: 10, border: `1px solid ${C.red}30` }}>
                      <XCircle size={14} color={C.red}/>
                      <p style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>Rejected by you at {myLevel}</p>
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
