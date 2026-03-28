/**
 * parts/01_UserManagement/OverviewSection.jsx
 * Overview dashboard for User Management:
 *  — Stat cards (total, active, inactive, admins)
 *  — Headcount bar chart per department
 *  — Role distribution tiles
 *  — Recent additions list
 */

import { Users, CheckCircle, XCircle, Shield, Building2, TrendingUp, UserPlus } from 'lucide-react';
import { C, ROLE_COLORS, DEPT_COLORS } from '@constants/theme';
import { ROLES } from '@constants/roles';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar, Badge, StatCard } from '@components/common';

export default function OverviewSection({ users, currentUser }) {
  const active   = users.filter(u => u.status === 'active').length;
  const inactive = users.filter(u => u.status === 'inactive').length;
  const admins   = users.filter(u => ['super_admin', 'admin'].includes(u.role)).length;

  const deptCounts = DEPARTMENTS.map(d => ({
    dept: d, count: users.filter(u => u.dept === d).length,
  }));
  const maxCount = Math.max(...deptCounts.map(d => d.count), 1);

  // Last 5 added (by id descending)
  const recent = [...users]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* ── Welcome banner ──────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.card} 0%, #1a2540 100%)`,
        border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px',
        marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderLeft: `4px solid ${C.accent}`,
      }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: C.text }}>
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h3>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          background: `${C.accent}18`, border: `1px solid ${C.accent}30`, borderRadius: 12,
          padding: '10px 18px', textAlign: 'right',
        }}>
          <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Role</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginTop: 2 }}>{ROLES[currentUser.role]}</p>
          <p style={{ fontSize: 11, color: C.muted }}>{currentUser.dept}</p>
        </div>
      </div>

      {/* ── Stat cards row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Users size={18}/>}        label="Total Employees" value={users.length}  sub={`${active} active · ${inactive} inactive`} color={C.blue}/>
        <StatCard icon={<CheckCircle size={18}/>}   label="Active"          value={active}         sub="Currently enabled"                         color={C.green}/>
        <StatCard icon={<XCircle size={18}/>}       label="Inactive"        value={inactive}       sub="Deactivated accounts"                      color={C.red}/>
        <StatCard icon={<Shield size={18}/>}        label="Admins"          value={admins}         sub="With elevated access"                      color={C.purple}/>
      </div>

      {/* ── Bottom grid: dept chart + role tiles + recent ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Department headcount */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Building2 size={16} color={C.accent} />
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>Headcount by Department</h3>
          </div>
          {deptCounts.map(({ dept, count }) => (
            <div key={dept} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{dept}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: DEPT_COLORS[dept] || C.accent,
                  background: `${DEPT_COLORS[dept] || C.accent}18`,
                  padding: '2px 8px', borderRadius: 99,
                }}>{count}</span>
              </div>
              <div style={{ height: 7, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${(count / maxCount) * 100}%`,
                  background: `linear-gradient(90deg,${DEPT_COLORS[dept] || C.accent},${C.blue})`,
                  transition: 'width .8s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Role distribution */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Shield size={16} color={C.purple} />
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>Role Distribution</h3>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(ROLES).map(([role, label]) => {
                const count = users.filter(u => u.role === role).length;
                const pct   = users.length ? ((count / users.length) * 100).toFixed(0) : 0;
                const col   = ROLE_COLORS[role];
                return (
                  <div key={role} style={{
                    flex: 1, background: C.surface, borderRadius: 12, padding: '14px 10px',
                    textAlign: 'center', border: `1px solid ${col}25`,
                  }}>
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: col }}>{count}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</p>
                    <div style={{ height: 3, borderRadius: 99, background: C.faint, margin: '8px 0 4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width .8s ease' }} />
                    </div>
                    <p style={{ fontSize: 10, color: col }}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently added */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <UserPlus size={16} color={C.green} />
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>Recently Added</h3>
            </div>
            {recent.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: `1px solid ${C.border}`,
              }}>
                <Avatar name={u.name} size={32} bg={ROLE_COLORS[u.role]} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{u.designation}</p>
                </div>
                <Badge label={u.status === 'active' ? 'Active' : 'Inactive'} color={u.status === 'active' ? C.green : C.red} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
