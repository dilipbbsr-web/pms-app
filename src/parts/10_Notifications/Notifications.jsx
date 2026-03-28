/**
 * parts/10_Notifications/Notifications.jsx
 * Part 10 — Notification System
 * Real-time alerts for: goal submissions, approvals, task assignments,
 * appraisal completions, KPI entries, system messages.
 */
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, BellOff, ChevronDown, ChevronUp,
         Target, Award, CheckSquare, BarChart2, GitBranch, Users, Info } from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { Storage } from '@utils/storage';
import { Avatar, Badge } from '@components/common';

const TYPE_META = {
  goal_submitted:   { icon:<Target size={14}/>,     color:'#3B82F6', label:'Goal Submitted'    },
  goal_approved:    { icon:<Target size={14}/>,     color:'#10B981', label:'Goal Approved'     },
  goal_rejected:    { icon:<Target size={14}/>,     color:'#EF4444', label:'Goal Rejected'     },
  task_assigned:    { icon:<CheckSquare size={14}/>,color:'#F59E0B', label:'Task Assigned'     },
  task_completed:   { icon:<CheckSquare size={14}/>,color:'#10B981', label:'Task Completed'    },
  kpi_added:        { icon:<BarChart2 size={14}/>,  color:'#F97316', label:'KPI Entry'         },
  appraisal_done:   { icon:<Award size={14}/>,      color:'#8B5CF6', label:'Appraisal Done'    },
  approval_action:  { icon:<GitBranch size={14}/>,  color:'#14B8A6', label:'Approval Action'   },
  system:           { icon:<Info size={14}/>,        color:'#64748B', label:'System'            },
};

// Generate notifications from stored data
function buildNotifications(goals, kpis, appraisals, tasks, approvals, users, currentUser) {
  const notifs = [];
  const getUser = id => users.find(u => u.id === id);
  const now = Date.now();

  // Goal submissions (visible to admins)
  if (['super_admin','admin'].includes(currentUser.role)) {
    goals.filter(g => g.status === 'submitted').forEach(g => {
      const u = getUser(g.employeeId);
      notifs.push({
        id: `notif-goal-${g.id}`, type:'goal_submitted',
        title: 'Goal Submitted for Approval',
        message: `${u?.name || 'An employee'} submitted "${g.title}" for L1 approval`,
        employeeId: g.employeeId,
        time: g.updatedAt || g.createdAt,
        read: false, priority:'medium',
      });
    });
  }

  // Goal approvals/rejections (visible to goal owner)
  goals.filter(g => g.employeeId === currentUser.id && ['approved','rejected','completed'].includes(g.status)).forEach(g => {
    notifs.push({
      id: `notif-apr-${g.id}`, type: g.status==='rejected'?'goal_rejected':'goal_approved',
      title: g.status==='rejected' ? 'Goal Rejected' : 'Goal Approved',
      message: `Your goal "${g.title}" was ${g.status}`,
      employeeId: g.employeeId,
      time: g.updatedAt || g.createdAt,
      read: false, priority: g.status==='rejected'?'high':'low',
    });
  });

  // Task assignments (visible to assignee)
  tasks.filter(t => t.assigneeId === currentUser.id).forEach(t => {
    const mgr = getUser(t.assignedBy);
    notifs.push({
      id: `notif-task-${t.id}`, type:'task_assigned',
      title: 'New Task Assigned',
      message: `${mgr?.name || 'A manager'} assigned "${t.title}" to you — due ${t.dueDate || 'no date'}`,
      employeeId: t.assignedBy,
      time: t.createdAt,
      read: false, priority: t.priority==='high'?'high':'medium',
    });
  });

  // Completed tasks (visible to assigner)
  tasks.filter(t => t.assignedBy === currentUser.id && t.status==='completed').forEach(t => {
    const emp = getUser(t.assigneeId);
    notifs.push({
      id: `notif-done-${t.id}`, type:'task_completed',
      title: 'Task Completed',
      message: `${emp?.name || 'Employee'} completed "${t.title}"`,
      employeeId: t.assigneeId,
      time: t.updatedAt || t.createdAt,
      read: false, priority:'low',
    });
  });

  // Appraisals received (visible to employee)
  appraisals.filter(a => a.employeeId === currentUser.id).forEach(a => {
    const mgr = getUser(a.conductedBy);
    notifs.push({
      id: `notif-apr2-${a.id}`, type:'appraisal_done',
      title: 'Appraisal Received',
      message: `${mgr?.name || 'Your manager'} submitted your appraisal for ${a.period} — Score: ${a.overallScore?.toFixed(2) || '—'}/5`,
      employeeId: a.conductedBy,
      time: a.createdAt,
      read: false, priority:'medium',
    });
  });

  // System welcome
  notifs.push({
    id: 'notif-sys-welcome', type:'system',
    title: 'Welcome to PerfManager Pro',
    message: 'All 11 modules are active. Start by setting your goals for this cycle.',
    time: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    read: true, priority:'low',
  });

  // Sort by time desc, deduplicate
  return notifs.sort((a,b) => new Date(b.time) - new Date(a.time));
}

