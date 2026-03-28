/**
 * parts/08_Dashboard/Dashboard.jsx
 * Part 8 — Dashboard & Insights
 * Tabs: Overview | Performance | Goals | Departments | Leaderboard
 */
import { useState, useEffect } from 'react';
import { LayoutDashboard, Award, Target, Building2, Trophy } from 'lucide-react';
import { C } from '@constants/theme';
import { Storage } from '@utils/storage';
import OrgOverview  from './OrgOverview';
import PerfInsights from './PerfInsights';
import GoalInsights from './GoalInsights';
import DeptInsights from './DeptInsights';
import Leaderboard  from './Leaderboard';

const TABS = [
  { id: 'overview', label: 'Overview',    icon: <LayoutDashboard size={15}/> },
  { id: 'perf',     label: 'Performance', icon: <Award size={15}/>           },
  { id: 'goals',    label: 'Goals',       icon: <Target size={15}/>          },
  { id: 'depts',    label: 'Departments', icon: <Building2 size={15}/>       },
  { id: 'leaders',  label: 'Leaderboard', icon: <Trophy size={15}/>          },
];

export default function Dashboard({ users, currentUser }) {
  const [activeTab,  setActiveTab]  = useState('overview');
  const [goals,      setGoals]      = useState([]);
  const [kpis,       setKpis]       = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [approvals,  setApprovals]  = useState([]);

  useEffect(() => {
    setGoals(Storage.getGoals());
    setKpis(Storage.getKPIs());
    setAppraisals(Storage.getAppraisals());
    setTasks(Storage.getTasks());
    setApprovals(Storage.getApprovals());
  }, [activeTab]);

  const data = { users, goals, kpis, appraisals, tasks, approvals, currentUser };

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.card, padding: 4, borderRadius: 14, width: 'fit-content', border: `1px solid ${C.border}` }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s' }}>
              {tab.icon}{tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'overview' && <OrgOverview  {...data}/>}
      {activeTab === 'perf'     && <PerfInsights {...data}/>}
      {activeTab === 'goals'    && <GoalInsights {...data}/>}
      {activeTab === 'depts'    && <DeptInsights {...data}/>}
      {activeTab === 'leaders'  && <Leaderboard  {...data}/>}
    </div>
  );
}
