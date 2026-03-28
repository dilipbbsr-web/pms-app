/**
 * parts/07_ApprovalWorkflow/ApprovalHistory.jsx
 * Full log of all approval actions with filter by type/action/level.
 */
import { useState } from 'react';
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const TYPE_COLORS   = { Goal:'#3B82F6', Appraisal:'#10B981', KPI:'#F97316', Task:'#8B5CF6' };
const LEVEL_COLORS  = { L1:'#14B8A6', L2:'#8B5CF6', L3:'#F59E0B' };
const ACTION_COLORS = { approved: '#10B981', rejected: '#EF4444' };

export default function ApprovalHistory({ log, users, currentUser }) {
  const [q,       setQ]       = useState('');
  const [typeF,   setTypeF]   = useState('');
  const [actionF, setActionF] = useState('');
  const [levelF,  setLevelF]  = useState('');

  const getUser = id => users.find(u => u.id === id);
  const sorted = [...log].sort((a,b) => new Date(b.reviewedAt)-new Date(a.reviewedAt));

  const filtered = sorted.filter(item => {
    const emp = getUser(item.employeeId);
    const sq  = q.toLowerCase();
    return (!q || emp?.name.toLowerCase().includes(sq) || item.itemId?.toLowerCase().includes(sq))
      && (!typeF   || item.itemType === typeF)
      && (!actionF || item.action   === actionF)
      && (!levelF  || item.level    === levelF);
  });

  if (log.length === 0) return (
    <EmptyState icon="📋" title="No approval history yet" description="Approval actions will appear here once you start reviewing submissions."/>
  );

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search employee or item ID…"
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px 8px 28px', color: C.text, fontSize: 12, outline: 'none' }}/>
        </div>
        {[
          { val:typeF,   set:setTypeF,   opts:['Goal','Appraisal','KPI','Task'],     placeholder:'Type'   },
          { val:actionF, set:setActionF, opts:['approved','rejected'],               placeholder:'Action' },
          { val:levelF,  set:setLevelF,  opts:['L1','L2','L3'],                      placeholder:'Level'  },
        ].map((f,i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: f.val?C.text:C.muted, fontSize: 12, outline: 'none', minWidth: 110 }}>
            <option value="">{f.placeholder}</option>
            {f.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </select>
        ))}
        <span style={{ fontSize: 12, color: C.muted, marginLeft: 'auto' }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
              {['Item ID','Type','Employee','Reviewed By','Level','Action','Comment','Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: C.muted }}>No records match filters</td></tr>
            )}
            {filtered.map((item, i) => {
              const emp      = getUser(item.employeeId);
              const reviewer = getUser(item.reviewedBy);
              const aColor   = ACTION_COLORS[item.action] || C.muted;
              return (
                <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}`, background: i%2===0?C.card:C.surface }}
                  onMouseOver={e=>e.currentTarget.style.background=`${C.accent}07`}
                  onMouseOut={e=>e.currentTarget.style.background=i%2===0?C.card:C.surface}>
                  <td style={{ padding: '10px 14px' }}>
                    <code style={{ fontSize: 10, color: C.accent, background: `${C.accent}15`, padding: '1px 6px', borderRadius: 4 }}>{item.itemId}</code>
                  </td>
                  <td style={{ padding: '10px 14px' }}><Badge label={item.itemType} color={TYPE_COLORS[item.itemType]||C.muted}/></td>
                  <td style={{ padding: '10px 14px' }}>
                    {emp ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={emp.name} size={22} bg={ROLE_COLORS[emp.role]}/>
                        <span style={{ color: C.text, fontWeight: 500 }}>{emp.name}</span>
                      </div>
                    ) : <span style={{ color: C.muted }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', color: C.muted }}>{reviewer?.name||'—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[item.level], background: `${LEVEL_COLORS[item.level]}18`, padding: '2px 8px', borderRadius: 99, border: `1px solid ${LEVEL_COLORS[item.level]}35` }}>{item.level}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {item.action==='approved' ? <CheckCircle size={12} color={C.green}/> : <XCircle size={12} color={C.red}/>}
                      <span style={{ fontSize: 11, fontWeight: 600, color: aColor, textTransform: 'capitalize' }}>{item.action}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: C.muted, maxWidth: 180 }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.comment || '—'}</p>
                  </td>
                  <td style={{ padding: '10px 14px', color: C.muted, whiteSpace: 'nowrap' }}>
                    {new Date(item.reviewedAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
