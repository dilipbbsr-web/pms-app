/**
 * parts/07_ApprovalWorkflow/ApprovalWorkflow.jsx
 * Part 7 — 3-Level Approval Workflow
 * Consolidates all approval items: Goals, KPIs, Appraisals, Tasks
 * Levels: L1 (Team Lead) → L2 (Manager/HOD) → L3 (HR/Super Admin)
 */
import { useState, useEffect } from 'react';
import { GitBranch, Clock, CheckCircle, XCircle, List, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { C } from '@constants/theme';
import { can } from '@constants/roles';
import { Storage } from '@utils/storage';
import PendingApprovals from './PendingApprovals';
import ApprovalHistory  from './ApprovalHistory';
import ApprovalStats    from './ApprovalStats';

const TABS = [
  { id: 'pending', label: 'Pending',  icon: <Clock size={15}/>         },
  { id: 'history', label: 'History',  icon: <List size={15}/>          },
  { id: 'stats',   label: 'Analytics',icon: <BarChart2 size={15}/>     },
];

// Approval level based on role
const getApprovalLevel = (role) => {
  if (role === 'super_admin') return 'L3';
  if (role === 'admin')       return 'L2';
  return 'L1';
};

export default function ApprovalWorkflow({ users, currentUser }) {
  const [activeTab,  setActiveTab]  = useState('pending');
  const [goals,      setGoals]      = useState(() => Storage.getGoals());
  const [kpis,       setKpis]       = useState(() => Storage.getKPIs());
  const [appraisals, setAppraisals] = useState(() => Storage.getAppraisals());
  const [approvals,  setApprovals]  = useState(() => Storage.getApprovals());

  useEffect(() => { Storage.setGoals(goals); },      [goals]);
  useEffect(() => { Storage.setKPIs(kpis); },        [kpis]);
  useEffect(() => { Storage.setAppraisals(appraisals); }, [appraisals]);
  useEffect(() => { Storage.setApprovals(approvals); }, [approvals]);

  const myLevel = getApprovalLevel(currentUser.role);

  // Build unified approval queue from all sources
  const buildQueue = () => {
    const items = [];

    // Goals pending approval
    goals.filter(g => g.status === 'submitted').forEach(g => {
      const emp = users.find(u => u.id === g.employeeId);
      if (!emp) return;
      const canApprove =
        (myLevel === 'L1' && emp.reportingTo === currentUser.id) ||
        (myLevel === 'L2' && emp.dept === currentUser.dept) ||
        (myLevel === 'L3');
      if (canApprove) items.push({ ...g, itemType: 'Goal', displayId: g.id, title: g.title, employeeId: g.employeeId, currentLevel: 'L1', source: 'goal' });
    });

    // Appraisals pending finalization
    appraisals.filter(a => a.status === 'submitted').forEach(a => {
      const emp = users.find(u => u.id === a.employeeId);
      if (!emp) return;
      const canApprove =
        (myLevel === 'L2' && emp.dept === currentUser.dept) ||
        (myLevel === 'L3');
      if (canApprove) items.push({ ...a, itemType: 'Appraisal', displayId: a.id, title: `Appraisal — ${emp?.name}`, currentLevel: 'L2', source: 'appraisal' });
    });

    return items;
  };

  const pendingQueue = buildQueue();

  // Approved/rejected history from approvals log
  const historyLog = approvals.filter(a =>
    a.reviewedBy === currentUser.id ||
    currentUser.role === 'super_admin' ||
    (currentUser.role === 'admin' && users.find(u => u.id === a.employeeId)?.dept === currentUser.dept)
  );

  const handleApprove = (item, comment = '') => {
    const log = {
      id:         `APV-${Date.now()}`,
      itemId:     item.id,
      itemType:   item.itemType,
      employeeId: item.employeeId,
      reviewedBy: currentUser.id,
      action:     'approved',
      level:      myLevel,
      comment,
      reviewedAt: new Date().toISOString(),
    };
    setApprovals(p => [...p, log]);

    // Update source record
    if (item.source === 'goal') {
      const nextStatus = myLevel === 'L1' ? 'approved' : myLevel === 'L2' ? 'l2approved' : 'completed';
      setGoals(p => p.map(g => g.id === item.id ? { ...g, status: nextStatus } : g));
    }
    if (item.source === 'appraisal') {
      setAppraisals(p => p.map(a => a.id === item.id ? { ...a, status: myLevel === 'L3' ? 'finalized' : 'l2approved' } : a));
    }
    toast.success(`${item.itemType} approved at ${myLevel}`);
  };

  const handleReject = (item, comment) => {
    if (!comment?.trim()) { toast.error('Rejection reason is required'); return; }
    const log = {
      id:         `APV-${Date.now()}`,
      itemId:     item.id,
      itemType:   item.itemType,
      employeeId: item.employeeId,
      reviewedBy: currentUser.id,
      action:     'rejected',
      level:      myLevel,
      comment,
      reviewedAt: new Date().toISOString(),
    };
    setApprovals(p => [...p, log]);
    if (item.source === 'goal')      setGoals(p => p.map(g => g.id === item.id ? { ...g, status: 'rejected', rejectedComment: comment } : g));
    if (item.source === 'appraisal') setAppraisals(p => p.map(a => a.id === item.id ? { ...a, status: 'rejected' } : a));
    toast.error(`${item.itemType} rejected`);
  };

  const pendingCount = pendingQueue.length;

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const badge  = tab.id === 'pending' ? pendingCount : 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                  background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                  color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s' }}>
                {tab.icon}{tab.label}
                {badge > 0 && <span style={{ background: C.red, color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Level badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: `${C.purple}15`, border: `1px solid ${C.purple}35`, borderRadius: 10 }}>
          <GitBranch size={14} color={C.purple}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.purple }}>You are: {myLevel} Approver</span>
        </div>
      </div>

      {activeTab === 'pending' && (
        <PendingApprovals
          queue={pendingQueue} users={users} currentUser={currentUser}
          myLevel={myLevel} onApprove={handleApprove} onReject={handleReject}
        />
      )}
      {activeTab === 'history' && (
        <ApprovalHistory log={historyLog} users={users} currentUser={currentUser}/>
      )}
      {activeTab === 'stats' && (
        <ApprovalStats log={approvals} users={users} currentUser={currentUser}/>
      )}
    </div>
  );
}
