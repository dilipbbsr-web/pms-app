/**
 * parts/02_DepartmentHierarchy/EmployeesByDept.jsx
 * Filterable employee list scoped to a specific department.
 * Shows designation-grouped view + flat table toggle.
 */

import { useState } from 'react';
import { Search, LayoutGrid, List, Users } from 'lucide-react';
import { C, ROLE_COLORS, STATUS_COLORS } from '@constants/theme';
import { DEPT_HIERARCHY } from '@constants/departments';
import { ROLES } from '@constants/roles';
import { Avatar, Badge } from '@components/common';

export default function EmployeesByDept({ dept, users, onBack }) {
  const [view,   setView]   = useState('grouped'); // 'grouped' | 'table'
  const [q,      setQ]      = useState('');
  const [status, setStatus] = useState('');

  const deptUsers = users.filter(u => {
    const matchDept = u.dept === dept;
    const sq = q.toLowerCase();
    const matchQ    = !q || u.name.toLowerCase().includes(sq) || u.designation.toLowerCase().includes(sq);
    const matchS    = !status || u.status === status;
    return matchDept && matchQ && matchS;
  });

  const hierarchy = DEPT_HIERARCHY[dept] || [];
  const designationOrder = hierarchy.map(d => d.title);

  // Group by designation in hierarchy order
  const grouped = designationOrder
    .map(title => ({ title, members: deptUsers.filter(u => u.designation === title) }))
    .filter(g => g.members.length > 0);

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 17, fontWeight: 700 }}>{dept} — Employees</h3>
          <p style={{ fontSize: 12, color: C.muted }}>{deptUsers.length} records</p>
        </div>
        {/* View toggle */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 3, gap: 2 }}>
          {[{ id: 'grouped', icon: <LayoutGrid size={15}/> }, { id: 'table', icon: <List size={15}/> }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: view === v.id ? C.accent : 'none', color: view === v.id ? '#fff' : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or designation…"
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px 8px 30px', color: C.text, fontSize: 13, outline: 'none' }} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: status ? C.text : C.muted, fontSize: 13, outline: 'none' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Grouped view */}
      {view === 'grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {grouped.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>
              <Users size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 8px' }} />
              No employees found
            </div>
          )}
          {grouped.map(({ title, members }) => (
            <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {/* Designation header */}
              <div style={{ padding: '10px 18px', background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</span>
                <span style={{ fontSize: 11, color: C.muted, background: C.faint, padding: '2px 10px', borderRadius: 99 }}>{members.length}</span>
              </div>
              {/* Employees */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 1 }}>
                {members.map(u => (
                  <div key={u.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                    <Avatar name={u.name} size={34} bg={ROLE_COLORS[u.role]} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{u.id}</p>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'active' ? C.green : C.red, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                {['ID', 'Name', 'Designation', 'Role', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptUsers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No employees found</td></tr>
              ) : deptUsers.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}
                  onMouseOver={e => e.currentTarget.style.background = `${C.accent}07`}
                  onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? C.card : C.surface}>
                  <td style={{ padding: '11px 16px' }}>
                    <code style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, padding: '2px 7px', borderRadius: 5 }}>{u.id}</code>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={u.name} size={28} bg={ROLE_COLORS[u.role]} />
                      <div>
                        <p style={{ fontWeight: 600, color: C.text }}>{u.name}</p>
                        <p style={{ fontSize: 11, color: C.muted }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', color: C.text, fontSize: 12 }}>{u.designation}</td>
                  <td style={{ padding: '11px 16px' }}><Badge label={ROLES[u.role]} color={ROLE_COLORS[u.role]} /></td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.status === 'active' ? C.green : C.red }} />
                      <span style={{ fontSize: 12, color: u.status === 'active' ? C.green : C.red }}>{u.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
