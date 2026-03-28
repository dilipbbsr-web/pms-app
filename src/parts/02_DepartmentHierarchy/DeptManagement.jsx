/**
 * parts/02_DepartmentHierarchy/DeptManagement.jsx
 * Main orchestrator for Part 2 — Department & Hierarchy Management.
 * Handles tab navigation between:
 *   overview → hierarchy tree → employee list → KPI preview
 */

import { useState } from 'react';
import { Building2, GitBranch, Users, BarChart2 } from 'lucide-react';
import { C, DEPT_COLORS } from '@constants/theme';
import DeptOverview     from './DeptOverview';
import HierarchyTree    from './HierarchyTree';
import EmployeesByDept  from './EmployeesByDept';
import KPIPreview       from './KPIPreview';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: <Building2 size={15}/> },
  { id: 'hierarchy',  label: 'Hierarchy',  icon: <GitBranch size={15}/> },
  { id: 'employees',  label: 'Employees',  icon: <Users size={15}/>     },
  { id: 'kpi',        label: 'KPI / KRA',  icon: <BarChart2 size={15}/> },
];

export default function DeptManagement({ users, currentUser }) {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [selectedDept, setSelectedDept] = useState(null);

  // When a dept card is clicked from overview
  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setActiveTab('hierarchy');
  };

  const handleBack = () => {
    setSelectedDept(null);
    setActiveTab('overview');
  };

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.card, padding: 4, borderRadius: 14, width: 'fit-content', border: `1px solid ${C.border}` }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'overview') setSelectedDept(null); }}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                color: active ? '#fff' : C.muted,
                fontWeight: active ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all .15s',
              }}>
              {tab.icon}{tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Dept context pill (when a dept is selected) ───────── */}
      {selectedDept && activeTab !== 'overview' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
          padding: '6px 14px', borderRadius: 99,
          background: `${DEPT_COLORS[selectedDept] || C.accent}15`,
          border: `1px solid ${DEPT_COLORS[selectedDept] || C.accent}40`,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEPT_COLORS[selectedDept] || C.accent }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: DEPT_COLORS[selectedDept] || C.accent }}>{selectedDept}</span>
          <button onClick={handleBack}
            style={{ marginLeft: 4, background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12 }}>×</button>
        </div>
      )}

      {/* ── Content routing ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <DeptOverview users={users} onSelectDept={handleSelectDept} />
      )}

      {activeTab === 'hierarchy' && (
        selectedDept
          ? <HierarchyTree dept={selectedDept} users={users} onBack={handleBack} />
          : <DeptOverview users={users} onSelectDept={d => { setSelectedDept(d); }} />
      )}

      {activeTab === 'employees' && (
        selectedDept
          ? <EmployeesByDept dept={selectedDept} users={users} onBack={handleBack} />
          : <DeptOverview users={users} onSelectDept={d => { setSelectedDept(d); setActiveTab('employees'); }} />
      )}

      {activeTab === 'kpi' && (
        selectedDept
          ? <KPIPreview dept={selectedDept} onBack={handleBack} />
          : <DeptOverview users={users} onSelectDept={d => { setSelectedDept(d); setActiveTab('kpi'); }} />
      )}
    </div>
  );
}