export default function Notifications({ users, currentUser }) {
  const [notifs,   setNotifs]   = useState([]);
  const [filterT,  setFilterT]  = useState('all');
  const [readOnly, setReadOnly] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const goals      = Storage.getGoals();
    const kpis       = Storage.getKPIs();
    const appraisals = Storage.getAppraisals();
    const tasks      = Storage.getTasks();
    const approvals  = Storage.getApprovals();
    setNotifs(buildNotifications(goals, kpis, appraisals, tasks, approvals, users, currentUser));
  }, []);

  const markRead    = id  => setNotifs(p => p.map(n => n.id===id ? {...n,read:true} : n));
  const markAllRead = ()  => setNotifs(p => p.map(n => ({...n,read:true})));
  const deleteNotif = id  => setNotifs(p => p.filter(n => n.id!==id));
  const clearAll    = ()  => setNotifs([]);
  const toggle      = id  => setExpanded(p => ({...p,[id]:!p[id]}));

  const TYPES = ['all','goal_submitted','goal_approved','goal_rejected','task_assigned','task_completed','appraisal_done','system'];

  const filtered = notifs.filter(n =>
    (!readOnly || !n.read) &&
    (filterT==='all' || n.type===filterT)
  );
  const unread = notifs.filter(n=>!n.read).length;

  const getUser = id => users.find(u => u.id === id);

  const timeAgo = (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff/60000);
    const hours = Math.floor(diff/3600000);
    const days  = Math.floor(diff/86400000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24)return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Bell size={18} color={C.accent}/>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:700 }}>Notifications</h2>
          {unread > 0 && <span style={{ background:C.red, color:'#fff', borderRadius:99, fontSize:11, fontWeight:700, padding:'2px 8px' }}>{unread} new</span>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setReadOnly(r=>!r)}
            style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${readOnly?C.accent:C.border}`, background:readOnly?`${C.accent}15`:'none', color:readOnly?C.accent:C.muted, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <BellOff size={13}/> {readOnly?'Show All':'Unread Only'}
          </button>
          {unread>0 && (
            <button onClick={markAllRead}
              style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${C.green}40`, background:`${C.green}12`, color:C.green, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <CheckCheck size={13}/> Mark All Read
            </button>
          )}
          <button onClick={clearAll}
            style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${C.red}40`, background:`${C.red}12`, color:C.red, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Trash2 size={13}/> Clear All
          </button>
        </div>
      </div>

      {/* Type filter pills */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {TYPES.map(t => {
          const meta  = TYPE_META[t];
          const count = t==='all' ? notifs.length : notifs.filter(n=>n.type===t).length;
          if (count===0 && t!=='all') return null;
          return (
            <button key={t} onClick={() => setFilterT(t)}
              style={{ padding:'5px 12px', borderRadius:99, border:`1px solid ${filterT===t?(meta?.color||C.accent):C.border}`, background:filterT===t?`${meta?.color||C.accent}18`:'none', color:filterT===t?(meta?.color||C.accent):C.muted, fontSize:11, fontWeight:filterT===t?600:400, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              {meta?.icon}{t==='all'?`All (${count})`:meta?.label}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
          <div style={{ fontSize:44, opacity:0.2, marginBottom:12 }}>🔔</div>
          <p style={{ fontSize:14 }}>No notifications to show</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            const emp  = n.employeeId ? getUser(n.employeeId) : null;
            const open = expanded[n.id];
            return (
              <div key={n.id}
                style={{ background:n.read?C.surface:C.card, border:`1px solid ${n.read?C.border:meta.color+'40'}`, borderRadius:12, borderLeft:`4px solid ${n.read?C.faint:meta.color}`, cursor:'pointer', transition:'all .15s' }}
                onClick={() => { toggle(n.id); if(!n.read) markRead(n.id); }}>
                <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  {/* Icon */}
                  <div style={{ width:34, height:34, borderRadius:10, background:`${meta.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:meta.color, flexShrink:0 }}>
                    {meta.icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ fontSize:13, fontWeight:n.read?500:700, color:C.text }}>{n.title}</p>
                      {!n.read && <span style={{ width:7, height:7, borderRadius:'50%', background:meta.color, flexShrink:0 }}/>}
                      <Badge label={meta.label} color={meta.color}/>
                      {n.priority==='high' && <Badge label="High Priority" color={C.red}/>}
                    </div>
                    <p style={{ fontSize:12, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:open?'normal':'nowrap' }}>{n.message}</p>
                  </div>
                  {/* Right */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                    <span style={{ fontSize:11, color:C.muted, whiteSpace:'nowrap' }}>{timeAgo(n.time)}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={e=>{e.stopPropagation();deleteNotif(n.id);}}
                        style={{ width:24, height:24, borderRadius:6, border:`1px solid ${C.border}`, background:'none', color:C.muted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Trash2 size={11}/>
                      </button>
                      {open ? <ChevronUp size={13} color={C.muted}/> : <ChevronDown size={13} color={C.muted}/>}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {open && emp && (
                  <div style={{ padding:'8px 16px 12px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
                    <Avatar name={emp.name} size={24} bg={ROLE_COLORS[emp.role]}/>
                    <span style={{ fontSize:11, color:C.muted }}>{emp.name} · {emp.designation} · {emp.dept}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
