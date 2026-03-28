/**
 * parts/05_TaskEvaluation/TaskEval.jsx
 * Manager evaluation of completed tasks — star rating + feedback comment.
 */
import { useState } from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { C, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const RATING_LABELS = { 5:'Outstanding', 4:'Exceeds Expectations', 3:'Meets Expectations', 2:'Below Expectations', 1:'Needs Improvement' };

export default function TaskEval({ tasks, users, currentUser, onEval }) {
  const [ratings,  setRatings]  = useState({});
  const [comments, setComments] = useState({});
  const [done,     setDone]     = useState({});

  const getUser = id => users.find(u=>u.id===id);

  if (tasks.length===0) return (
    <EmptyState icon="⭐" title="No pending evaluations" description="All completed tasks have been evaluated."/>
  );

  const submitEval = (task) => {
    const rating = ratings[task.id];
    if (!rating) { alert('Please select a rating (1–5)'); return; }
    onEval(task.id, { rating, evalComment:comments[task.id]||'', evaluatedBy:currentUser.id, evaluatedAt:new Date().toISOString() });
    setDone(p=>({...p,[task.id]:true}));
  };

  return (
    <div>
      <p style={{ fontSize:13, color:C.muted, marginBottom:16 }}>
        {tasks.length} task{tasks.length!==1?'s':''} awaiting evaluation
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {tasks.map(task=>{
          const assignee  = getUser(task.assigneeId);
          const r         = ratings[task.id]||0;
          const rColor    = RATING_COLORS[r]||C.muted;
          const submitted = done[task.id];

          return (
            <div key={task.id} style={{ background:C.card, border:`1px solid ${submitted?C.green:C.border}`, borderRadius:14, padding:'18px 20px', borderLeft:`4px solid ${submitted?C.green:C.accent}` }}>
              {submitted ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, color:C.green }}>
                  <CheckCircle size={18}/>
                  <p style={{ fontSize:14, fontWeight:600 }}>Evaluated — {RATING_LABELS[ratings[task.id]]} ({ratings[task.id]}/5)</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:7, marginBottom:6, flexWrap:'wrap' }}>
                        <code style={{ fontSize:11, color:C.accent, background:`${C.accent}15`, padding:'2px 7px', borderRadius:4 }}>{task.id}</code>
                        <Badge label={task.taskType} color={C.blue}/>
                        {task.estimatedHours && <Badge label={`${task.estimatedHours}h est.`} color={C.muted}/>}
                      </div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.text }}>{task.title}</p>
                      {task.description && <p style={{ fontSize:12, color:C.muted, marginTop:4, lineHeight:1.5 }}>{task.description}</p>}
                    </div>
                    {assignee && (
                      <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface, borderRadius:10, padding:'8px 12px', flexShrink:0 }}>
                        <Avatar name={assignee.name} size={30} bg={ROLE_COLORS[assignee.role]}/>
                        <div>
                          <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{assignee.name}</p>
                          <p style={{ fontSize:10, color:C.muted }}>{assignee.designation}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Star rating */}
                  <div style={{ marginBottom:14 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.4px' }}>Performance Rating <span style={{color:C.red}}>*</span></p>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setRatings(p=>({...p,[task.id]:n}))} type="button"
                          style={{ width:38, height:38, borderRadius:10, border:`1px solid ${r>=n?RATING_COLORS[n]:C.border}`, background:r>=n?`${RATING_COLORS[n]}20`:'none', color:r>=n?RATING_COLORS[n]:C.faint, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', fontSize:16 }}>
                          ★
                        </button>
                      ))}
                      {r>0 && (
                        <div style={{ marginLeft:8, padding:'4px 12px', borderRadius:99, background:`${rColor}18`, border:`1px solid ${rColor}35` }}>
                          <span style={{ fontSize:12, fontWeight:700, color:rColor }}>{r}/5 — {RATING_LABELS[r]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
                      <MessageSquare size={12}/> Feedback Comment
                    </label>
                    <textarea value={comments[task.id]||''} onChange={e=>setComments(p=>({...p,[task.id]:e.target.value}))} rows={2}
                      placeholder="Provide specific feedback on quality, timeliness, and areas for improvement…"
                      style={{ width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:13, resize:'none', outline:'none', fontFamily:'"DM Sans",sans-serif' }}
                      onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
                  </div>

                  {/* Submit */}
                  <button onClick={()=>submitEval(task)}
                    style={{ padding:'9px 22px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.green},#059669)`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle size={14}/> Submit Evaluation
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
