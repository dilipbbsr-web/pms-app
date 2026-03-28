/**
 * parts/07_ApprovalWorkflow/ApprovalStats.jsx
 * Approval analytics — approval rate, avg turnaround, breakdowns by type/level.
 */
import { C, RATING_COLORS } from '@constants/theme';
import { EmptyState } from '@components/common';

const TYPE_COLORS  = { Goal:'#3B82F6', Appraisal:'#10B981', KPI:'#F97316', Task:'#8B5CF6' };
const LEVEL_COLORS = { L1:'#14B8A6', L2:'#8B5CF6', L3:'#F59E0B' };

export default function ApprovalStats({ log, users, currentUser }) {
  if (log.length === 0) return (
    <EmptyState icon="📊" title="No approval data yet" description="Stats will appear once approvals have been processed."/>
  );

  const total    = log.length;
  const approved = log.filter(l => l.action === 'approved').length;
  const rejected = log.filter(l => l.action === 'rejected').length;
  const approvalRate = total ? Math.round((approved/total)*100) : 0;

  // By type
  const byType = ['Goal','Appraisal','KPI','Task'].map(type => ({
    type,
    total:    log.filter(l=>l.itemType===type).length,
    approved: log.filter(l=>l.itemType===type&&l.action==='approved').length,
    rejected: log.filter(l=>l.itemType===type&&l.action==='rejected').length,
  })).filter(t=>t.total>0);

  // By level
  const byLevel = ['L1','L2','L3'].map(level => ({
    level,
    total:    log.filter(l=>l.level===level).length,
    approved: log.filter(l=>l.level===level&&l.action==='approved').length,
    rejected: log.filter(l=>l.level===level&&l.action==='rejected').length,
  })).filter(l=>l.total>0);

  // Top reviewers
  const reviewerMap = {};
  log.forEach(l => {
    const u = users.find(u=>u.id===l.reviewedBy);
    if (!u) return;
    if (!reviewerMap[u.id]) reviewerMap[u.id] = { name:u.name, designation:u.designation, count:0, approved:0, rejected:0 };
    reviewerMap[u.id].count++;
    reviewerMap[u.id][l.action]++;
  });
  const topReviewers = Object.values(reviewerMap).sort((a,b)=>b.count-a.count).slice(0,5);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label:'Total Reviews', val:total,       color:C.blue   },
          { label:'Approved',      val:approved,     color:C.green  },
          { label:'Rejected',      val:rejected,     color:C.red    },
          { label:'Approval Rate', val:`${approvalRate}%`, color:approvalRate>=80?C.green:approvalRate>=60?C.accent:C.red },
        ].map(({label,val,color})=>(
          <div key={label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', borderTop:`3px solid ${color}` }}>
            <p style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{label}</p>
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:28, fontWeight:800, color }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* By Type */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:16 }}>By Item Type</h3>
          {byType.map(({ type, total: t, approved: a, rejected: r }) => {
            const pct = t ? Math.round((a/t)*100) : 0;
            const color = TYPE_COLORS[type] || C.accent;
            return (
              <div key={type} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:13, color:C.text, fontWeight:500 }}>{type}</span>
                  <div style={{ display:'flex', gap:10, fontSize:11 }}>
                    <span style={{ color:C.green }}>✓ {a}</span>
                    <span style={{ color:C.red }}>✗ {r}</span>
                    <span style={{ color:color, fontWeight:700 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height:7, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width .6s ease' }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* By Level */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:16 }}>By Approval Level</h3>
          {byLevel.map(({ level, total: t, approved: a, rejected: r }) => {
            const pct   = t ? Math.round((a/t)*100) : 0;
            const color = LEVEL_COLORS[level] || C.muted;
            return (
              <div key={level} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:`${color}20`, color, border:`1px solid ${color}35` }}>{level}</span>
                    <span style={{ fontSize:12, color:C.muted }}>{t} reviews</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{pct}% approved</span>
                </div>
                <div style={{ height:8, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:99, overflow:'hidden', display:'flex' }}>
                    <div style={{ height:'100%', width:`${Math.round((a/t)*100)}%`, background:C.green, transition:'width .6s' }}/>
                    <div style={{ height:'100%', width:`${Math.round((r/t)*100)}%`, background:C.red }}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:14, marginTop:4, fontSize:10, color:C.muted }}>
                  <span style={{ color:C.green }}>■ Approved: {a}</span>
                  <span style={{ color:C.red }}>■ Rejected: {r}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top reviewers */}
      {topReviewers.length > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}` }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700 }}>Top Reviewers</h3>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:C.surface }}>
              {['Reviewer','Designation','Total','Approved','Rejected','Rate'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topReviewers.map((r,i)=>{
                const rate = r.count ? Math.round((r.approved/r.count)*100) : 0;
                const rColor = rate>=80?C.green:rate>=60?C.accent:C.red;
                return (
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}`, background:i%2===0?C.card:C.surface }}>
                    <td style={{ padding:'10px 16px', color:C.text, fontWeight:600 }}>{r.name}</td>
                    <td style={{ padding:'10px 16px', color:C.muted, fontSize:12 }}>{r.designation}</td>
                    <td style={{ padding:'10px 16px', fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:C.blue }}>{r.count}</td>
                    <td style={{ padding:'10px 16px', fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:C.green }}>{r.approved}</td>
                    <td style={{ padding:'10px 16px', fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:C.red }}>{r.rejected}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ fontSize:12, fontWeight:700, color:rColor, background:`${rColor}18`, padding:'3px 10px', borderRadius:99, border:`1px solid ${rColor}30` }}>{rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
