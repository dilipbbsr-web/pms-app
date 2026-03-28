/**
 * parts/06_AssignmentPerf/AppraisalHistory.jsx
 * Manager view of all team appraisals with search + edit capability.
 */
import { useState } from 'react';
import { Search, Edit2 } from 'lucide-react';
import { C, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { Avatar, Badge, ActionBtn, EmptyState } from '@components/common';

const RATING_LABELS = { 5:'Outstanding', 4:'Exceeds', 3:'Meets', 2:'Below', 1:'Poor' };

export default function AppraisalHistory({ appraisals, users, currentUser, onEdit }) {
  const [q, setQ] = useState('');
  const getUser = id => users.find(u => u.id === id);

  const filtered = appraisals.filter(a => {
    const emp = getUser(a.employeeId);
    const sq  = q.toLowerCase();
    return !q || emp?.name.toLowerCase().includes(sq) || a.period?.toLowerCase().includes(sq) || a.id?.toLowerCase().includes(sq);
  }).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));

  if (appraisals.length === 0) return (
    <EmptyState icon="📋" title="No appraisals conducted yet" description="Click 'New Appraisal' to start evaluating your team members."/>
  );

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 380 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search employee or period…"
          style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px 8px 30px', color: C.text, fontSize: 13, outline: 'none' }}/>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
              {['Appraisal ID','Employee','Period','Overall Score','Rating','Date',onEdit?'Edit':''].filter(Boolean).map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No appraisals match search</td></tr>
            )}
            {filtered.map((a, i) => {
              const emp     = getUser(a.employeeId);
              const overall = a.overallScore || 0;
              const oColor  = RATING_COLORS[Math.round(overall)] || C.muted;
              return (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}`, background: i%2===0?C.card:C.surface }}
                  onMouseOver={e=>e.currentTarget.style.background=`${C.accent}07`}
                  onMouseOut={e=>e.currentTarget.style.background=i%2===0?C.card:C.surface}>
                  <td style={{ padding: '11px 16px' }}>
                    <code style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, padding: '2px 7px', borderRadius: 4 }}>{a.id}</code>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    {emp ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={emp.name} size={28} bg={ROLE_COLORS[emp.role]}/>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{emp.name}</p>
                          <p style={{ fontSize: 10, color: C.muted }}>{emp.designation}</p>
                        </div>
                      </div>
                    ) : <span style={{ color: C.muted }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{a.period}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 5, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(overall/5)*100}%`, background: oColor, borderRadius: 99 }}/>
                      </div>
                      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 800, color: oColor }}>{overall.toFixed(2)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <Badge label={RATING_LABELS[Math.round(overall)]||'—'} color={oColor}/>
                  </td>
                  <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>
                    {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  {onEdit && (
                    <td style={{ padding: '11px 16px' }}>
                      <ActionBtn icon={<Edit2 size={13}/>} color={C.accent} title="Edit" onClick={()=>onEdit(a)}/>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
