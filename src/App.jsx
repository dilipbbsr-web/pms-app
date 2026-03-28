/**
 * App.jsx — COMPLETE Root Shell
 * All 11 parts wired and active.
 */
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { C }            from '@constants/theme';
import { can }          from '@constants/roles';
import { Storage }      from '@utils/storage';
import { setIdCounter } from '@utils/idGenerator';
import { SEED_USERS, SEED_ID_COUNTER } from '@data/seedData';
import Sidebar  from '@components/layout/Sidebar';
import Topbar   from '@components/layout/Topbar';

// All 11 parts
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
  'user-mgmt':     { title:'User Management',        subtitle:'Employees, roles & access'       },
  'dept-hier':     { title:'Department & Hierarchy',  subtitle:'Org structure & approval chains' },
  'goals':         { title:'Goal Setting',            subtitle:'Set and track SMART goals'       },
  'kpi-kra':       { title:'KPI / KRA Tracking',      subtitle:'Key performance indicators'      },
  'tasks':         { title:'Task Evaluation',         subtitle:'Assign, track & evaluate tasks'  },
  'appraisal':     { title:'Performance Evaluation',  subtitle:'Appraisals & 360° feedback'      },
  'approvals':     { title:'Approval Workflow',       subtitle:'3-level approval chain'          },
  'dashboard':     { title:'Dashboard & Insights',    subtitle:'Charts, KPIs & analytics'        },
  'reports':       { title:'Reports & Export',        subtitle:'Generate CSV · Excel · PDF'      },
  'notifications': { title:'Notifications',           subtitle:'Alerts & activity log'           },
  'import-export': { title:'Import / Export',         subtitle:'Bulk data management & backup'   },
};

const UM_TABS = [
  { id:'overview', label:'Overview'       },
  { id:'list',     label:'All Employees'  },
  { id:'import',   label:'Import/Export',  perm:'importEmployees' },
  { id:'roles',    label:'Roles',          superOnly:true },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(()=>Storage.getSession());
  const [activePage,  setActivePage]  = useState('user-mgmt');
  const [users, setUsers] = useState(()=>{
    const s=Storage.getUsers(); if(s.length>0) return s;
    setIdCounter(SEED_ID_COUNTER); Storage.setUsers(SEED_USERS); return SEED_USERS;
  });
  const [umView,   setUmView]   = useState('overview');
  const [editUser, setEditUser] = useState(null);
  useEffect(()=>{ Storage.setUsers(users); },[users]);

  const handleLogin  = u=>{ setCurrentUser(u); Storage.setSession(u); toast.success('Welcome, '+u.name.split(' ')[0]+'!'); };
  const handleLogout = ()=>{ setCurrentUser(null); Storage.clearSession(); toast('Signed out'); };
  const saveUser = u=>{
    const isNew=!users.find(x=>x.id===u.id);
    setUsers(p=>isNew?[...p,u]:p.map(x=>x.id===u.id?u:x));
    if(currentUser?.id===u.id){setCurrentUser(u);Storage.setSession(u);}
    setUmView('list'); setEditUser(null);
    toast.success(u.name+(isNew?' added':' updated'));
  };
  const deleteUser  = id  =>{ setUsers(p=>p.filter(u=>u.id!==id)); toast.error('Employee removed'); };
  const importUsers = list=>{ setUsers(p=>[...p,...list]); toast.success(list.length+' employees imported'); };

  if(!currentUser) return <><Toaster position="bottom-right"/><LoginScreen users={users} onLogin={handleLogin}/></>;

  const meta=PAGE_META[activePage]||{title:'PerfManager Pro',subtitle:''};
  const primaryAction=activePage==='user-mgmt'&&can(currentUser.role,'addEmployee')&&!['add','edit'].includes(umView)
    ?{label:'Add Employee',onClick:()=>{setEditUser(null);setUmView('add');}}:null;

  const renderUM=()=>{
    if(umView==='overview') return <OverviewSection users={users} currentUser={currentUser}/>;
    if(umView==='list')     return <EmployeeList users={users} currentUser={currentUser} onEdit={u=>{setEditUser(u);setUmView('edit');}} onDelete={deleteUser}/>;
    if(umView==='add'||umView==='edit') return <EmployeeForm editUser={editUser} onSave={saveUser} onCancel={()=>{setUmView('list');setEditUser(null);}} currentUser={currentUser} existingUsers={users}/>;
    if(umView==='import') return <ImportExport users={users} onImport={importUsers}/>;
    if(umView==='roles'&&currentUser.role==='super_admin') return <RoleManagement users={users} onUpdate={saveUser}/>;
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
