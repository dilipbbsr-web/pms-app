/**
 * parts/08_Dashboard/PerfInsights.jsx
 * Performance analytics — KPI ratings distribution, appraisal scores by dept.
 */
import { useState, useEffect } from 'react';
import { C, DEPT_COLORS, RATING_COLORS, ROLE_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';
import { Avatar, Badge } from '@components/common';

const RATING_LABELS = { 5:'Outstanding', 4:'Exceeds', 3:'Meets', 2:'Below', 1:'Poor' };

export default function PerfInsights({ users, kpis, appraisals, currentUser }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  // KPI rating distribution
  const ratingDist = [5,4,3,2,1].map(r => ({
    rating: r, count: kpis.filter(k => k.rating === r).length, color: RATING_COLORS[r],
  }));
  const maxRatingCount = Math.max(...ratingDist.map(r => r.count), 1);

  // Average KPI rating per dept
  const deptKpiAvg = DEPARTMENTS.map(dept => {
    const deptKpis = kpis.filter(k => {
      const u = users.find(u => u.id === k.employeeId);
      return u && u.dept === dept;
    });
    const avg = deptKpis.length ? (deptKpis.reduce((s,k)=>s+(k.rating||0),0)/deptKpis.length).toFixed(1) : null;
    return { dept, avg: avg ? parseFloat(avg) : null, count: deptKpis.length, color: DEPT_COLORS[dept]||C.accent };
  });

  // Appraisal score distribution
  const aprDist = [5,4,3,2,1].map(r => ({
    rating: r, count: appraisals.filter(a => Math.round(a.overallScore||0)===r).length, color: RATING_COLORS[r],
  }));

  // Recent appraisals
  const recentAprs = [...appraisals].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  const getUser = id => users.find(u=>u.id===id);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* KPI Rating Distribution */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:20 }}>KPI Rating Distribution</h3>
          {kpis.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:20 }}>No KPI data yet</p>
          ) : ratingDist.map(({ rating, count, color }) => (
            <div key={rating} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ minWidth:80, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color }}>{'★'.repeat(rating)}</span>
              </div>
              <div style={{ flex:1, height:10, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:color,
                  width: animated ? `${(count/maxRatingCount)*100}%` : '0%',
                  transition:'width .8s ease' }}/>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color, minWidth:20, textAlign:'right' }}>{count}</span>
              <span style={{ fontSize:10, color:C.muted, minWidth:64 }}>{RATING_LABELS[rating]}</span>
            </div>
          ))}
          {kpis.length > 0 && (
            <div style={{ marginTop:16, padding:'10px 14px', background:C.surface, borderRadius:10, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:C.muted }}>Overall avg.</span>
              <span style={{ fontSize:14, fontWeight:800, fontFamily:'Outfit,sans-serif', color:RATING_COLORS[Math.round(kpis.reduce((s,k)=>s+(k.rating||0),0)/kpis.length)]||C.muted }}>
                {(kpis.reduce((s,k)=>s+(k.rating||0),0)/kpis.length).toFixed(2)} / 5
              </span>
            </div>
          )}
        </div>

        {/* Dept KPI Average */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:20 }}>Avg KPI Score by Department</h3>
          {deptKpiAvg.map(({ dept, avg, count, color }) => (
            <div key={dept} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{dept}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, color:C.muted }}>{count} KPIs</span>
                  <span style={{ fontSize:12, fontWeight:700, color:avg?RATING_COLORS[Math.round(avg)]||C.muted:C.faint }}>
                    {avg ? `${avg}/5` : '—'}
                  </span>
                </div>
              </div>
              <div style={{ height:8, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:avg?RATING_COLORS[Math.round(avg)]||color:C.faint,
                  width: animated && avg ? `${(avg/5)*100}%` : '0%',
                  transition:'width .8s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appraisal scores + Recent appraisals */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:18 }}>Appraisal Score Distribution</h3>
          {appraisals.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:20 }}>No appraisals yet</p>
          ) : aprDist.map(({ rating, count, color }) => (
            <div key={rating} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:11, color, minWidth:14, fontWeight:700 }}>{rating}</span>
              <div style={{ flex:1, height:8, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, background:color, width:animated?`${(count/Math.max(...aprDist.map(d=>d.count),1))*100}%`:'0%', transition:'width .8s ease' }}/>
              </div>
              <span style={{ fontSize:11, color, fontWeight:700 }}>{count}</span>
            </div>
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:18 }}>Recent Appraisals</h3>
          {recentAprs.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:20 }}>No appraisals recorded yet</p>
          ) : recentAprs.map(apr => {
            const emp = getUser(apr.employeeId);
            const mgr = getUser(apr.conductedBy);
            const score = apr.overallScore || 0;
            const rColor = RATING_COLORS[Math.round(score)] || C.muted;
            return (
              <div key={apr.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                {emp && <Avatar name={emp.name} size={32} bg={ROLE_COLORS[emp.role]}/>}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{emp?.name||'—'}</p>
                  <p style={{ fontSize:11, color:C.muted }}>{emp?.dept} · by {mgr?.name||'—'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:800, color:rColor }}>{score.toFixed(1)}</p>
                  <p style={{ fontSize:10, color:rColor }}>{apr.period}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
