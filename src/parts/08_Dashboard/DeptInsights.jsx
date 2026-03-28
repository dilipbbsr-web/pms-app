/**
 * parts/08_Dashboard/DeptInsights.jsx
 * Department heatmap — headcount, goal rate, task rate, KPI avg per dept.
 */
import { useState, useEffect } from 'react';
import { C, DEPT_COLORS, RATING_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';

function score2color(val, max) {
  if (!val || !max) return C.faint;
  const pct = val / max;
  if (pct >= 0.8) return C.green;
  if (pct >= 0.6) return C.accent;
  if (pct >= 0.4) return '#F97316';
  return C.red;
}

export default function DeptInsights({ users, goals, kpis, tasks, appraisals }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);
  const getUser = id => users.find(u => u.id === id);

  const rows = DEPARTMENTS.map(dept => {
    const dUsers  = users.filter(u => u.dept === dept);
    const dGoals  = goals.filter(g => { const u=getUser(g.employeeId); return u&&u.dept===dept; });
    const dTasks  = tasks.filter(t => { const u=getUser(t.assigneeId); return u&&u.dept===dept; });
    const dKPIs   = kpis.filter(k  => { const u=getUser(k.employeeId); return u&&u.dept===dept; });
    const dAprs   = appraisals.filter(a => { const u=getUser(a.employeeId); return u&&u.dept===dept; });

    const goalRate   = dGoals.length  ? Math.round((dGoals.filter(g=>g.status==='completed').length/dGoals.length)*100) : null;
    const taskRate   = dTasks.length  ? Math.round((dTasks.filter(t=>t.status==='completed').length/dTasks.length)*100) : null;
    const kpiAvg     = dKPIs.length   ? parseFloat((dKPIs.reduce((s,k)=>s+(k.rating||0),0)/dKPIs.length).toFixed(1)) : null;
    const aprAvg     = dAprs.length   ? parseFloat((dAprs.reduce((s,a)=>s+(a.overallScore||0),0)/dAprs.length).toFixed(1)) : null;

    return { dept, headcount:dUsers.length, goalRate, taskRate, kpiAvg, aprAvg, color:DEPT_COLORS[dept]||C.accent };
  });

  const COLS = [
    { key:'headcount', label:'Headcount',    max:Math.max(...rows.map(r=>r.headcount),1), unit:''   },
    { key:'goalRate',  label:'Goal Rate',     max:100,                                      unit:'%'  },
    { key:'taskRate',  label:'Task Done',     max:100,                                      unit:'%'  },
    { key:'kpiAvg',    label:'KPI Avg',       max:5,                                        unit:'/5' },
    { key:'aprAvg',    label:'Appraisal Avg', max:5,                                        unit:'/5' },
  ];

  return (
    <div>
      {/* Heatmap table */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700 }}>Department Performance Heatmap</h3>
          <p style={{ fontSize:12, color:C.muted, marginTop:3 }}>Green = above 80% · Amber = 60–80% · Orange = 40–60% · Red = below 40%</p>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:C.surface }}>
                <th style={{ padding:'11px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px' }}>Department</th>
                {COLS.map(c=>(
                  <th key={c.key} style={{ padding:'11px 16px', textAlign:'center', fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.dept} style={{ borderTop:`1px solid ${C.border}`, background:i%2===0?C.card:C.surface }}>
                  <td style={{ padding:'13px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:row.color, flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{row.dept}</span>
                    </div>
                  </td>
                  {COLS.map(col => {
                    const val = row[col.key];
                    const bg  = val !== null ? score2color(val, col.max) : C.faint;
                    return (
                      <td key={col.key} style={{ padding:'13px 16px', textAlign:'center' }}>
                        {val !== null ? (
                          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', minWidth:70 }}>
                            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:800, color:bg }}>{val}{col.unit}</span>
                            <div style={{ width:48, height:4, background:C.faint, borderRadius:99, marginTop:4, overflow:'hidden' }}>
                              <div style={{ height:'100%', borderRadius:99, background:bg, width:animated?`${(val/col.max)*100}%`:'0%', transition:'width .8s ease' }}/>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color:C.faint, fontSize:12 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dept cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
        {rows.map(({ dept, headcount, goalRate, taskRate, kpiAvg, color }) => (
          <div key={dept} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 18px', borderTop:`3px solid ${color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <h4 style={{ fontSize:13, fontWeight:700, color:C.text }}>{dept}</h4>
                <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{headcount} employees</p>
              </div>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:24, fontWeight:800, color }}>{headcount}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Goals',    val:goalRate, unit:'%', color:goalRate>=70?C.green:C.accent },
                { label:'Tasks',    val:taskRate, unit:'%', color:taskRate>=70?C.green:C.accent },
                { label:'KPI Avg',  val:kpiAvg,   unit:'/5',color:kpiAvg?RATING_COLORS[Math.round(kpiAvg)]||C.muted:C.faint },
              ].map(({ label, val, unit, color:c }) => (
                <div key={label} style={{ background:C.surface, borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                  <p style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:800, color:val!==null?c:C.faint }}>{val !== null ? `${val}${unit}` : '—'}</p>
                  <p style={{ fontSize:10, color:C.muted, marginTop:2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
