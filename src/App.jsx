/**
 * App.jsx — Supabase version
 * All data loaded async from Supabase on mount.
 */
import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { C }       from '@constants/theme';
import { can }     from '@constants/roles';
import { Storage } from '@utils/storage';

import Sidebar  from '@components/layout/Sidebar';
import Topbar   from '@components/layout/Topbar';

import LoginScreen      from '@parts/01_UserManagement/LoginScreen';
import OverviewSection  from '@parts/01_UserManagement/OverviewSection';
import EmployeeList     from '@parts/01_UserManagement/EmployeeList';
import EmployeeForm     from '@parts/01_UserManagement/EmployeeForm';
import ImportExport     from '@parts/01_UserManagement/ImportExport';
import RoleManagement   from '@parts/01_UserManagement/RoleManagement';
import DeptManagement   from '@parts/02_DepartmentHierarchy/DeptManagement';
import GoalSetting      from '@parts/03_GoalSetting/GoalSetting';
import KPITracking      from '@parts/04_KPI_KRA/KPITracking';
import TaskEvaluation   from '@parts/05_TaskEvaluation/TaskEvaluation';
import PerformanceEval  from '@parts/06_AssignmentPerf/PerformanceEval';
import ApprovalWorkflow from '@parts/07_ApprovalWorkflow/ApprovalWorkflow';
import Dashboard        from '@parts/08_Dashboard/Dashboard';
import Reports          from '@parts/09_Reports/Reports';
import Notifications    from '@parts/10_Notifications/Notifications';
import BulkImportExport from '@parts/11_ImportExport/BulkImportExport';

const PAGE_META = {
  'user-mgmt':     { title:'User Management',       subtitle:'Employees, roles & access'       },
  'dept-hier':     { title:'Department & Hierarchy', subtitle:'Org structure & approval chains' },
  'goals':         { title:'Goal Setting',           subtitle:'Set and track SMART goals'       },
  'kpi-kra':       { title:'KPI / KRA Tracking',     subtitle:'Key performance indicators'      },
  'tasks':         { title:'Task Evaluation',        subtitle:'Assign, track & evaluate tasks'  },
  'appraisal':     { title:'Performance Evaluation', subtitle:'Appraisals & 360° feedback'      },
  'approvals':     { title:'Approval Workflow',      subtitle:'3-level approval chain'          },
  'dashboard':     { title:'Dashboard & Insights',   subtitle:'Charts, KPIs & analytics'        },
  'reports':       { title:'Reports & Export',       subtitle:'Generate CSV · Excel · PDF'      },
  'notifications': { title:'Notifications',          subtitle:'Alerts & activity log'           },
  'import-export': { title:'Import / Export',        subtitle:'Bulk data management & backup'   },
};

