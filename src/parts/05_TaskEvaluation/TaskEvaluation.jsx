/**
 * parts/05_TaskEvaluation/TaskEvaluation.jsx
 * Part 5 — Task Evaluation. Tabs: My Tasks | Task Board | Assign Tasks | Evaluations
 */
import { useState, useEffect } from 'react';
import { CheckSquare, Plus, LayoutGrid, ClipboardList, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { C } from '@constants/theme';
import { can } from '@constants/roles';
import { Storage } from '@utils/storage';
import MyTasks    from './MyTasks';
import AssignTask from './AssignTask';
import TaskBoard  from './TaskBoard';
import TaskEval   from './TaskEval';

const TABS = [
  { id: 'mine',   label: 'My Tasks',     icon: <CheckSquare size={15}/>,  perm: 'viewOwnTasks'  },
  { id: 'board',  label: 'Task Board',   icon: <LayoutGrid size={15}/>,   perm: 'viewOwnTasks'  },
  { id: 'assign', label: 'Assign Tasks', icon: <ClipboardList size={15}/>,perm: 'assignTasks'   },
  { id: 'eval',   label: 'Evaluations',  icon: <Star size={15}/>,         perm: 'evaluateTasks' },
];

export default function TaskEvaluation({ users, currentUser }) {
  const [activeTab, setActiveTab] = useState('mine');
  const [tasks,     setTasks]     = useState(() => Storage.getTasks());
  const [showForm,  setShowForm]  = useState(false);

  useEffect(() => { Storage.setTasks(tasks); }, [tasks]);

  const saveTask   = (task) => {
    const isNew = !tasks.find(t => t.id === task.id);
    setTasks(p => isNew ? [...p, task] : p.map(t => t.id === task.id ? task : t));
    setShowForm(false);
    toast.success(isNew ? 'Task assigned' : 'Task updated');
  };
  const updateTask = (id, upd) => setTasks(p => p.map(t => t.id === id ? { ...t, ...upd, updatedAt: new Date().toISOString() } : t));
  const deleteTask = (id) => { setTasks(p => p.filter(t => t.id !== id)); toast.error('Task deleted'); };

  const myTasks   = tasks.filter(t => t.assigneeId === currentUser.id);
  const teamTasks = tasks.filter(t => {
    if (currentUser.role === 'super_admin') return true;
    const emp = users.find(u => u.id === t.assigneeId);
    return emp && (emp.reportingTo === currentUser.id || emp.dept === currentUser.dept);
  });
  const pendingEval = teamTasks.filter(t => t.status === 'completed' && !t.rating);

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {TABS.map(tab => {
            if (!can(currentUser.role, tab.perm)) return null;
            const active = activeTab === tab.id;
            const badge  = tab.id === 'eval' ? pendingEval.length : 0;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                  background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                  color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s' }}>
                {tab.icon}{tab.label}
                {badge > 0 && <span style={{ background: C.red, color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px', marginLeft: 2 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
        {can(currentUser.role, 'assignTasks') && !showForm && (
          <button onClick={() => { setShowForm(true); setActiveTab('assign'); }}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: `0 3px 12px ${C.accent}40` }}>
            <Plus size={15}/> Assign Task
          </button>
        )}
      </div>

      {showForm && <AssignTask currentUser={currentUser} users={users} onSave={saveTask} onCancel={() => setShowForm(false)}/>}
      {!showForm && activeTab === 'mine'   && <MyTasks   tasks={myTasks}    currentUser={currentUser} users={users} onUpdate={updateTask} onDelete={deleteTask}/>}
      {!showForm && activeTab === 'board'  && <TaskBoard tasks={teamTasks}  currentUser={currentUser} users={users} onUpdate={updateTask}/>}
      {!showForm && activeTab === 'assign' && can(currentUser.role,'assignTasks') && <MyTasks tasks={teamTasks} currentUser={currentUser} users={users} onUpdate={updateTask} onDelete={deleteTask} managerView/>}
      {!showForm && activeTab === 'eval'   && can(currentUser.role,'evaluateTasks') && <TaskEval tasks={pendingEval} users={users} currentUser={currentUser} onEval={updateTask}/>}
    </div>
  );
}
