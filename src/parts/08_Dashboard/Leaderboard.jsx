/**
 * parts/08_Dashboard/Leaderboard.jsx
 * Employee performance leaderboard — ranked by composite score:
 * KPI average (40%) + Goal completion (30%) + Task rate (20%) + Appraisal (10%)
 */
import { useState } from 'react';
import { Trophy, Medal, Award, Filter } from 'lucide-react';
import { C, DEPT_COLORS, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar, Badge } from '@components/common';

function computeScore(userId, goals, kpis, tasks, appraisals) {
  const myGoals = goals.filter(g => g.employeeId === userId);
  const myKPIs  = kpis.filter(k  => k.employeeId === userId);
  const myTasks = tasks.filter(t => t.assigneeId  === userId);
  const myAprs  = appraisals.filter(a => a.employeeId === userId);

  const kpiAvg   = myKPIs.length  ? myKPIs.reduce((s,k)=>s+(k.rating||0),0)/myKPIs.length : 0;
  const goalRate = myGoals.length ? (myGoals.filter(g=>g.status==='completed').length/myGoals.length)*5 : 0;
  const taskRate = myTasks.length ? (myTasks.filter(t=>t.status==='completed').length/myTasks.length)*5 : 0;
  const aprAvg   = myAprs.length  ? myAprs.reduce((s,a)=>s+(a.overallScore||0),0)/myAprs.length : 0;

  const composite = (kpiAvg*0.4) + (goalRate*0.3) + (taskRate*0.2) + (aprAvg*0.1);
  return {
    composite: parseFloat(composite.toFixed(2)),
    kpiAvg:    parseFloat(kpiAvg.toFixed(2)),
    goalRate:  myGoals.length ? Math.round((myGoals.filter(g=>g.status==='completed').length/myGoals.length)*100) : null,
    taskRate:  myTasks.length ? Math.round((myTasks.filter(t=>t.status==='completed').length/myTasks.length)*100) : null,
    aprAvg:    myAprs.length  ? parseFloat(aprAvg.toFixed(2)) : null,
    kpiCount:  myKPIs.length,
    goalCount: myGoals.length,
    taskCount: myTasks.length,
    aprCount:  myAprs.length,
  };
}

const RANK_ICONS = { 1:'🥇', 2:'🥈', 3:'🥉' };

