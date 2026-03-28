/**
 * parts/01_UserManagement/RoleManagement.jsx
 * Super Admin-only screen to manage system roles:
 *  — Inline role switcher per employee
 *  — Role change audit log (session-level)
 *  — Permission matrix viewer
 *  — Bulk role operations
 */

import { useState } from 'react';
import { Shield, Info, CheckCircle, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES, can, permissionsFor } from '@constants/roles';
import { Avatar, Badge } from '@components/common';
import toast from 'react-hot-toast';

// Readable names for permission keys
const PERM_LABELS = {
  viewAllEmployees:     'View All Employees',
  addEmployee:          'Add Employee',
  editEmployee:         'Edit Employee',
  deleteEmployee:       'Delete Employee',
  changeRoles:          'Change Roles',
  importEmployees:      'Import Employees',
  exportEmployees:      'Export Employees',
  manageDepartments:    'Manage Departments',
  setOwnGoals:          'Set Own Goals',
  approveGoals:         'Approve Goals',
  manageKPITemplates:   'Manage KPI Templates',
  assignTasks:          'Assign Tasks',
  conductAppraisal:     'Conduct Appraisal',
  finalizeAppraisal:    'Finalize Appraisal',
  approveL1:            'Approve L1',
  approveL2:            'Approve L2',
  approveL3:            'Approve L3',
  viewOrgDashboard:     'View Org Dashboard',
  exportReports:        'Export Reports',
  sendNotifications:    'Send Notifications',
};

// ─────────────────────────────────────────────────────────────────
export default function RoleManagement({ users, onUpdate }) {
  const [q,          setQ]          = useState('');
  const [changeLog,  setChangeLog]  = useState([]);
  const [showMatrix, setShowMatrix] = useState(false);

  const filtered = users.filter(u => {
    const s = q.toLowerCase();
    return !q || u.name.toLowerCase().includes(s) || u.dept.toLowerCase().includes(s) || u.id.toLowerCase().includes(s);
  });

  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    const log = { id: Date.now(), user: user.name, from: ROLES[user.role], to: ROLES[newRole], time: new Date().toLocaleTimeString() };
    setChangeLog(p => [log, ...p.slice(0, 9)]);
    onUpdate({ ...user, role: newRole });
    toast.success(`${user.name.split(' ')[0]}'s role changed to ${ROLES[newRole]}`);
  };

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800 }}>Role Management</h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Assign system access roles — Super Admin only</p>
        </div>
        <button onClick={() => setShowMatrix(s => !s)}
          style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: showMatrix ? `${C.purple}15` : 'none', color: showMatrix ? C.purple : C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Shield size={14}/> {showMatrix ? 'Hide' : 'View'} Permission Matrix
          {showMatrix ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
        </button>
      </div>

      {/* ── Permission matrix ──────────────────────────────────── */}
      {showMatrix && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700 }}>System Permission Matrix</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Permission</th>
                  {Object.entries(ROLES).map(([role, label]) => (
                    <th key={role} style={{ padding: '10px 16px', textAlign: 'center', color: ROLE_COLORS[role], fontWeight: 700, fontSize: 11 }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERM_LABELS).map(([key, label], i) => (
                  <tr key={key} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}>
                    <td style={{ padding: '9px 16px', color: C.text, fontSize: 12 }}>{label}</td>
                    {Object.keys(ROLES).map(role => (
                      <td key={role} style={{ padding: '9px 16px', textAlign: 'center' }}>
                        {can(role, key)
                          ? <CheckCircle size={14} color={C.green} style={{ display: 'inline' }}/>
                          : <X size={14} color={C.faint} style={{ display: 'inline' }}/>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>

        {/* ── Employee role table ───────────────────────────────── */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search employees…"
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 12px 9px 32px', color: C.text, fontSize: 13, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}/>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                  {['Employee', 'Department', 'Designation', 'Current Role', 'Change Role'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface, transition: 'background .15s' }}
                    onMouseOver={e => e.currentTarget.style.background = `${C.accent}07`}
                    onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? C.card : C.surface}>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} size={32} bg={ROLE_COLORS[u.role]}/>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.name}</p>
                          <p style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{u.dept}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.text  }}>{u.designation}</td>

                    <td style={{ padding: '12px 16px' }}>
                      <Badge label={ROLES[u.role]} color={ROLE_COLORS[u.role]}/>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <select value={u.role}
                        onChange={e => handleRoleChange(u, e.target.value)}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: ROLE_COLORS[u.role], fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'border .2s' }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border}>
                        {Object.entries(ROLES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Change log ─────────────────────────────────────────── */}
        <div style={{ width: 260, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={14} color={C.accent}/>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 700 }}>Session Change Log</h3>
          </div>
          {changeLog.length === 0 ? (
            <p style={{ padding: '20px 16px', fontSize: 12, color: C.muted, textAlign: 'center' }}>No changes yet</p>
          ) : changeLog.map(log => (
            <div key={log.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{log.user}</p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                <span style={{ color: C.red }}>{log.from}</span>
                <span style={{ color: C.faint }}> → </span>
                <span style={{ color: C.green }}>{log.to}</span>
              </p>
              <p style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{log.time}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
