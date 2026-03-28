/**
 * parts/08_Dashboard/GoalInsights.jsx
 * Goal funnel: Draft → Submitted → Approved → Completed
 * Plus category breakdown, priority distribution, dept goal counts.
 */
import { useState, useEffect } from 'react';
import { C, DEPT_COLORS, PRIORITY_COLORS, ROLE_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar } from '@components/common';

const FUNNEL = [
  { status:'draft',      label:'Draft',       color:'#64748B' },
  { status:'submitted',  label:'Submitted',   color:'#3B82F6' },
  { status:'approved',   label:'L1 Approved', color:'#14B8A6' },
  { status:'l2approved', label:'L2 Approved', color:'#8B5CF6' },
  { status:'completed',  label:'Completed',   color:'#10B981' },
  { status:'rejected',   label:'Rejected',    color:'#EF4444' },
];

export default function GoalInsights({ users, goals, currentUser }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const total = goals.length;
  const maxCount = Math.max(...FUNNEL.map(f => goals.filter(g=>g.status===f.status).length), 1);

  // By category
  const categories = [...new Set(goals.map(g=>g.category).filter(Boolean))];
  const catCounts = categories.map(c => ({ cat:c, count:goals.filter(g=>g.category===c).length })).sort((a,b)=>b.count-a.count);

  // By dept
  const deptGoals = DEPARTMENTS.map(d => ({
    dept:d, count:goals.filter(g=>{ const u=users.find(u=>u.id===g.employeeId); return u&&u.dept===d; }).length, color:DEPT_COLORS[d]||C.accent
  }));
  const maxDeptGoals = Math.max(...deptGoals.map(d=>d.count), 1);

  // By priority
  const priorities = ['high','medium','low'];
  const priCounts = priorities.map(p => ({ p, count:goals.filter(g=>g.priority===p).length, color:PRIORITY_COLORS[p] }));

  const getUser = id => users.find(u=>u.id===id);

  return (
    <div>
      {/* Funnel */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, marginBottom:20 }}>
        <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:20 }}>
          Goal Pipeline Funnel — {total} total
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {FUNNEL.map(({ status, label, color }) => {
            const count = goals.filter(g=>g.status===status).length;
            const pct   = total ? Math.round((count/total)*100) : 0;
            const barW  = maxCount ? `${(count/maxCount)*100}%` : '0%';
            return (
              <div key={status} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ minWidth:100, fontSize:12, fontWeight:600, color }}>{label}</span>
                <div style={{ flex:1, height:28, background:C.faint, borderRadius:8, overflow:'hidden', position:'relative' }}>
                  <div style={{ height:'100%', borderRadius:8, background:`linear-gradient(90deg,${color},${color}88)`,
                    width: animated ? barW : '0%', transition:'width .9s cubic-bezier(0.34,1.56,0.64,1)',
                    display:'flex', alignItems:'center', paddingLeft:12 }}>
                    {count > 0 && animated && (
                      <span style={{ fontSize:12, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>{count} goal{count!==1?'s':''}</span>
                    )}
                  </div>
                </div>
                <span style={{ minWidth:36, fontSize:12, fontWeight:700, color, textAlign:'right' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {/* By Category */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:14 }}>By Category</h3>
          {catCounts.length === 0 ? <p style={{ color:C.muted, fontSize:12 }}>No data</p> :
          catCounts.map(({ cat, count }) => (
            <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.text }}>{cat}</span>
              <span style={{ fontSize:12, fontWeight:700, color:C.blue, background:`${C.blue}15`, padding:'1px 8px', borderRadius:99 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* By Priority */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:14 }}>By Priority</h3>
          {priCounts.map(({ p, count, color }) => {
            const pct = total ? Math.round((count/total)*100) : 0;
            return (
              <div key={p} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.text, textTransform:'capitalize', fontWeight:500 }}>{p}</span>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height:8, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:99, background:color,
                    width:animated?`${pct}%`:'0%', transition:'width .8s ease' }}/>
                </div>
              </div>
            );
          })}
          {/* Completion rate highlight */}
          <div style={{ marginTop:16, padding:'10px 12px', background:`${C.green}10`, borderRadius:10, border:`1px solid ${C.green}25` }}>
            <p style={{ fontSize:11, color:C.muted }}>Completion rate</p>
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:20, fontWeight:800, color:C.green }}>{total?Math.round((goals.filter(g=>g.status==='completed').length/total)*100):0}%</p>
          </div>
        </div>

        {/* Goals per dept */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:14 }}>Goals by Department</h3>
          {deptGoals.map(({ dept, count, color }) => (
            <div key={dept} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, color:C.text, fontWeight:500 }}>{dept.split(' ')[0]}</span>
                <span style={{ fontSize:11, fontWeight:700, color }}>{count}</span>
              </div>
              <div style={{ height:6, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:color,
                  width:animated?`${(count/maxDeptGoals)*100}%`:'0%', transition:'width .8s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
