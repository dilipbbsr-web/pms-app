/**
 * parts/02_DepartmentHierarchy/DeptOverview.jsx
 * Six department cards — each showing headcount, active/inactive split,
 * admin count, colour coding, and a click-through to drill-down.
 */

import { Users, ChevronRight, TrendingUp, Award } from 'lucide-react';
import { C, DEPT_COLORS, ROLE_COLORS } from '@constants/theme';
import { DEPARTMENTS, DEPT_HIERARCHY, KPI_CATEGORIES } from '@constants/departments';
import { Avatar } from '@components/common';

export default function DeptOverview({ users, onSelectDept }) {
  const deptStats = DEPARTMENTS.map(dept => {
    const members  = users.filter(u => u.dept === dept);
    const active   = members.filter(u => u.status === 'active').length;
    const inactive = members.filter(u => u.status === 'inactive').length;
    const admins   = members.filter(u => ['super_admin', 'admin'].includes(u.role)).length;
    const levels   = DEPT_HIERARCHY[dept] || [];
    const color    = DEPT_COLORS[dept] || C.accent;
    return { dept, members, active, inactive, admins, levels, color };
  });

  const totalEmployees = users.length;

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* Summary bar */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '16px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Departments</p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: C.text }}>{DEPARTMENTS.length}</p>
        </div>
        <div style={{ width: 1, height: 40, background: C.border }} />
        <div>
          <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Headcount</p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: C.blue }}>{totalEmployees}</p>
        </div>
        <div style={{ width: 1, height: 40, background: C.border }} />
        <div>
          <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: C.green }}>
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        {/* Mini dept bar */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distribution</p>
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', gap: 1 }}>
            {deptStats.map(({ dept, members, color }) => (
              <div key={dept} title={`${dept}: ${members.length}`}
                style={{ flex: members.length || 0.5, background: color, transition: 'flex .6s ease', minWidth: 4 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            {deptStats.map(({ dept, color }) => (
              <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: C.muted }}>{dept.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
        {deptStats.map(({ dept, members, active, inactive, admins, levels, color }) => (
          <DeptCard key={dept}
            dept={dept} members={members} active={active}
            inactive={inactive} admins={admins} levels={levels}
            color={color} users={users}
            onClick={() => onSelectDept(dept)}
          />
        ))}
      </div>
    </div>
  );
}

function DeptCard({ dept, members, active, inactive, admins, levels, color, users, onClick }) {
  const topMembers = members.filter(u => u.status === 'active').slice(0, 3);
  const kpiCount   = (KPI_CATEGORIES[dept] || []).length;
  const pct        = members.length ? Math.round((active / members.length) * 100) : 0;

  return (
    <div onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
        borderTop: `3px solid ${color}`,
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

      {/* Card header */}
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Users size={18} color={color} />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700, color: C.text }}>{dept}</h3>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{levels.length} designation levels</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color }}>{members.length}</p>
            <p style={{ fontSize: 11, color: C.muted }}>employees</p>
          </div>
        </div>

        {/* Active bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Active rate</span>
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 5, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .8s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
        {[
          { label: 'Active',   val: active,   col: C.green  },
          { label: 'Inactive', val: inactive, col: C.red    },
          { label: 'Admins',   val: admins,   col: C.purple },
        ].map(({ label, val, col }) => (
          <div key={label} style={{ padding: '12px 16px', textAlign: 'center', borderRight: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: col }}>{val}</p>
            <p style={{ fontSize: 11, color: C.muted }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Team avatars + KPI info */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {topMembers.map((u, i) => (
            <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -8, border: `2px solid ${C.card}`, borderRadius: '50%' }}>
              <Avatar name={u.name} size={28} bg={ROLE_COLORS[u.role]} />
            </div>
          ))}
          {members.length > 3 && (
            <div style={{ marginLeft: -8, width: 28, height: 28, borderRadius: '50%', background: C.faint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.muted, border: `2px solid ${C.card}` }}>
              +{members.length - 3}
            </div>
          )}
          {members.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No employees yet</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: color, fontSize: 12, fontWeight: 600 }}>
          <TrendingUp size={13} /> {kpiCount} KPIs
          <ChevronRight size={14} style={{ marginLeft: 4 }} />
        </div>
      </div>
    </div>
  );
}
