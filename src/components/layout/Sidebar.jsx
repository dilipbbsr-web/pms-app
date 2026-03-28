/**
 * components/layout/Sidebar.jsx
 * Collapsible sidebar with role-gated navigation.
 * Each part of the app adds its nav items through the NAV_ITEMS array below.
 */

import { useState } from 'react';
import {
  Shield, Users, Building2, Target, BarChart2, CheckSquare,
  Award, GitBranch, LayoutDashboard, FileText, Bell, Upload,
  LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES } from '@constants/roles';
import { Avatar, Badge } from '@components/common';

// ─── Navigation catalogue ─────────────────────────────────────────
// Each entry: id, label, icon, part number, minimum role to see it
const NAV_ITEMS = [
  { id: 'user-mgmt',    label: 'User Management',    icon: <Users size={18}/>,         part: 1,  minRole: 'admin'       },
  { id: 'dept-hier',    label: 'Departments',         icon: <Building2 size={18}/>,     part: 2,  minRole: 'employee'    },
  { id: 'goals',        label: 'Goal Setting',        icon: <Target size={18}/>,        part: 3,  minRole: 'employee'    },
  { id: 'kpi-kra',      label: 'KPI / KRA',           icon: <BarChart2 size={18}/>,     part: 4,  minRole: 'employee'    },
  { id: 'tasks',        label: 'Task Evaluation',     icon: <CheckSquare size={18}/>,   part: 5,  minRole: 'employee'    },
  { id: 'appraisal',    label: 'Performance',         icon: <Award size={18}/>,         part: 6,  minRole: 'employee'    },
  { id: 'approvals',    label: 'Approvals',           icon: <GitBranch size={18}/>,     part: 7,  minRole: 'employee'    },
  { id: 'dashboard',    label: 'Dashboard',           icon: <LayoutDashboard size={18}/>, part: 8, minRole: 'employee'   },
  { id: 'reports',      label: 'Reports',             icon: <FileText size={18}/>,      part: 9,  minRole: 'admin'       },
  { id: 'notifications',label: 'Notifications',       icon: <Bell size={18}/>,          part: 10, minRole: 'employee'    },
  { id: 'import-export',label: 'Import / Export',     icon: <Upload size={18}/>,        part: 11, minRole: 'admin'       },
];

const ROLE_RANK = { super_admin: 3, admin: 2, employee: 1 };

function hasAccess(userRole, minRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

// ─────────────────────────────────────────────────────────────────
export default function Sidebar({ currentUser, activePage, onNavigate, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => hasAccess(currentUser.role, item.minRole));

  return (
    <aside style={{
      width: collapsed ? 64 : 230,
      minHeight: '100vh',
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      transition: 'width .25s ease',
      flexShrink: 0,
      position: 'relative', zIndex: 10,
    }}>
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '16px 0' : '20px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${C.border}`,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg,${C.accent},${C.accentDim})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${C.accent}40`,
        }}>
          <Shield size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '15px', color: C.text, lineHeight: 1.2 }}>
              PerfManager
            </p>
            <p style={{ fontSize: '10px', color: C.muted }}>Pro Suite</p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {visibleItems.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10, border: 'none',
                background: active ? `${C.accent}18` : 'transparent',
                color: active ? C.accent : C.muted,
                fontSize: '13px', fontWeight: active ? 600 : 400,
                transition: 'all .15s', marginBottom: 2, cursor: 'pointer',
                borderLeft: active && !collapsed ? `3px solid ${C.accent}` : '3px solid transparent',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = `${C.faint}60`; e.currentTarget.style.color = C.text; }}}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── User card + logout ─────────────────────────────────── */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 12px', borderTop: `1px solid ${C.border}` }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar name={currentUser.name} size={32} bg={ROLE_COLORS[currentUser.role]} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </p>
              <p style={{ fontSize: '10px', color: ROLE_COLORS[currentUser.role] }}>
                {ROLES[currentUser.role]}
              </p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '8px 10px',
            borderRadius: 8, border: 'none', background: 'transparent',
            color: C.red, fontSize: '13px', fontWeight: 500,
            transition: 'background .15s', cursor: 'pointer',
          }}
          onMouseOver={e => e.currentTarget.style.background = `${C.red}18`}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={16} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      {/* ── Collapse toggle ───────────────────────────────────── */}
      <button onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)',
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${C.border}`, background: C.card,
          color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, cursor: 'pointer',
        }}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
