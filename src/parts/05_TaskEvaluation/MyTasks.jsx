/**
 * parts/05_TaskEvaluation/MyTasks.jsx
 * Employee view of assigned tasks — update status, log progress, view details.
 * managerView=true shows team tasks with delete capability.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Clock, Calendar, Flag, Tag, CheckCircle } from 'lucide-react';
import { C, ROLE_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { Avatar, Badge, ActionBtn, EmptyState } from '@components/common';

const STATUS_FLOW = { todo:'In Progress', 'in-progress':'Completed', completed:'todo' };
const STATUS_META = {
  'todo':        { label:'To Do',       color:'#64748B' },
  'in-progress': { label:'In Progress', color:'#3B82F6' },
  'completed':   { label:'Completed',   color:'#10B981' },
  'overdue':     { label:'Overdue',     color:'#EF4444' },
};

export default function MyTasks({ tasks, currentUser, users, onUpdate, onDelete, managerView=false }) {
  const [expanded, setExpanded] = useState({});
  const [filter,   setFilter]   = useState('all');
  const [progress, setProgress] = useState({});

  const toggle = id => setExpanded(p=>({...p,[id]:!p[id]}));
  const getUser = id => users.find(u=>u.id===id);

  // Mark overdue
  const enriched = tasks.map(t => {
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';
    return { ...t, displayStatus: isOverdue ? 'overdue' : t.status };
  });

  const filtered = filter==='all' ? enriched : enriched.filter(t=>t.displayStatus===filter);
  const counts   = ['todo','in-progress','completed','overdue'].reduce((a,s)=>({...a,[s]:enriched.filter(t=>t.displayStatus===s).length}),{});

  if (tasks.length===0) return (
    <EmptyState icon="✅" title={managerView?'No team tasks yet':'No tasks assigned yet'} description={managerView?'Assign tasks to your team members.':'Your manager has not assigned any tasks yet.'}/>
  );

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {Object.entries(STATUS_META).map(([s,meta])=>(
          counts[s]>0 && (
            <div key={s} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:meta.color }}/>
              <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{meta.label}</span>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:800, color:meta.color }}>{counts[s]}</span>
            </div>
          )
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {['all','todo','in-progress','completed','overdue'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ padding:'5px 14px', borderRadius:99, border:`1px solid ${filter===s?C.accent:C.border}`, background:filter===s?`${C.accent}18`:'none', color:filter===s?C.accent:C.muted, fontSize:12, fontWeight:filter===s?600:400, cursor:'pointer', textTransform:'capitalize' }}>
            {s==='all'?`All (${tasks.length})`:STATUS_META[s]?.label||s}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length===0 && <p style={{ color:C.muted, textAlign:'center', padding:32, fontSize:13 }}>No tasks in this status</p>}
        {filtered.map(task => {
          const meta   = STATUS_META[task.displayStatus] || STATUS_META.todo;
          const open   = expanded[task.id];
          const pct    = task.progress||0;
          const daysLeft = task.dueDate ? Math.ceil((new Date(task.dueDate)-new Date())/(1000*60*60*24)) : null;
          const assigner = getUser(task.assignedBy);
          const assignee = getUser(task.assigneeId);

          return (
            <div key={task.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', borderLeft:`4px solid ${meta.color}` }}>
              <div style={{ padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }} onClick={()=>toggle(task.id)}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <code style={{ fontSize:11, color:C.accent, background:`${C.accent}15`, padding:'2px 7px', borderRadius:4 }}>{task.id}</code>
                    <Badge label={meta.label} color={meta.color}/>
                    <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]}/>
                    <Badge label={task.taskType} color={C.blue}/>
                    {task.rating && <Badge label={`⭐ ${task.rating}/5`} color={C.green}/>}
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>{task.title}</p>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, color:C.muted }}>Progress</span>
                      <span style={{ fontSize:11, fontWeight:700, color:pct>=100?C.green:C.accent }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:C.faint, borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:pct>=100?C.green:`linear-gradient(90deg,${C.accent},${C.blue})`, borderRadius:99, transition:'width .4s ease' }}/>
                    </div>
                  </div>

                  {managerView && assignee && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                      <Avatar name={assignee.name} size={20} bg={ROLE_COLORS[assignee.role]}/>
                      <span style={{ fontSize:11, color:C.muted }}>{assignee.name} · {assignee.designation}</span>
                    </div>
                  )}
                </div>

                {/* Right side: due date + actions */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                  {daysLeft !== null && (
                    <span style={{ fontSize:11, color:daysLeft<0?C.red:daysLeft<=3?C.orange:C.muted, fontWeight:daysLeft<=3?600:400 }}>
                      {daysLeft<0?`${Math.abs(daysLeft)}d overdue`:daysLeft===0?'Due today':`${daysLeft}d left`}
                    </span>
                  )}
                  {task.estimatedHours && <span style={{ fontSize:11, color:C.muted }}>{task.estimatedHours}h est.</span>}
                  <div style={{ display:'flex', gap:4 }}>
                    {/* Status toggle */}
                    {task.displayStatus !== 'overdue' && (
                      <button onClick={e=>{ e.stopPropagation(); onUpdate(task.id,{status:STATUS_FLOW[task.status]||'todo', progress:STATUS_FLOW[task.status]==='Completed'?100:task.progress}); }}
                        style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.muted, fontSize:11, cursor:'pointer' }}>
                        → {STATUS_FLOW[task.status]||'Reopen'}
                      </button>
                    )}
                    {managerView && <ActionBtn icon={<Trash2 size={13}/>} color={C.red} title="Delete" onClick={e=>{e.stopPropagation();onDelete(task.id);}}/>}
                  </div>
                  {open ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div style={{ padding:'0 18px 16px', borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, paddingTop:12, marginBottom:12 }}>
                    {[
                      {label:'Assigned By', val:assigner?.name||'—'},
                      {label:'Due Date',    val:task.dueDate||'—'},
                      {label:'Est. Hours',  val:task.estimatedHours?`${task.estimatedHours}h`:'—'},
                      {label:'Linked Goal', val:task.linkedGoal||'—'},
                      {label:'Linked KPI',  val:task.linkedKPI||'—'},
                      {label:'Tags',        val:task.tags||'—'},
                    ].map(({label,val})=>(
                      <div key={label} style={{ background:C.surface, borderRadius:8, padding:'8px 12px' }}>
                        <p style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:2 }}>{label}</p>
                        <p style={{ fontSize:12, color:C.text, fontWeight:500 }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {task.description && (
                    <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, padding:'10px 12px', background:C.surface, borderRadius:8, marginBottom:10 }}>{task.description}</p>
                  )}

                  {/* Progress slider */}
                  {task.status !== 'completed' && (
                    <div style={{ background:`${C.accent}08`, border:`1px solid ${C.accent}25`, borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.accent }}>Update Progress</span>
                        <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>{progress[task.id]??pct}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={5} value={progress[task.id]??pct}
                        onChange={e=>setProgress(p=>({...p,[task.id]:Number(e.target.value)}))}
                        style={{ width:'100%', marginBottom:8 }}/>
                      <button onClick={()=>{ onUpdate(task.id,{progress:progress[task.id]??pct}); }}
                        style={{ padding:'6px 14px', borderRadius:8, border:'none', background:C.accent, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Save Progress
                      </button>
                    </div>
                  )}

                  {task.evalComment && (
                    <div style={{ marginTop:10, padding:'10px 14px', background:`${C.green}10`, borderRadius:10, border:`1px solid ${C.green}30` }}>
                      <p style={{ fontSize:11, color:C.green, fontWeight:600, marginBottom:3 }}>Manager Feedback</p>
                      <p style={{ fontSize:13, color:C.text }}>{task.evalComment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
