/**
 * parts/09_Reports/Reports.jsx
 * Part 9 — Reports & Export
 * Generate and export reports as XLS (SheetJS) or PDF (jsPDF).
 * Report types: Employee, Goals, KPI, Appraisal, Task, Department Summary
 */
import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Download, Filter, RefreshCw, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { C, DEPT_COLORS, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { DEPARTMENTS } from '@constants/departments';
import { ROLES } from '@constants/roles';
import { Storage } from '@utils/storage';
import { Avatar, Badge } from '@components/common';

const REPORT_TYPES = [
  { id:'employees',    label:'Employee Directory',   icon:'👥', color:'#3B82F6' },
  { id:'goals',        label:'Goal Status Report',   icon:'🎯', color:'#10B981' },
  { id:'kpis',         label:'KPI Achievement',      icon:'📊', color:'#F59E0B' },
  { id:'appraisals',   label:'Appraisal Summary',    icon:'⭐', color:'#8B5CF6' },
  { id:'tasks',        label:'Task Completion',      icon:'✅', color:'#14B8A6' },
  { id:'dept_summary', label:'Department Summary',   icon:'🏢', color:'#F97316' },
];

export default function Reports({ users, currentUser }) {
  const [selected,  setSelected]  = useState('employees');
  const [deptF,     setDeptF]     = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [generated, setGenerated] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const goals      = Storage.getGoals();
  const kpis       = Storage.getKPIs();
  const appraisals = Storage.getAppraisals();
  const tasks      = Storage.getTasks();

  const getUser = id => users.find(u => u.id === id);

  // ── Build report data ────────────────────────────────────────
  const buildData = () => {
    switch (selected) {
      case 'employees':
        return users
          .filter(u => (!deptF || u.dept === deptF) && (!statusF || u.status === statusF))
          .map(u => ({
            'Employee ID': u.id, 'Name': u.name, 'Email': u.email,
            'Department': u.dept, 'Designation': u.designation,
            'Role': ROLES[u.role], 'Status': u.status, 'Joined': u.joined,
          }));

      case 'goals':
        return goals
          .filter(g => {
            const u = getUser(g.employeeId);
            return (!deptF || u?.dept === deptF) && (!statusF || g.status === statusF);
          })
          .map(g => {
            const u = getUser(g.employeeId);
            return {
              'Goal ID': g.id, 'Employee': u?.name || '—', 'Department': u?.dept || '—',
              'Title': g.title, 'Category': g.category, 'Priority': g.priority,
              'Status': g.status, 'Weight (%)': g.weight,
              'Target': g.targetValue, 'Current': g.currentValue || 0,
              'KRA': g.kraLink || '—', 'Target Date': g.targetDate,
            };
          });

      case 'kpis':
        return kpis
          .filter(k => {
            const u = getUser(k.employeeId);
            return !deptF || u?.dept === deptF;
          })
          .map(k => {
            const u = getUser(k.employeeId);
            return {
              'KPI ID': k.id, 'Employee': u?.name || '—', 'Department': u?.dept || '—',
              'KPI Name': k.kpiName, 'KRA': k.kraLink || '—', 'Period': k.period,
              'Quarter': k.quarter, 'Year': k.year, 'Weight (%)': k.weight,
              'Target': k.targetValue, 'Actual': k.actualValue || '—',
              'Achievement (%)': k.achievement || 0, 'Rating': k.rating || '—',
            };
          });

      case 'appraisals':
        return appraisals
          .filter(a => {
            const u = getUser(a.employeeId);
            return !deptF || u?.dept === deptF;
          })
          .map(a => {
            const u   = getUser(a.employeeId);
            const mgr = getUser(a.conductedBy);
            return {
              'Appraisal ID': a.id, 'Employee': u?.name || '—', 'Department': u?.dept || '—',
              'Designation': u?.designation || '—', 'Period': a.period,
              'Overall Score': a.overallScore || '—', 'Conducted By': mgr?.name || '—',
              'Status': a.status, 'Date': new Date(a.createdAt).toLocaleDateString('en-IN'),
              'Strengths': a.strengths || '—', 'Improvement': a.improvement || '—',
            };
          });

      case 'tasks':
        return tasks
          .filter(t => {
            const u = getUser(t.assigneeId);
            return (!deptF || u?.dept === deptF) && (!statusF || t.status === statusF);
          })
          .map(t => {
            const u   = getUser(t.assigneeId);
            const mgr = getUser(t.assignedBy);
            return {
              'Task ID': t.id, 'Assignee': u?.name || '—', 'Department': u?.dept || '—',
              'Title': t.title, 'Type': t.taskType, 'Priority': t.priority,
              'Status': t.status, 'Progress (%)': t.progress || 0,
              'Due Date': t.dueDate || '—', 'Est. Hours': t.estimatedHours || '—',
              'Assigned By': mgr?.name || '—', 'Rating': t.rating || '—',
            };
          });

      case 'dept_summary':
        return DEPARTMENTS.map(dept => {
          const dUsers = users.filter(u => u.dept === dept);
          const dGoals = goals.filter(g => getUser(g.employeeId)?.dept === dept);
          const dKPIs  = kpis.filter(k  => getUser(k.employeeId)?.dept === dept);
          const dTasks = tasks.filter(t => getUser(t.assigneeId)?.dept === dept);
          const dAprs  = appraisals.filter(a => getUser(a.employeeId)?.dept === dept);
          return {
            'Department': dept,
            'Total Employees': dUsers.length,
            'Active': dUsers.filter(u=>u.status==='active').length,
            'Total Goals': dGoals.length,
            'Goals Completed': dGoals.filter(g=>g.status==='completed').length,
            'Goal Rate (%)': dGoals.length ? Math.round((dGoals.filter(g=>g.status==='completed').length/dGoals.length)*100) : 0,
            'Total Tasks': dTasks.length,
            'Tasks Done': dTasks.filter(t=>t.status==='completed').length,
            'Task Rate (%)': dTasks.length ? Math.round((dTasks.filter(t=>t.status==='completed').length/dTasks.length)*100) : 0,
            'KPI Count': dKPIs.length,
            'Avg KPI Rating': dKPIs.length ? parseFloat((dKPIs.reduce((s,k)=>s+(k.rating||0),0)/dKPIs.length).toFixed(2)) : '—',
            'Appraisals': dAprs.length,
            'Avg Appraisal Score': dAprs.length ? parseFloat((dAprs.reduce((s,a)=>s+(a.overallScore||0),0)/dAprs.length).toFixed(2)) : '—',
          };
        });

      default: return [];
    }
  };

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      const data = buildData();
      setGenerated(data);
      setLoading(false);
    }, 600);
  };

  // ── Export XLS ───────────────────────────────────────────────
  const exportXLS = () => {
    if (!generated?.length) return;
    const ws = XLSX.utils.json_to_sheet(generated);
    const wb = XLSX.utils.book_new();
    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellAddr]) {
        ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'F59E0B' } } };
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `PMS_${selected}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ── Export CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    if (!generated?.length) return;
    const headers = Object.keys(generated[0]);
    const rows    = generated.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','));
    const csv     = [headers.join(','), ...rows].join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const a       = document.createElement('a');
    a.href        = URL.createObjectURL(blob);
    a.download    = `PMS_${selected}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Export PDF (text-based) ───────────────────────────────────
  const exportPDF = async () => {
    if (!generated?.length) return;
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const rpt  = REPORT_TYPES.find(r => r.id === selected);
    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11);
    doc.text(`PerfManager Pro — ${rpt?.label}`, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}   Total: ${generated.length} records`, 14, 23);
    const headers = Object.keys(generated[0]);
    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: generated.map(r => headers.map(h => r[h] ?? '')),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11], textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [30, 37, 53] },
      theme: 'striped',
    });
    doc.save(`PMS_${selected}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const rpt = REPORT_TYPES.find(r => r.id === selected);
  const previewCols = generated?.length ? Object.keys(generated[0]).slice(0, 7) : [];

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>

        {/* Report type sidebar */}
        <div>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700, marginBottom:12, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>Report Type</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {REPORT_TYPES.map(r => (
              <button key={r.id} onClick={() => { setSelected(r.id); setGenerated(null); }}
                style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${selected===r.id?r.color:C.border}`, background:selected===r.id?`${r.color}15`:C.card, color:selected===r.id?r.color:C.muted, fontSize:13, fontWeight:selected===r.id?700:400, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:10, transition:'all .15s' }}>
                <span style={{ fontSize:18 }}>{r.icon}</span>{r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report config + preview */}
        <div>
          {/* Config card */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
              <span style={{ fontSize:24 }}>{rpt?.icon}</span>
              <div>
                <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700 }}>{rpt?.label}</h3>
                <p style={{ fontSize:12, color:C.muted }}>Configure filters and generate</p>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
              <select value={deptF} onChange={e=>setDeptF(e.target.value)}
                style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:deptF?C.text:C.muted, fontSize:13, outline:'none', minWidth:160 }}>
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>

              {['employees','goals','tasks'].includes(selected) && (
                <select value={statusF} onChange={e=>setStatusF(e.target.value)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', color:statusF?C.text:C.muted, fontSize:13, outline:'none', minWidth:140 }}>
                  <option value="">All Statuses</option>
                  {selected==='employees' && ['active','inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  {selected==='goals'     && ['draft','submitted','approved','completed','rejected'].map(s=><option key={s} value={s}>{s}</option>)}
                  {selected==='tasks'     && ['todo','in-progress','completed'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              )}

              <button onClick={generateReport} disabled={loading}
                style={{ padding:'8px 20px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.accent},${C.accentDim})`, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:`0 3px 10px ${C.accent}35`, opacity:loading?0.7:1 }}>
                {loading ? <RefreshCw size={14} style={{animation:'spin 1s linear infinite'}}/> : <Filter size={14}/>}
                {loading ? 'Generating…' : 'Generate Report'}
              </button>
            </div>

            {/* Export buttons */}
            {generated && (
              <div style={{ display:'flex', gap:10, padding:'14px', background:C.surface, borderRadius:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                  <CheckCircle size={14} color={C.green}/>
                  <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{generated.length} records ready</span>
                </div>
                <button onClick={exportCSV}
                  style={{ padding:'8px 16px', borderRadius:9, border:`1px solid ${C.green}40`, background:`${C.green}12`, color:C.green, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <FileSpreadsheet size={14}/> CSV
                </button>
                <button onClick={exportXLS}
                  style={{ padding:'8px 16px', borderRadius:9, border:`1px solid ${C.blue}40`, background:`${C.blue}12`, color:C.blue, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <FileSpreadsheet size={14}/> Excel
                </button>
                <button onClick={exportPDF}
                  style={{ padding:'8px 16px', borderRadius:9, border:`1px solid ${C.red}40`, background:`${C.red}12`, color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <FileText size={14}/> PDF
                </button>
              </div>
            )}
          </div>

          {/* Preview table */}
          {generated && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'12px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h4 style={{ fontSize:13, fontWeight:700 }}>Preview (first 10 rows · {previewCols.length}/{Object.keys(generated[0]||{}).length} columns)</h4>
                <span style={{ fontSize:11, color:C.muted }}>Full data in exported file</span>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:C.surface }}>
                      {previewCols.map(h=>(
                        <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generated.slice(0,10).map((row,i)=>(
                      <tr key={i} style={{ borderTop:`1px solid ${C.border}`, background:i%2===0?C.card:C.surface }}>
                        {previewCols.map(col=>(
                          <td key={col} style={{ padding:'9px 14px', color:C.text, whiteSpace:'nowrap', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis' }}>
                            {String(row[col]??'—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {generated.length > 10 && (
                <div style={{ padding:'10px 18px', borderTop:`1px solid ${C.border}`, color:C.muted, fontSize:12, fontStyle:'italic' }}>
                  …and {generated.length-10} more rows in the export
                </div>
              )}
            </div>
          )}

          {!generated && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
              <div style={{ fontSize:48, opacity:0.2, marginBottom:12 }}>📄</div>
              <p style={{ fontSize:14 }}>Select a report type and click <strong style={{color:C.text}}>Generate Report</strong></p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
