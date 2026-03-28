/**
 * parts/03_GoalSetting/GoalSetting.jsx
 * Part 3 — Goal Setting module
 * Tabs: My Goals | Team Goals (admin) | Goal Templates | Approval Status
 *
 * Goal lifecycle:
 *   Employee creates → Draft → Submitted → L1 Approved → L2 Approved → L3 Final
 *
 * Goals are mapped to employee designation + department automatically.
 * When submitted, they appear in the reporting manager's approval queue.
 */

import { useState, useEffect } from 'react';
import { Target, Users, LayoutTemplate, GitBranch, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { C } from '@constants/theme';
import { can } from '@constants/roles';
import { Storage } from '@utils/storage';
import MyGoals       from './MyGoals';
import GoalForm      from './GoalForm';
import TeamGoals     from './TeamGoals';
import GoalTemplates from './GoalTemplates';

const TABS = [
  { id: 'my',        label: 'My Goals',       icon: <Target size={15}/>,        perm: 'setOwnGoals'   },
  { id: 'team',      label: 'Team Goals',      icon: <Users size={15}/>,         perm: 'viewTeamGoals' },
  { id: 'templates', label: 'Goal Templates',  icon: <LayoutTemplate size={15}/>,perm: 'viewTeamGoals' },
  { id: 'approvals', label: 'Pending Approvals',icon: <GitBranch size={15}/>,    perm: 'approveGoals'  },
];

export default function GoalSetting({ users, currentUser }) {
  const [activeTab,  setActiveTab]  = useState('my');
  const [goals,      setGoals]      = useState(() => Storage.getGoals());
  const [showForm,   setShowForm]   = useState(false);
  const [editGoal,   setEditGoal]   = useState(null);

  useEffect(() => { Storage.setGoals(goals); }, [goals]);

  const saveGoal = (goal) => {
    const isNew = !goals.find(g => g.id === goal.id);
    setGoals(p => isNew ? [...p, goal] : p.map(g => g.id === goal.id ? goal : g));
    setShowForm(false); setEditGoal(null);
    toast.success(isNew ? 'Goal created successfully' : 'Goal updated');
    // Notify hierarchy when submitted
    if (goal.status === 'submitted') {
      toast(`Goal sent for L1 approval`, { icon: '📤' });
    }
  };

  const deleteGoal = (id) => {
    setGoals(p => p.filter(g => g.id !== id));
    toast.error('Goal deleted');
  };

  const updateGoalStatus = (id, status, comment = '') => {
    setGoals(p => p.map(g => g.id === id
      ? { ...g, status, [`${status}By`]: currentUser.id, [`${status}At`]: new Date().toISOString(), [`${status}Comment`]: comment }
      : g
    ));
    toast.success(`Goal ${status}`);
  };

  const myGoals   = goals.filter(g => g.employeeId === currentUser.id);
  const teamGoals = goals.filter(g => {
    if (currentUser.role === 'super_admin') return true;
    // Admin sees goals of employees in same dept or reporting to them
    const emp = users.find(u => u.id === g.employeeId);
    return emp && emp.dept === currentUser.dept;
  });
  const pendingApprovals = goals.filter(g => {
    if (g.status !== 'submitted') return false;
    const emp = users.find(u => u.id === g.employeeId);
    return emp && emp.reportingTo === currentUser.id;
  });

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* Tab bar + Add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {TABS.map(tab => {
            if (!can(currentUser.role, tab.perm)) return null;
            const active = activeTab === tab.id;
            const badge  = tab.id === 'approvals' ? pendingApprovals.length : 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                  background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                  color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s', position: 'relative',
                }}>
                {tab.icon}{tab.label}
                {badge > 0 && (
                  <span style={{ background: C.red, color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {can(currentUser.role, 'setOwnGoals') && !showForm && (
          <button onClick={() => { setEditGoal(null); setShowForm(true); setActiveTab('my'); }}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: `0 3px 12px ${C.accent}40` }}>
            <Plus size={15}/> New Goal
          </button>
        )}
      </div>

      {/* Goal form (add/edit) */}
      {showForm && (
        <GoalForm
          editGoal={editGoal}
          currentUser={currentUser}
          users={users}
          onSave={saveGoal}
          onCancel={() => { setShowForm(false); setEditGoal(null); }}
        />
      )}

      {/* Tab content */}
      {!showForm && activeTab === 'my' && (
        <MyGoals
          goals={myGoals} currentUser={currentUser} users={users}
          onEdit={g => { setEditGoal(g); setShowForm(true); }}
          onDelete={deleteGoal}
          onStatusChange={updateGoalStatus}
        />
      )}
      {!showForm && activeTab === 'team' && can(currentUser.role, 'viewTeamGoals') && (
        <TeamGoals goals={teamGoals} users={users} currentUser={currentUser} onStatusChange={updateGoalStatus} />
      )}
      {!showForm && activeTab === 'templates' && (
        <GoalTemplates currentUser={currentUser} onUseTemplate={template => { setEditGoal({ ...template, id: null }); setShowForm(true); setActiveTab('my'); }} />
      )}
      {!showForm && activeTab === 'approvals' && can(currentUser.role, 'approveGoals') && (
        <TeamGoals goals={pendingApprovals} users={users} currentUser={currentUser} onStatusChange={updateGoalStatus} approvalMode />
      )}
    </div>
  );
}
