/**
 * parts/11_ImportExport/BulkImportExport.jsx
 * Part 11 — Employee Import / Export (advanced)
 * Full CSV / Excel / JSON import with field mapping.
 * Export all data modules or individual ones.
 * Download backup + restore from backup.
 */
import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, FileText, Database, RefreshCw, CheckCircle, AlertTriangle, X, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { C, DEPT_COLORS } from '@constants/theme';
import { DEPARTMENTS, DESIGNATIONS_BY_DEPT } from '@constants/departments';
import { Storage } from '@utils/storage';
import { generateEmployeeId } from '@utils/idGenerator';
import { generatePassword } from '@utils/passwordGenerator';
import { ROLES } from '@constants/roles';

// ── CSV parser (reused from Part 1, enhanced) ─────────────────────
function parseCSVorXLS(file, cb) {
  const name = file.name.toLowerCase();
  const reader = new FileReader();

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    reader.onload = ev => {
      const wb   = XLSX.read(ev.target.result, { type:'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:'' });
      cb(rows.map(r => normalizeRow(r)));
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = ev => {
      const lines = ev.target.result.trim().split('\n').filter(Boolean);
      if (lines.length < 2) { cb([]); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,'').toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(v=>v.replace(/^"|"$/g,'').trim()) || line.split(',').map(v=>v.trim());
        const obj = {};
        headers.forEach((h,i) => obj[h] = vals[i]||'');
        return normalizeRow(obj);
      });
      cb(rows);
    };
    reader.readAsText(file);
  }
}

function normalizeRow(obj) {
  return {
    name:        obj.name        || obj['full name']  || '',
    email:       obj.email       || '',
    phone:       obj.phone       || obj['phone number'] || '',
    dept:        obj.department  || obj.dept           || '',
    designation: obj.designation || obj.role           || '',
    joined:      obj.joined      || obj['joining date'] || new Date().toISOString().split('T')[0],
    reportingTo: obj.reportingto || obj['reporting to'] || '',
  };
}

// Sample CSV template content
const SAMPLE_CSV = `name,email,phone,department,designation,joined,reportingTo
Arjun Mehta,arjun.mehta@company.com,+91 9876543210,Software Development,Engineer,2024-01-15,EMP-0002
Priya Sharma,priya.sharma@company.com,+91 9876543211,Human Resources,HR Executive,2024-02-01,EMP-0001
Vikram Nair,vikram.nair@company.com,+91 9876543212,Sales & Service,Sales Executive,2024-03-10,EMP-0003`;

