/**
 * parts/04_KPI_KRA/KPITracking.jsx
 * Part 4 — KPI / KRA Tracking
 * FIX: DeptKPIs and Scorecard are named exports inside KRAProgress.jsx
 */
import { useState, useEffect } from 'react';
import { BarChart2, Target, Building2, Award, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { C } from '@constants/theme';
import { can } from '@constants/roles';
import { Storage } from '@utils/storage';

import MyKPIs                               from './MyKPIs';
import KRAProgress, { DeptKPIs, Scorecard } from './KRAProgress';
import KPIForm                              from './KPIForm';

const TABS = [
  { id: 'my',        label: 'My KPIs',      icon: <BarChart2 size={15}/>, perm: 'viewOwnKPI'  },
  { id: 'kra',       label: 'KRA Progress', icon: <Target size={15}/>,   perm: 'viewOwnKPI'  },
  { id: 'dept',      label: 'Dept KPIs',    icon: <Building2 size={15}/>,perm: 'viewTeamKPI' },
  { id: 'scorecard', label: 'Scorecard',    icon: <Award size={15}/>,    perm: 'viewOwnKPI'  },
];

export default function KPITracking({ users, currentUser }) {
  const [activeTab, setActiveTab] = useState('my');
  const [kpis,      setKpis]      = useState(() => Storage.getKPIs());
  const [showForm,  setShowForm]  = useState(false);
  const [editKPI,   setEditKPI]   = useState(null);

  useEffect(() => { Storage.setKPIs(kpis); }, [kpis]);

  const saveKPI = (kpi) => {
    const isNew = !kpis.find(k => k.id === kpi.id);
    setKpis(p => isNew ? [...p, kpi] : p.map(k => k.id === kpi.id ? kpi : k));
    setShowForm(false); setEditKPI(null);
    toast.success(isNew ? 'KPI created' : 'KPI updated');
  };

  const deleteKPI = (id) => { setKpis(p => p.filter(k => k.id !== id)); toast.error('KPI deleted'); };

  const myKPIs   = kpis.filter(k => k.employeeId === currentUser.id);
  const deptKPIs = kpis.filter(k => {
    if (currentUser.role === 'super_admin') return true;
    const emp = users.find(u => u.id === k.employeeId);
    return emp && emp.dept === currentUser.dept;
  });

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {TABS.map(tab => {
            if (!can(currentUser.role, tab.perm)) return null;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                  background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                  color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s' }}>
                {tab.icon}{tab.label}
              </button>
            );
          })}
        </div>
        {can(currentUser.role, 'enterKPIActuals') && !showForm && (
          <button onClick={() => { setEditKPI(null); setShowForm(true); setActiveTab('my'); }}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: `0 3px 12px ${C.accent}40` }}>
            <Plus size={15}/> Add KPI Entry
          </button>
        )}
      </div>

      {showForm && <KPIForm editKPI={editKPI} currentUser={currentUser} users={users} onSave={saveKPI} onCancel={() => { setShowForm(false); setEditKPI(null); }}/>}

      {!showForm && activeTab === 'my'        && <MyKPIs      kpis={myKPIs}   currentUser={currentUser} users={users} onEdit={k => { setEditKPI(k); setShowForm(true); }} onDelete={deleteKPI}/>}
      {!showForm && activeTab === 'kra'       && <KRAProgress kpis={myKPIs}   currentUser={currentUser}/>}
      {!showForm && activeTab === 'dept'      && can(currentUser.role, 'viewTeamKPI') && <DeptKPIs kpis={deptKPIs} users={users} currentUser={currentUser}/>}
      {!showForm && activeTab === 'scorecard' && <Scorecard   kpis={myKPIs}   currentUser={currentUser} users={users} allKpis={deptKPIs}/>}
    </div>
  );
}
