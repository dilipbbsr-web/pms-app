/**
 * parts/05_TaskEvaluation/AssignTask.jsx
 */
import { useState } from 'react';
import { ClipboardList, User, Calendar, Clock, Flag, Tag, Hash, Save, X } from 'lucide-react';
import { C, ROLE_COLORS, PRIORITY_COLORS } from '@constants/theme';
import { InputField, Avatar } from '@components/common';

const TASK_TYPES = ['Feature Development','Bug Fix','Code Review','Documentation','Testing / QA','Research','Meeting / Discussion','Reporting','Client Call','Training','Support Ticket','Infrastructure','Process Improvement','Other'];
let _tid = Date.now() + 2000;
const genTaskId = () => `TASK-${String(++_tid).slice(-6)}`;

export default function AssignTask({ currentUser, users, onSave, onCancel }) {
  const [form,   setForm]   = useState({ title:'', description:'', assigneeId:'', taskType:'Feature Development', priority:'medium', dueDate:'', estimatedHours:'', linkedGoal:'', linkedKPI:'', tags:'' });
  const [errors, setErrors] = useState({});
  const f = k => v => { setForm(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const assignable = users.filter(u => currentUser.role==='super_admin' ? u.status==='active' : u.status==='active' && u.dept===currentUser.dept);
  const selectedEmp = users.find(u=>u.id===form.assigneeId);

  const validate = () => {
    const e={};
    if (!form.title.trim()) e.title='Task title required';
    if (!form.assigneeId)   e.assigneeId='Select an assignee';
    if (!form.dueDate)      e.dueDate='Due date required';
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, id:genTaskId(), assignedBy:currentUser.id, dept:selectedEmp?.dept||currentUser.dept, designation:selectedEmp?.designation||'', status:'todo', progress:0, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  };

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, marginBottom:24, animation:'scaleIn .2s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:700 }}>Assign New Task</h3>
          <p style={{ color:C.muted, fontSize:12, marginTop:3 }}>Assign to any active employee in your department</p>
        </div>
        <button onClick={onCancel} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer' }}><X size={18}/></button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'0 20px' }}>
        <InputField label="Task Title" icon={<ClipboardList size={14}/>} value={form.title} onChange={f('title')} placeholder="e.g. Build authentication module" required error={errors.title}/>
        <InputField label="Task Type"  icon={<Tag size={14}/>}           value={form.taskType} onChange={f('taskType')} options={TASK_TYPES}/>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Description</label>
        <textarea value={form.description} onChange={e=>f('description')(e.target.value)} rows={3} placeholder="Describe the task, acceptance criteria…"
          style={{ width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, resize:'vertical', outline:'none', fontFamily:'"DM Sans",sans-serif' }}
          onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'0 20px' }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Assign To <span style={{color:C.red}}>*</span></label>
          <div style={{ position:'relative' }}>
            <User size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.muted }}/>
            <select value={form.assigneeId} onChange={e=>f('assigneeId')(e.target.value)}
              style={{ width:'100%', background:C.surface, border:`1px solid ${errors.assigneeId?C.red:C.border}`, borderRadius:10, padding:'10px 12px 10px 38px', color:form.assigneeId?C.text:C.muted, fontSize:13, outline:'none', appearance:'none' }}>
              <option value="">Select employee…</option>
              {assignable.map(u=><option key={u.id} value={u.id}>{u.name} — {u.designation}</option>)}
            </select>
          </div>
          {errors.assigneeId && <p style={{ color:C.red, fontSize:11, marginTop:4 }}>{errors.assigneeId}</p>}
          {selectedEmp && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, padding:'8px 12px', background:C.surface, borderRadius:10 }}>
              <Avatar name={selectedEmp.name} size={26} bg={ROLE_COLORS[selectedEmp.role]}/>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{selectedEmp.name}</p>
                <p style={{ fontSize:10, color:C.muted }}>{selectedEmp.designation} · {selectedEmp.dept}</p>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Priority</label>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {['high','medium','low'].map(p=>(
              <button key={p} onClick={()=>f('priority')(p)} type="button"
                style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${form.priority===p?PRIORITY_COLORS[p]:C.border}`, background:form.priority===p?`${PRIORITY_COLORS[p]}20`:'none', color:form.priority===p?PRIORITY_COLORS[p]:C.muted, fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize', textAlign:'left' }}>
                {p==='high'?'🔴':p==='medium'?'🟡':'🟢'} {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'0 16px' }}>
        <div><InputField label="Due Date"   icon={<Calendar size={14}/>} value={form.dueDate}         onChange={f('dueDate')}         type="date" required error={errors.dueDate}/></div>
        <InputField      label="Est. Hours" icon={<Clock size={14}/>}    value={form.estimatedHours}  onChange={f('estimatedHours')}  placeholder="e.g. 8"/>
        <InputField      label="Linked Goal"icon={<Flag size={14}/>}     value={form.linkedGoal}      onChange={f('linkedGoal')}      placeholder="GOAL-XXXXXX"/>
        <InputField      label="Linked KPI" icon={<Hash size={14}/>}     value={form.linkedKPI}       onChange={f('linkedKPI')}       placeholder="KPI-XXXXXX"/>
      </div>

      <InputField label="Tags" icon={<Tag size={14}/>} value={form.tags} onChange={f('tags')} placeholder="sprint-3, frontend, urgent"/>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <button onClick={onCancel} style={{ padding:'10px 20px', borderRadius:10, border:`1px solid ${C.border}`, background:'none', color:C.muted, fontSize:13, cursor:'pointer' }}>Cancel</button>
        <button onClick={handleSave} style={{ padding:'10px 28px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.accent},${C.accentDim})`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:`0 4px 12px ${C.accent}40` }}>
          <Save size={14}/> Assign Task
        </button>
      </div>
    </div>
  );
}
