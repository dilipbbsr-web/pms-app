/**
 * parts/08_Dashboard/OrgOverview.jsx
 * Org-wide infographic overview:
 * Hero metric cards, headcount ring, activity feed, quick stats.
 */
import { useState, useEffect } from 'react';
import { Users, Target, CheckSquare, Award, TrendingUp, TrendingDown, Activity, Clock, ArrowUpRight, BarChart2 } from 'lucide-react';
import { C, DEPT_COLORS, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar, Badge } from '@components/common';

export default function OrgOverview({ users, goals, kpis, appraisals, tasks, approvals, currentUser }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  // Metrics
  const activeUsers   = users.filter(u => u.status === 'active').length;
  const totalGoals    = goals.length;
  const completedGoals= goals.filter(g => g.status === 'completed').length;
  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter(t => t.status === 'completed').length;
  const avgRating     = kpis.length ? (kpis.reduce((s,k) => s+(k.rating||0), 0)/kpis.length).toFixed(1) : '—';
  const pendingApprovals = goals.filter(g => g.status === 'submitted').length + appraisals.filter(a => a.status === 'submitted').length;

  const goalRate = totalGoals ? Math.round((completedGoals/totalGoals)*100) : 0;
  const taskRate = totalTasks ? Math.round((doneTasks/totalTasks)*100)      : 0;

  // Dept headcount
  const deptData = DEPARTMENTS.map(d => ({
    dept: d, count: users.filter(u => u.dept === d).length, color: DEPT_COLORS[d] || C.accent,
  }));
  const maxCount = Math.max(...deptData.map(d => d.count), 1);

  // Recent activity
  const recentGoals = [...goals].sort((a,b) => new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)).slice(0,4);
  const getUser = id => users.find(u => u.id === id);

  const STATUS_COLORS = { draft:C.muted, submitted:C.blue, approved:C.teal||C.blue, completed:C.green, rejected:C.red, l2approved:C.purple };

  return (
    <div>
      {/* Welcome */}
      <div style={{ background:`linear-gradient(135deg,${C.card} 0%,#1a2540 100%)`, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 28px', marginBottom:24, borderLeft:`4px solid ${C.accent}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:20, fontWeight:800, color:C.text }}>
            Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'}, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
            <p style={{ fontSize:11, color:C.muted }}>Your Role</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.accent }}>{currentUser.role==='super_admin'?'Super Admin':currentUser.role==='admin'?'Admin':'Employee'}</p>
          </div>
          <div style={{ background:`${C.blue}15`, border:`1px solid ${C.blue}35`, borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
            <p style={{ fontSize:11, color:C.muted }}>Department</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.blue }}>{currentUser.dept}</p>
          </div>
          {pendingApprovals > 0 && (
            <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}35`, borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
              <p style={{ fontSize:11, color:C.muted }}>Pending Reviews</p>
              <p style={{ fontSize:13, fontWeight:700, color:C.red }}>{pendingApprovals}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hero metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:16, marginBottom:24 }}>
        {[
          { icon:<Users size={18}/>,     label:'Active Employees', val:activeUsers,       sub:`of ${users.length} total`,     color:C.blue,   trend:'+2 this month'  },
          { icon:<Target size={18}/>,    label:'Goal Completion',  val:`${goalRate}%`,    sub:`${completedGoals}/${totalGoals} goals`,    color:C.green,  trend:goalRate>=70?'On track':'Below target' },
          { icon:<CheckSquare size={18}/>,label:'Task Done Rate',  val:`${taskRate}%`,    sub:`${doneTasks}/${totalTasks} tasks`,          color:C.accent, trend:taskRate>=70?'On track':'Needs attention' },
          { icon:<Award size={18}/>,     label:'Avg KPI Rating',   val:avgRating,         sub:`across ${kpis.length} entries`,            color:RATING_COLORS[Math.round(parseFloat(avgRating))]||C.muted, trend:'Score /5.0' },
          { icon:<BarChart2 size={18}/>, label:'Appraisals Done',  val:appraisals.length, sub:`${appraisals.filter(a=>a.status==='finalized').length} finalized`, color:C.purple, trend:'This cycle' },
        ].map(({ icon, label, val, sub, color, trend }) => (
          <MetricCard key={label} icon={icon} label={label} val={val} sub={sub} color={color} trend={trend} animated={animated}/>
        ))}
      </div>

      {/* Main grid: dept chart + activity */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Department headcount bars */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <Users size={15} color={C.accent}/>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700 }}>Headcount by Department</h3>
          </div>
          {deptData.map(({ dept, count, color }) => (
            <div key={dept} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{dept}</span>
                <span style={{ fontSize:12, fontWeight:700, color, background:`${color}18`, padding:'1px 8px', borderRadius:99 }}>{count}</span>
              </div>
              <div style={{ height:8, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${color},${color}88)`,
                  width: animated ? `${(count/maxCount)*100}%` : '0%',
                  transition:'width .9s cubic-bezier(0.34,1.56,0.64,1)',
                }}/>
              </div>
            </div>
          ))}
          {/* Distribution strip */}
          <div style={{ height:10, borderRadius:99, overflow:'hidden', display:'flex', marginTop:18, gap:1 }}>
            {deptData.map(({ dept, count, color }) => (
              <div key={dept} title={`${dept}: ${count}`}
                style={{ flex:count||0.5, background:color, transition:'flex .8s ease', minWidth:4 }}/>
            ))}
          </div>
        </div>

        {/* Recent activity feed */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <Activity size={15} color={C.blue}/>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700 }}>Recent Activity</h3>
          </div>
          {recentGoals.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:20 }}>No activity yet</p>
          ) : recentGoals.map(g => {
            const emp = getUser(g.employeeId);
            const sc  = STATUS_COLORS[g.status] || C.muted;
            return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                {emp && <Avatar name={emp.name} size={30} bg={ROLE_COLORS[emp.role]}/>}
                <div style={{ flex:1, overflow:'hidden' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.title}</p>
                  <p style={{ fontSize:10, color:C.muted }}>{emp?.name} · {emp?.dept}</p>
                </div>
                <Badge label={g.status} color={sc}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
        {[
          { label:'Submitted Goals',    val:goals.filter(g=>g.status==='submitted').length,    color:C.blue   },
          { label:'Approved Goals',     val:goals.filter(g=>['approved','l2approved','completed'].includes(g.status)).length, color:C.green },
          { label:'Rejected Goals',     val:goals.filter(g=>g.status==='rejected').length,     color:C.red    },
          { label:'Tasks Overdue',      val:tasks.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&t.status!=='completed').length, color:C.red },
          { label:'KPIs ≥ Target',      val:kpis.filter(k=>(k.achievement||0)>=100).length,   color:C.green  },
          { label:'Approvals Pending',  val:pendingApprovals,                                   color:C.accent },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', textAlign:'center', borderTop:`2px solid ${color}` }}>
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:22, fontWeight:800, color }}>{val}</p>
            <p style={{ fontSize:11, color:C.muted, marginTop:3 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, val, sub, color, trend, animated }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseOver={()=>setH(true)} onMouseOut={()=>setH(false)}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px',
        borderTop:`3px solid ${color}`, transition:'transform .2s, box-shadow .2s',
        transform:h?'translateY(-3px)':'none', boxShadow:h?`0 8px 28px ${color}20`:'none' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:11, color:C.muted, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
        <div style={{ width:34, height:34, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
      </div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:28, fontWeight:800, color:C.text }}>{val}</p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
        <p style={{ fontSize:11, color:C.muted }}>{sub}</p>
        <span style={{ fontSize:10, color, background:`${color}15`, padding:'2px 7px', borderRadius:99, fontWeight:600 }}>{trend}</span>
      </div>
    </div>
  );
}