export default function BulkImportExport({ users, currentUser, onImport }) {
  const fileRef  = useRef();
  const backRef  = useRef();
  const [drag,       setDrag]       = useState(false);
  const [preview,    setPreview]    = useState([]);
  const [parseErrs,  setParseErrs]  = useState([]);
  const [importing,  setImporting]  = useState(false);
  const [imported,   setImported]   = useState(0);
  const [activeTab,  setActiveTab]  = useState('import');

  // ── Import handlers ─────────────────────────────────────────
  const handleFile = file => {
    parseCSVorXLS(file, rows => {
      const errs   = [];
      const parsed = rows
        .map((r, i) => {
          if (!r.name)  { errs.push(`Row ${i+2}: Missing name`);  return null; }
          if (!r.email) { errs.push(`Row ${i+2}: Missing email`); return null; }
          return { ...r, id:generateEmployeeId(), role:'employee', status:'active', password:generatePassword() };
        })
        .filter(Boolean);
      setPreview(parsed);
      setParseErrs(errs);
      setImported(0);
    });
  };

  const confirmImport = () => {
    setImporting(true);
    setTimeout(() => {
      onImport(preview);
      setImported(preview.length);
      setPreview([]);
      setParseErrs([]);
      setImporting(false);
    }, 700);
  };

  const downloadSample = (type) => {
    if (type === 'csv') {
      const blob = new Blob([SAMPLE_CSV], { type:'text/csv' });
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='sample_employees.csv'; a.click();
    } else {
      const rows = SAMPLE_CSV.split('\n').slice(1).map(l => {
        const [name,email,phone,department,designation,joined,reportingTo] = l.split(',');
        return {name,email,phone,department,designation,joined,reportingTo};
      });
      const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Employees'); XLSX.writeFile(wb,'sample_employees.xlsx');
    }
  };

  // ── Export handlers ─────────────────────────────────────────
  const exportUsers = (fmt) => {
    const data = users.map(({password,...u})=>({...u,role:ROLES[u.role]}));
    if (fmt==='csv') {
      const h = Object.keys(data[0]);
      const csv = [h.join(','), ...data.map(r=>h.map(k=>`"${r[k]??''}"`).join(','))].join('\n');
      dlBlob(csv,'text/csv','employees_export.csv');
    } else if (fmt==='xlsx') {
      const ws=XLSX.utils.json_to_sheet(data); const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Employees'); XLSX.writeFile(wb,'employees_export.xlsx');
    } else {
      dlBlob(JSON.stringify(data,null,2),'application/json','employees_export.json');
    }
  };

  // ── Full backup ──────────────────────────────────────────────
  const exportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: 'pms_v1',
      users:      Storage.getUsers(),
      goals:      Storage.getGoals(),
      kpis:       Storage.getKPIs(),
      appraisals: Storage.getAppraisals(),
      tasks:      Storage.getTasks(),
      approvals:  Storage.getApprovals(),
    };
    dlBlob(JSON.stringify(backup,null,2),'application/json',`PMS_backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const restoreBackup = file => {
    const r = new FileReader();
    r.onload = ev => {
      try {
        const backup = JSON.parse(ev.target.result);
        if (!backup.version || !backup.users) throw new Error('Invalid backup file');
        if (backup.users)      Storage.setUsers(backup.users);
        if (backup.goals)      Storage.setGoals(backup.goals);
        if (backup.kpis)       Storage.setKPIs(backup.kpis);
        if (backup.appraisals) Storage.setAppraisals(backup.appraisals);
        if (backup.tasks)      Storage.setTasks(backup.tasks);
        if (backup.approvals)  Storage.setApprovals(backup.approvals);
        alert(`✅ Backup restored! ${backup.users.length} employees + all data. Refresh to see changes.`);
      } catch(e) { alert('❌ Invalid backup file: '+e.message); }
    };
    r.readAsText(file);
  };

  const dlBlob = (content,type,name) => {
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click();
  };

  const TABS = [
    { id:'import', label:'Import Employees' },
    { id:'export', label:'Export Employees' },
    { id:'backup', label:'Backup & Restore' },
  ];

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:C.card, padding:4, borderRadius:14, width:'fit-content', border:`1px solid ${C.border}` }}>
        {TABS.map(tab => {
          const active = activeTab===tab.id;
          return (
            <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setPreview([]);setParseErrs([]);}}
              style={{ padding:'8px 20px', borderRadius:10, border:'none', fontSize:13, cursor:'pointer',
                background:active?`linear-gradient(135deg,${C.accent},${C.accentDim})`:'transparent',
                color:active?'#fff':C.muted, fontWeight:active?700:400, transition:'all .15s' }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── IMPORT TAB ── */}
      {activeTab==='import' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Upload zone */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:16 }}>Upload File</h3>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" onChange={e=>handleFile(e.target.files[0])} style={{display:'none'}}/>
            <div onClick={()=>fileRef.current.click()}
              onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
              style={{ padding:'36px 16px', border:`2px dashed ${drag?C.blue:C.border}`, borderRadius:12, background:drag?`${C.blue}08`:C.surface, textAlign:'center', cursor:'pointer', transition:'all .2s' }}>
              <FileSpreadsheet size={32} color={drag?C.blue:C.muted} style={{margin:'0 auto 10px'}}/>
              <p style={{ fontSize:13, color:drag?C.blue:C.muted, fontWeight:500 }}>
                {drag?'Drop here!':'Click or drag & drop'}
              </p>
              <p style={{ fontSize:11, color:C.faint, marginTop:4 }}>CSV · Excel (.xlsx) · JSON</p>
            </div>

            {/* Sample downloads */}
            <div style={{ marginTop:14 }}>
              <p style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.4px', fontWeight:600 }}>Download Templates</p>
              <div style={{ display:'flex', gap:8 }}>
                {['csv','xlsx'].map(fmt=>(
                  <button key={fmt} onClick={()=>downloadSample(fmt)}
                    style={{ flex:1, padding:'8px', borderRadius:9, border:`1px solid ${C.border}`, background:'none', color:C.muted, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <Download size={13}/> Sample .{fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Field guide */}
            <div style={{ marginTop:14, padding:12, background:C.surface, borderRadius:10 }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.4px' }}>Required Columns</p>
              {[['name','Required'],['email','Required'],['department','Optional'],['designation','Optional'],['phone','Optional'],['joined','Optional']].map(([col,req])=>(
                <div key={col} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:req==='Required'?C.red:C.faint, flexShrink:0 }}/>
                  <code style={{ fontSize:11, color:req==='Required'?C.accent:C.muted, background:`${C.faint}60`, padding:'1px 6px', borderRadius:4 }}>{col}</code>
                  <span style={{ fontSize:10, color:C.faint }}>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview + confirm */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:700, marginBottom:16 }}>
              {preview.length>0 ? `Preview — ${preview.length} records` : 'Preview'}
            </h3>

            {imported > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:`${C.green}12`, borderRadius:10, border:`1px solid ${C.green}30`, marginBottom:14 }}>
                <CheckCircle size={14} color={C.green}/>
                <p style={{ fontSize:13, color:C.green, fontWeight:600 }}>{imported} employees imported successfully!</p>
              </div>
            )}

            {parseErrs.length > 0 && (
              <div style={{ marginBottom:14 }}>
                {parseErrs.map((e,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.red, padding:'3px 0' }}>
                    <X size={11}/>{e}
                  </div>
                ))}
              </div>
            )}

            {preview.length > 0 ? (
              <>
                <div style={{ overflowX:'auto', marginBottom:14 }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                    <thead><tr style={{ background:C.surface }}>
                      {['ID','Name','Email','Dept','Designation'].map(h=>(
                        <th key={h} style={{ padding:'7px 10px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:10, textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {preview.slice(0,6).map((u,i)=>(
                        <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                          <td style={{ padding:'7px 10px' }}><code style={{ color:C.accent, fontSize:10 }}>{u.id}</code></td>
                          <td style={{ padding:'7px 10px', color:C.text }}>{u.name}</td>
                          <td style={{ padding:'7px 10px', color:C.muted }}>{u.email}</td>
                          <td style={{ padding:'7px 10px', color:C.muted }}>{u.dept||'—'}</td>
                          <td style={{ padding:'7px 10px', color:C.muted }}>{u.designation||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length>6 && <p style={{ fontSize:11, color:C.muted, padding:'6px 10px' }}>…and {preview.length-6} more</p>}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>{setPreview([]);setParseErrs([]);}}
                    style={{ padding:'9px 16px', borderRadius:9, border:`1px solid ${C.border}`, background:'none', color:C.muted, fontSize:13, cursor:'pointer' }}>
                    Discard
                  </button>
                  <button onClick={confirmImport} disabled={importing}
                    style={{ flex:1, padding:'9px', borderRadius:9, border:'none', background:importing?C.faint:C.green, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {importing?'Importing…':`Confirm Import (${preview.length})`}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 10px', color:C.faint }}>
                <FileSpreadsheet size={36} style={{ display:'block', margin:'0 auto 10px', opacity:0.3 }}/>
                <p style={{ fontSize:13 }}>Upload a file to preview</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {activeTab==='export' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {[
              { label:'Export as CSV',   fmt:'csv',  icon:<FileSpreadsheet size={18}/>, color:C.green,  desc:`${users.length} employee records` },
              { label:'Export as Excel', fmt:'xlsx', icon:<FileSpreadsheet size={18}/>, color:C.blue,   desc:'With formatting (.xlsx)' },
              { label:'Export as JSON',  fmt:'json', icon:<FileText size={18}/>,        color:C.purple, desc:'Structured data (no passwords)' },
            ].map(({ label, fmt, icon, color, desc }) => (
              <div key={fmt} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, borderTop:`3px solid ${color}` }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color, marginBottom:14 }}>{icon}</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{label}</h3>
                <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{desc}</p>
                <button onClick={()=>exportUsers(fmt)}
                  style={{ width:'100%', padding:'10px', borderRadius:10, border:`1px solid ${color}40`, background:`${color}12`, color, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Download size={14}/> Download
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
            <p style={{ fontSize:12, color:C.muted, display:'flex', alignItems:'center', gap:6 }}>
              <Shield size={13} color={C.green}/> Passwords are excluded from all exports for security.
            </p>
          </div>
        </div>
      )}

      {/* ── BACKUP TAB ── */}
      {activeTab==='backup' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Export backup */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, borderTop:`3px solid ${C.accent}` }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${C.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', color:C.accent, marginBottom:16 }}>
              <Database size={22}/>
            </div>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, marginBottom:6 }}>Export Full Backup</h3>
            <p style={{ fontSize:13, color:C.muted, marginBottom:8, lineHeight:1.5 }}>
              Downloads a complete JSON backup of all system data including employees, goals, KPIs, appraisals, tasks, and approvals.
            </p>
            <div style={{ marginBottom:20 }}>
              {[['Employees', users.length],['Goals',Storage.getGoals().length],['KPIs',Storage.getKPIs().length],['Appraisals',Storage.getAppraisals().length],['Tasks',Storage.getTasks().length]].map(([label,count])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                  <span style={{ color:C.muted }}>{label}</span>
                  <span style={{ color:C.text, fontWeight:600 }}>{count} records</span>
                </div>
              ))}
            </div>
            <button onClick={exportBackup}
              style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${C.accent},${C.accentDim})`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 4px 14px ${C.accent}40` }}>
              <Download size={16}/> Export Backup (.json)
            </button>
          </div>

          {/* Restore backup */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, borderTop:`3px solid ${C.blue}` }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${C.blue}18`, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue, marginBottom:16 }}>
              <RefreshCw size={22}/>
            </div>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, marginBottom:6 }}>Restore from Backup</h3>
            <p style={{ fontSize:13, color:C.muted, marginBottom:8, lineHeight:1.5 }}>
              Upload a PerfManager backup JSON file to restore all data. This will overwrite current data.
            </p>
            <div style={{ padding:'12px 14px', background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:10, marginBottom:20 }}>
              <p style={{ fontSize:12, color:C.red, display:'flex', alignItems:'center', gap:6 }}>
                <AlertTriangle size={13}/> Warning: This will overwrite all existing data permanently.
              </p>
            </div>
            <input ref={backRef} type="file" accept=".json" onChange={e=>restoreBackup(e.target.files[0])} style={{display:'none'}}/>
            <button onClick={()=>backRef.current.click()}
              style={{ width:'100%', padding:'12px', borderRadius:12, border:`1px solid ${C.blue}40`, background:`${C.blue}12`, color:C.blue, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Upload size={16}/> Upload Backup File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