export default function Leaderboard({ users, goals, kpis, tasks, appraisals, currentUser }) {
  const [deptF, setDeptF] = useState('');
  const [top,   setTop]   = useState(10);

  const ranked = users
    .filter(u => u.status === 'active' && (!deptF || u.dept === deptF))
    .map(u => ({ ...u, scores: computeScore(u.id, goals, kpis, tasks, appraisals) }))
    .sort((a,b) => b.scores.composite - a.scores.composite)
    .slice(0, top);

  const maxScore = Math.max(...ranked.map(r => r.scores.composite), 1);

  return (
    <div>
      {/* Header + filters */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Trophy size={18} color={C.accent}/>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700 }}>Performance Leaderboard</h3>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <select value={deptF} onChange={e=>setDeptF(e.target.value)}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 12px', color:deptF?C.text:C.muted, fontSize:12, outline:'none' }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <select value={top} onChange={e=>setTop(Number(e.target.value))}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 12px', color:C.text, fontSize:12, outline:'none' }}>
            {[5,10,20,50].map(n=><option key={n} value={n}>Top {n}</option>)}
          </select>
        </div>
      </div>

      {/* Scoring explanation */}
      <div style={{ background:`${C.blue}10`, border:`1px solid ${C.blue}25`, borderRadius:12, padding:'10px 16px', marginBottom:20, display:'flex', gap:20, flexWrap:'wrap' }}>
        {[
          { label:'KPI Average',         weight:'40%', color:C.blue   },
          { label:'Goal Completion',      weight:'30%', color:C.green  },
          { label:'Task Completion',      weight:'20%', color:C.accent },
          { label:'Appraisal Score',      weight:'10%', color:C.purple },
        ].map(({ label, weight, color }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:color }}/>
            <span style={{ fontSize:11, color:C.muted }}>{label}</span>
            <span style={{ fontSize:11, fontWeight:700, color }}>{weight}</span>
          </div>
        ))}
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:28, alignItems:'flex-end' }}>
          {[ranked[1], ranked[0], ranked[2]].map((emp, idx) => {
            const rank  = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const heights = { 1:120, 2:90, 3:75 };
            const color = DEPT_COLORS[emp.dept] || C.accent;
            return (
              <div key={emp.id} style={{ textAlign:'center', flex:1, maxWidth:160 }}>
                <div style={{ marginBottom:8 }}>
                  <Avatar name={emp.name} size={rank===1?52:40} bg={ROLE_COLORS[emp.role]}/>
                  <p style={{ fontSize:rank===1?14:12, fontWeight:700, color:C.text, marginTop:6 }}>{emp.name.split(' ')[0]}</p>
                  <p style={{ fontSize:10, color:C.muted }}>{emp.designation}</p>
                  <p style={{ fontFamily:'Outfit,sans-serif', fontSize:rank===1?20:16, fontWeight:800, color, marginTop:4 }}>{emp.scores.composite.toFixed(2)}</p>
                </div>
                <div style={{ height:heights[rank], background:`linear-gradient(180deg,${color}40,${color}20)`, borderRadius:'10px 10px 0 0', border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:28 }}>{RANK_ICONS[rank]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranked table */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:C.surface, borderBottom:`1px solid ${C.border}` }}>
              {['Rank','Employee','Dept','Score','KPI Avg','Goals','Tasks','Appraisal'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 && (
              <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:C.muted }}>No active employees to rank</td></tr>
            )}
            {ranked.map((emp, i) => {
              const rank    = i + 1;
              const s       = emp.scores;
              const sColor  = s.composite >= 4 ? C.green : s.composite >= 3 ? C.accent : s.composite >= 2 ? '#F97316' : C.red;
              const isMe    = emp.id === currentUser.id;
              return (
                <tr key={emp.id} style={{ borderBottom:`1px solid ${C.border}`, background:isMe?`${C.accent}08`:i%2===0?C.card:C.surface }}
                  onMouseOver={e=>e.currentTarget.style.background=`${C.accent}09`}
                  onMouseOut={e=>e.currentTarget.style.background=isMe?`${C.accent}08`:i%2===0?C.card:C.surface}>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {rank <= 3 ? (
                        <span style={{ fontSize:18 }}>{RANK_ICONS[rank]}</span>
                      ) : (
                        <span style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, color:C.muted, minWidth:24, textAlign:'center' }}>{rank}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={emp.name} size={30} bg={ROLE_COLORS[emp.role]}/>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{emp.name}{isMe && <span style={{ color:C.accent, marginLeft:4, fontSize:10 }}>● You</span>}</p>
                        <p style={{ fontSize:10, color:C.muted }}>{emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:11, color:DEPT_COLORS[emp.dept]||C.muted, fontWeight:600 }}>{emp.dept.split(' ')[0]}</span>
                  </td>
                  {/* Score bar */}
                  <td style={{ padding:'12px 14px', minWidth:130 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ flex:1, height:6, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99, background:sColor, width:`${(s.composite/maxScore)*100}%`, transition:'width .6s ease' }}/>
                      </div>
                      <span style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:800, color:sColor, minWidth:28 }}>{s.composite.toFixed(1)}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:RATING_COLORS[Math.round(s.kpiAvg)]||C.muted }}>{s.kpiAvg > 0 ? `${s.kpiAvg}/5` : '—'}</span>
                    {s.kpiCount > 0 && <span style={{ fontSize:10, color:C.faint, marginLeft:4 }}>({s.kpiCount})</span>}
                  </td>
                  <td style={{ padding:'12px 14px', color:s.goalRate!==null?C.text:C.faint, fontSize:12 }}>{s.goalRate !== null ? `${s.goalRate}%` : '—'}</td>
                  <td style={{ padding:'12px 14px', color:s.taskRate!==null?C.text:C.faint, fontSize:12 }}>{s.taskRate !== null ? `${s.taskRate}%` : '—'}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:s.aprAvg?RATING_COLORS[Math.round(s.aprAvg)]||C.muted:C.faint }}>{s.aprAvg ? `${s.aprAvg}/5` : '—'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
