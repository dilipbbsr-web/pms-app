/**
 * parts/06_AssignmentPerf/PerformanceEval.jsx
 * Part 6 — Performance Evaluation / Appraisals
 * Tabs: My Appraisal | Conduct Appraisal (admin) | Appraisal History | 360° Feedback
 */
import { useState, useEffect } from 'react';
import { Award, Users, ClipboardList, RotateCcw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { C } from '@constants/theme';
import { can } from '@constants/roles';
import { Storage } from '@utils/storage';
import MyAppraisal      from './MyAppraisal';
import ConductAppraisal from './ConductAppraisal';
import AppraisalHistory from './AppraisalHistory';
import FeedbackForm     from './FeedbackForm';

const TABS = [
  { id: 'mine',     label: 'My Appraisal',      icon: <Award size={15}/>,        perm: 'viewOwnAppraisal'    },
  { id: 'conduct',  label: 'Conduct Appraisal',  icon: <ClipboardList size={15}/>,perm: 'conductAppraisal'   },
  { id: 'history',  label: 'History',            icon: <RotateCcw size={15}/>,    perm: 'viewOwnAppraisal'   },
  { id: 'feedback', label: '360° Feedback',      icon: <Users size={15}/>,        perm: 'viewOwnAppraisal'   },
];

export default function PerformanceEval({ users, currentUser }) {
  const [activeTab,   setActiveTab]   = useState('mine');
  const [appraisals,  setAppraisals]  = useState(() => Storage.getAppraisals());
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // employee being appraised

  useEffect(() => { Storage.setAppraisals(appraisals); }, [appraisals]);

  const saveAppraisal = (appraisal) => {
    const isNew = !appraisals.find(a => a.id === appraisal.id);
    setAppraisals(p => isNew ? [...p, appraisal] : p.map(a => a.id === appraisal.id ? appraisal : a));
    setShowForm(false); setEditTarget(null);
    toast.success(isNew ? 'Appraisal submitted' : 'Appraisal updated');
  };

  const myAppraisals   = appraisals.filter(a => a.employeeId === currentUser.id);
  const teamAppraisals = appraisals.filter(a => {
    if (currentUser.role === 'super_admin') return true;
    const emp = users.find(u => u.id === a.employeeId);
    return emp && emp.dept === currentUser.dept;
  });

  // Employees eligible for appraisal (in same dept, not self)
  const appraisableEmps = users.filter(u =>
    u.status === 'active' &&
    u.id !== currentUser.id &&
    (currentUser.role === 'super_admin' || u.dept === currentUser.dept)
  );

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
          {TABS.map(tab => {
            if (!can(currentUser.role, tab.perm)) return null;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer',
                  background: active ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : 'transparent',
                  color: active ? '#fff' : C.muted, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s' }}>
                {tab.icon}{tab.label}
              </button>
            );
          })}
        </div>
        {can(currentUser.role, 'conductAppraisal') && !showForm && (
          <button onClick={() => { setShowForm(true); setActiveTab('conduct'); setEditTarget(null); }}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: `0 3px 12px ${C.accent}40` }}>
            <Plus size={15}/> New Appraisal
          </button>
        )}
      </div>

      {showForm && can(currentUser.role, 'conductAppraisal') && (
        <ConductAppraisal
          currentUser={currentUser} users={appraisableEmps}
          allUsers={users} editTarget={editTarget}
          onSave={saveAppraisal} onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {!showForm && activeTab === 'mine'     && <MyAppraisal      appraisals={myAppraisals}   currentUser={currentUser} users={users}/>}
      {!showForm && activeTab === 'conduct'  && can(currentUser.role,'conductAppraisal') && <AppraisalHistory appraisals={teamAppraisals} users={users} currentUser={currentUser} onEdit={a=>{ setEditTarget(a); setShowForm(true); }}/>}
      {!showForm && activeTab === 'history'  && <AppraisalHistory appraisals={myAppraisals}   users={users} currentUser={currentUser}/>}
      {!showForm && activeTab === 'feedback' && <FeedbackForm     currentUser={currentUser}   users={users} appraisals={appraisals} onSave={saveAppraisal}/>}
    </div>
  );
}
