/**
 * parts/01_UserManagement/EmployeeList.jsx
 * Employee table with:
 *  — Search by name / email / ID
 *  — Filter by department, role, status
 *  — Paginated rows (10 per page)
 *  — View profile modal
 *  — Edit / Delete actions (role-gated)
 *  — Delete with Super Admin verification for Admin users
 */

import { useState } from 'react';
import {
  Search, Eye, Edit2, Trash2, RotateCcw, Filter,
  Mail, Phone, Building2, Calendar, Hash, Key,
  Eye as EyeIcon, EyeOff, ChevronDown, X,
} from 'lucide-react';
import { C, ROLE_COLORS, STATUS_COLORS, DEPT_COLORS } from '@constants/theme';
import { ROLES, can } from '@constants/roles';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar, Badge, ActionBtn, Modal, Pagination } from '@components/common';

const PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────────
export default function EmployeeList({ users, currentUser, onEdit, onDelete }) {
  const [q,       setQ]       = useState('');
  const [deptF,   setDeptF]   = useState('');
  const [roleF,   setRoleF]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [page,    setPage]    = useState(1);
  const [detail,  setDetail]  = useState(null);  // user to view
  const [delUser, setDelUser] = useState(null);  // user to delete

  const isAdmin = can(currentUser.role, 'viewAllEmployees');
  const isSuper = currentUser.role === 'super_admin';

  // Filter logic
  const filtered = users.filter(u => {
    if (!isAdmin && u.id !== currentUser.id) return false;
    const sq = q.toLowerCase();
    const matchQ = !q || [u.name, u.email, u.id, u.designation, u.dept]
      .some(v => v?.toLowerCase().includes(sq));
    return matchQ
      && (!deptF   || u.dept   === deptF)
      && (!roleF   || u.role   === roleF)
      && (!statusF || u.status === statusF);
  });

  const pages    = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => { setQ(''); setDeptF(''); setRoleF(''); setStatusF(''); setPage(1); };
  const hasFilters   = q || deptF || roleF || statusF;

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* ── Filters bar ──────────────────────────────────────── */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '2 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
            <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
              placeholder="Search name, email, ID, designation…"
              style={{
                width: '100%', background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '9px 12px 9px 32px', color: C.text, fontSize: 13, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border} />
          </div>

          {/* Department filter */}
          <FilterSelect value={deptF} onChange={v => { setDeptF(v); setPage(1); }} placeholder="Department" options={DEPARTMENTS} />

          {/* Role filter */}
          <FilterSelect value={roleF} onChange={v => { setRoleF(v); setPage(1); }} placeholder="Role"
            options={Object.entries(ROLES).map(([k, v]) => ({ value: k, label: v }))} />

          {/* Status filter */}
          <FilterSelect value={statusF} onChange={v => { setStatusF(v); setPage(1); }} placeholder="Status"
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <RotateCcw size={13} /> Clear
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                {['Employee ID', 'Name & Email', 'Department', 'Designation', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center', color: C.muted }}>
                    <p style={{ fontSize: 32, opacity: 0.2, marginBottom: 8 }}>🔍</p>
                    <p style={{ fontSize: 14 }}>No employees found</p>
                    {hasFilters && <p style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</p>}
                  </td>
                </tr>
              ) : pageData.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface, transition: 'background .15s', cursor: 'default' }}
                  onMouseOver={e => e.currentTarget.style.background = `${C.accent}07`}
                  onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? C.card : C.surface}>

                  {/* ID */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.accent, background: `${C.accent}15`, padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>
                      {u.id}
                    </span>
                  </td>

                  {/* Name + email */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={34} bg={ROLE_COLORS[u.role]} />
                      <div>
                        <p style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{u.name}</p>
                        <p style={{ fontSize: 11, color: C.muted }}>{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Dept */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 12, color: DEPT_COLORS[u.dept] || C.muted, fontWeight: 500 }}>{u.dept}</span>
                  </td>

                  {/* Designation */}
                  <td style={{ padding: '13px 16px', color: C.text, fontSize: 12, whiteSpace: 'nowrap' }}>{u.designation}</td>

                  {/* Role */}
                  <td style={{ padding: '13px 16px' }}>
                    <Badge label={ROLES[u.role]} color={ROLE_COLORS[u.role]} />
                  </td>

                  {/* Status */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'active' ? C.green : C.red, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: u.status === 'active' ? C.green : C.red, fontWeight: 500 }}>
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn icon={<Eye size={14}/>}   color={C.blue}   title="View Profile" onClick={() => setDetail(u)} />
                      {isAdmin && <ActionBtn icon={<Edit2 size={14}/>} color={C.accent} title="Edit"         onClick={() => onEdit(u)} />}
                      {(isSuper || (isAdmin && u.role === 'employee')) && (
                        <ActionBtn icon={<Trash2 size={14}/>} color={C.red} title="Delete" onClick={() => setDelUser(u)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} pages={pages} onChange={setPage} total={filtered.length} perPage={PER_PAGE} />
      </div>

      {/* ── View Detail Modal ─────────────────────────────────── */}
      {detail && (
        <ProfileModal user={detail} currentUser={currentUser} onClose={() => setDetail(null)} />
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────── */}
      {delUser && (
        <DeleteModal
          user={delUser} currentUser={currentUser} users={users}
          onConfirm={id => { onDelete(id); setDelUser(null); }}
          onClose={() => setDelUser(null)}
        />
      )}
    </div>
  );
}

// ─── FilterSelect helper ──────────────────────────────────────────
function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '9px 12px', color: value ? C.text : C.muted, fontSize: 13,
        minWidth: 130, flex: '1 1 120px', outline: 'none', cursor: 'pointer',
      }}>
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────
function ProfileModal({ user, currentUser, onClose }) {
  const [showPwd, setShowPwd] = useState(false);
  const canSeePass = ['super_admin', 'admin'].includes(currentUser.role) || currentUser.id === user.id;

  const fields = [
    { icon: <Hash size={14}/>,      label: 'Employee ID',  val: user.id,          mono: true },
    { icon: <Mail size={14}/>,      label: 'Email',        val: user.email        },
    { icon: <Phone size={14}/>,     label: 'Phone',        val: user.phone || '—' },
    { icon: <Building2 size={14}/>, label: 'Department',   val: user.dept         },
    { icon: <Calendar size={14}/>,  label: 'Designation',  val: user.designation  },
    { icon: <Calendar size={14}/>,  label: 'Joined',       val: user.joined       },
    { icon: <Calendar size={14}/>,  label: 'Reporting To', val: user.reportingTo || 'N/A' },
  ];

  return (
    <Modal title="Employee Profile" onClose={onClose} width={480}>
      {/* Avatar + name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar name={user.name} size={68} bg={ROLE_COLORS[user.role]} />
        <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, marginTop: 12 }}>{user.name}</h3>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{user.designation} · {user.dept}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <Badge label={ROLES[user.role]} color={ROLE_COLORS[user.role]} />
          <Badge label={user.status === 'active' ? 'Active' : 'Inactive'} color={user.status === 'active' ? C.green : C.red} />
        </div>
      </div>

      {/* Info rows */}
      {fields.map(({ icon, label, val, mono }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13 }}>
            {icon}<span>{label}</span>
          </div>
          <span style={{ fontSize: 13, color: mono ? C.accent : C.text, fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit', background: mono ? `${C.accent}15` : 'none', padding: mono ? '2px 8px' : 0, borderRadius: mono ? 6 : 0 }}>
            {val}
          </span>
        </div>
      ))}

      {/* Password row */}
      {canSeePass && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13 }}>
            <Key size={14} /><span>Password</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.text, letterSpacing: '0.5px' }}>
              {showPwd ? user.password : '•'.repeat(Math.min(user.password.length, 12))}
            </span>
            <button onClick={() => setShowPwd(s => !s)}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}>
              {showPwd ? <EyeOff size={14}/> : <EyeIcon size={14}/>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────
function DeleteModal({ user, currentUser, users, onConfirm, onClose }) {
  const isSuper    = currentUser.role === 'super_admin';
  const needVerify = !isSuper;  // Admin must enter Super Admin password
  const [code, setCode] = useState('');
  const [err,  setErr]  = useState('');

  const saPassword = users.find(u => u.role === 'super_admin')?.password || '';

  const handleDelete = () => {
    if (needVerify && code !== saPassword) {
      setErr('Incorrect Super Admin password. Action denied.'); return;
    }
    onConfirm(user.id);
  };

  return (
    <Modal title="Confirm Deletion" onClose={onClose} width={420}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.red}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Trash2 size={24} color={C.red} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Remove Employee?</h3>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
          You are about to permanently remove{' '}
          <strong style={{ color: C.text }}>{user.name}</strong>{' '}
          <span style={{ fontFamily: 'monospace', color: C.accent, fontSize: 12 }}>({user.id})</span>{' '}
          from the system. This action cannot be undone.
        </p>
      </div>

      {/* Super Admin verification required for non-super admins */}
      {needVerify && (
        <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            🔐 Super Admin verification required to delete
          </p>
          <input value={code} onChange={e => { setCode(e.target.value); setErr(''); }}
            type="password" placeholder="Enter Super Admin password to confirm"
            style={{ width: '100%', background: C.surface, border: `1px solid ${err ? C.red : C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = err ? C.red : C.border} />
          {err && <p style={{ color: C.red, fontSize: 11, marginTop: 6 }}>{err}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose}
          style={{ flex: 1, padding: 11, borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleDelete}
          style={{ flex: 1, padding: 11, borderRadius: 10, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Delete Employee
        </button>
      </div>
    </Modal>
  );
}
