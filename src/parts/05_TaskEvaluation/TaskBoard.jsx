/**
 * parts/05_TaskEvaluation/TaskBoard.jsx
 * Kanban board — columns: To Do | In Progress | Completed | Overdue
 */
import { useState } from 'react';
import { C, ROLE_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { Avatar, Badge } from '@components/common';
import { Search } from 'lucide-react';

const COLUMNS = [
  { id:'todo',        label:'To Do',       color:'#64748B' },
  { id:'in-progress', label:'In Progress', color:'#3B82F6' },
  { id:'completed',   label:'Completed',   color:'#10B981' },
  { id:'overdue',     label:'Overdue',     color:'#EF4444' },
];

export default function TaskBoard({ tasks, currentUser, users, onUpdate }) {
  const [q, setQ] = useState('');

  const getUser = id => users.find(u=>u.id===id);
  const enriched = tasks.map(t=>{
    const isOverdue = t.dueDate && new Date(t.dueDate)<new Date() && t.status!=='completed';
    return {...t, col: isOverdue?'overdue':t.status};
  }).filter(t=>!q||t.title.toLowerCase().includes(q.toLowerCase())||(getUser(t.assigneeId)?.name||'').toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ position:'relative', marginBottom:16 }}>
        <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:C.muted }}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks or employees…"
          style={{ width:'100%', maxWidth:340, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px 8px 30px', color:C.text, fontSize:13, outline:'none' }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, overflowX:'auto' }}>
        {COLUMNS.map(col=>{
          const colTasks = enriched.filter(t=>t.col===col.id);
          return (
            <div key={col.id} style={{ background:C.surface, borderRadius:14, padding:'14px 12px', border:`1px solid ${C.border}`, borderTop:`3px solid ${col.color}`, minHeight:200 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:col.color }}>{col.label}</span>
                <span style={{ fontSize:11, background:`${col.color}20`, color:col.color, borderRadius:99, padding:'2px 9px', fontWeight:700 }}>{colTasks.length}</span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {colTasks.length===0 && <p style={{ fontSize:12, color:C.faint, textAlign:'center', padding:'20px 0' }}>—</p>}
                {colTasks.map(task=>{
                  const assignee = getUser(task.assigneeId);
                  const pct = task.progress||0;
                  return (
                    <div key={task.id} style={{ background:C.card, borderRadius:10, padding:'12px 12px', border:`1px solid ${C.border}`, cursor:'default' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]}/>
                        {task.dueDate && <span style={{ fontSize:10, color:C.muted }}>{task.dueDate}</span>}
                      </div>
                      <p style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:8, lineHeight:1.4 }}>{task.title}</p>

                      {/* Mini progress */}
                      <div style={{ height:4, background:C.faint, borderRadius:99, overflow:'hidden', marginBottom:8 }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:col.color, borderRadius:99 }}/>
                      </div>

                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        {assignee ? (
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <Avatar name={assignee.name} size={20} bg={ROLE_COLORS[assignee.role]}/>
                            <span style={{ fontSize:10, color:C.muted }}>{assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : <span/>}
                        <span style={{ fontSize:10, color:C.muted, background:C.faint, padding:'1px 7px', borderRadius:4 }}>{task.taskType?.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