const UM_TABS = [
  { id:'overview', label:'Overview'      },
  { id:'list',     label:'All Employees' },
  { id:'import',   label:'Import/Export', perm:'importEmployees' },
  { id:'roles',    label:'Roles',         superOnly:true },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => Storage.getSession());
  const [activePage,  setActivePage]  = useState('user-mgmt');
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [umView,      setUmView]      = useState('overview');
  const [editUser,    setEditUser]    = useState(null);

  // ── Load users from Supabase on mount ──────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await Storage.getUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Auth ───────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const user = await Storage.loginUser(email, password);
    if (!user) { toast.error('Invalid email or password'); return false; }
    if (user.status === 'inactive') { toast.error('Account deactivated. Contact Admin.'); return false; }
    setCurrentUser(user);
    Storage.setSession(user);
    toast.success('Welcome, ' + user.name.split(' ')[0] + '!');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    Storage.clearSession();
    toast('Signed out');
  };

  // ── User CRUD ──────────────────────────────────────────────
  const saveUser = async (user) => {
    const saved = await Storage.upsertUser(user);
    if (!saved) { toast.error('Failed to save. Check connection.'); return; }
    if (currentUser?.id === saved.id) { setCurrentUser(saved); Storage.setSession(saved); }
    await loadUsers();
    setUmView('list'); setEditUser(null);
    toast.success(user.name + ' saved');
  };

  const deleteUser = async (id) => {
    await Storage.deleteUser(id);
    await loadUsers();
    toast.error('Employee removed');
  };

  const importUsers = async (list) => {
    await Promise.all(list.map(u => Storage.upsertUser(u)));
    await loadUsers();
    toast.success(list.length + ' employees imported');
  };

  // ── Loading screen ─────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.accent},${C.accentDim})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:700, color:C.text }}>PerfManager Pro</p>
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.accent, opacity:0.4, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
      <p style={{ fontSize:13, color:C.muted }}>Connecting to database…</p>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}`}</style>
    </div>
  );

  // ── Login screen ───────────────────────────────────────────
  if (!currentUser) return (
    <>
      <Toaster position="bottom-right"/>
      <LoginScreen users={users} onLogin={handleLogin}/>
    </>
  );

  const meta = PAGE_META[activePage] || { title:'PerfManager Pro', subtitle:'' };
  const primaryAction = activePage==='user-mgmt' && can(currentUser.role,'addEmployee') && !['add','edit'].includes(umView)
    ? { label:'Add Employee', onClick:()=>{ setEditUser(null); setUmView('add'); } } : null;

  const renderUM = () => {
    if (umView==='overview') return <OverviewSection users={users} currentUser={currentUser}/>;
    if (umView==='list')     return <EmployeeList users={users} currentUser={currentUser} onEdit={u=>{setEditUser(u);setUmView('edit');}} onDelete={deleteUser}/>;
    if (umView==='add'||umView==='edit') return <EmployeeForm editUser={editUser} onSave={saveUser} onCancel={()=>{setUmView('list');setEditUser(null);}} currentUser={currentUser} existingUsers={users}/>;
    if (umView==='import')   return <ImportExport users={users} onImport={importUsers}/>;
    if (umView==='roles' && currentUser.role==='super_admin') return <RoleManagement users={users} onUpdate={saveUser}/>;
    return null;
  };

  return (
    <><Toaster position="bottom-right"/>
    <div style={{display:'flex',minHeight:'100vh',background:C.bg}}>
      <Sidebar currentUser={currentUser} activePage={activePage} onNavigate={p=>{setActivePage(p);setUmView('overview');}} onLogout={handleLogout}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <Topbar currentUser={currentUser} pageTitle={meta.title} pageSubtitle={meta.subtitle} primaryAction={primaryAction}/>
        <main style={{flex:1,padding:28,overflow:'auto'}}>

          {activePage==='user-mgmt'&&(<>
            {can(currentUser.role,'viewAllEmployees')&&(
              <div style={{display:'flex',gap:4,marginBottom:24,background:C.card,padding:4,borderRadius:12,width:'fit-content',border:`1px solid ${C.border}`}}>
                {UM_TABS.map(tab=>{
                  if(tab.superOnly&&currentUser.role!=='super_admin') return null;
                  if(tab.perm&&!can(currentUser.role,tab.perm)) return null;
                  const active=umView===tab.id;
                  return(<button key={tab.id} onClick={()=>{setUmView(tab.id);setEditUser(null);}}
                    style={{padding:'7px 16px',borderRadius:9,border:'none',fontSize:13,cursor:'pointer',
                      background:active?`linear-gradient(135deg,${C.accent},${C.accentDim})`:'transparent',
                      color:active?'#fff':C.muted,fontWeight:active?700:400,transition:'all .15s'}}>
                    {tab.label}
                  </button>);
                })}
              </div>
            )}
            {renderUM()}
          </>)}

          {activePage==='dept-hier'    && <DeptManagement   users={users} currentUser={currentUser}/>}
          {activePage==='goals'        && <GoalSetting       users={users} currentUser={currentUser}/>}
          {activePage==='kpi-kra'      && <KPITracking       users={users} currentUser={currentUser}/>}
          {activePage==='tasks'        && <TaskEvaluation    users={users} currentUser={currentUser}/>}
          {activePage==='appraisal'    && <PerformanceEval   users={users} currentUser={currentUser}/>}
          {activePage==='approvals'    && <ApprovalWorkflow  users={users} currentUser={currentUser}/>}
          {activePage==='dashboard'    && <Dashboard         users={users} currentUser={currentUser}/>}
          {activePage==='reports'      && <Reports           users={users} currentUser={currentUser}/>}
          {activePage==='notifications'&& <Notifications     users={users} currentUser={currentUser}/>}
          {activePage==='import-export'&& <BulkImportExport  users={users} currentUser={currentUser} onImport={importUsers}/>}

        </main>
      </div>
    </div></>
  );
}
