/**
 * parts/01_UserManagement/ImportExport.jsx
 * Bulk data management:
 *  — CSV upload with drag-and-drop + preview table
 *  — Field mapping validation before import
 *  — Export to CSV, JSON, and Excel (XLSX via SheetJS)
 *  — Download sample CSV template
 */

import { useState, useRef, useCallback } from 'react';
import {
  Upload, Download, FileSpreadsheet, FileText, File,
  CheckCircle, AlertTriangle, X, RefreshCw, Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES } from '@constants/roles';
import { generateEmployeeId } from '@utils/idGenerator';
import { generatePassword } from '@utils/passwordGenerator';
import { Avatar, Badge, Modal } from '@components/common';

// ─── Sample CSV content ───────────────────────────────────────────
const SAMPLE_CSV = `name,email,phone,department,designation,joined
Priya Desai,priya.desai@company.com,+91 9876543210,Software Development,Engineer,2024-01-15
Kiran Rao,kiran.rao@company.com,+91 9876543211,Sales & Service,Sales Executive,2024-02-01
Neha Joshi,neha.joshi@company.com,+91 9876543212,Human Resources,HR Executive,2024-03-10
Amit Patel,amit.patel@company.com,+91 9876543213,IT Infrastructure,Network Engineer,2024-04-05
Divya Nair,divya.nair@company.com,+91 9876543214,BPO / KPO,Agent – Voice,2024-05-20`;

// ─── CSV parser ───────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return { rows: [], errors: ['File has no data rows'] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];
  const errors = [];

  lines.slice(1).forEach((line, i) => {
    // Handle quoted values with commas
    const vals = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || line.split(',').map(v => v.trim());
    const obj  = {};
    headers.forEach((h, j) => obj[h] = vals[j] || '');

    const name  = obj.name || obj['full name'] || '';
    const email = obj.email || '';
    if (!name)  { errors.push(`Row ${i + 2}: Missing name`); return; }
    if (!email) { errors.push(`Row ${i + 2}: Missing email`); return; }

    rows.push({
      id:          generateEmployeeId(),
      name,
      email,
      phone:       obj.phone       || '',
      dept:        obj.department  || obj.dept || '',
      designation: obj.designation || '',
      role:        'employee',
      status:      'active',
      joined:      obj.joined      || obj['joining date'] || new Date().toISOString().split('T')[0],
      reportingTo: '',
      password:    generatePassword(),
    });
  });

  return { rows, errors };
}

// ─────────────────────────────────────────────────────────────────
export default function ImportExport({ users, onImport }) {
  const fileRef  = useRef();
  const [drag,       setDrag]       = useState(false);
  const [preview,    setPreview]    = useState([]);
  const [parseErrs,  setParseErrs]  = useState([]);
  const [importing,  setImporting]  = useState(false);
  const [showPreview,setShowPreview]= useState(false);
  const [imported,   setImported]   = useState(0);

  // ── Drag-and-drop handlers ────────────────────────────────────
  const onDragOver = useCallback(e => { e.preventDefault(); setDrag(true);  }, []);
  const onDragLeave= useCallback(e => { e.preventDefault(); setDrag(false); }, []);
  const onDrop     = useCallback(e => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const { rows, errors } = parseCSV(ev.target.result);
      setPreview(rows);
      setParseErrs(errors);
      setImported(0);
    };
    reader.readAsText(file);
  };

  const handleFileInput = e => {
    if (e.target.files[0]) readFile(e.target.files[0]);
    e.target.value = '';
  };

  // ── Import confirm ────────────────────────────────────────────
  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      onImport(preview);
      setImported(preview.length);
      setPreview([]);
      setParseErrs([]);
      setImporting(false);
    }, 800);
  };

  // ── Export helpers ────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Role', 'Status', 'Joined'];
    const rows    = users.map(u => [u.id, u.name, u.email, u.phone, u.dept, u.designation, ROLES[u.role], u.status, u.joined]);
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    downloadBlob(csv, 'text/csv', 'employees_export.csv');
  };

  const exportXLSX = () => {
    const data = users.map(u => ({
      'Employee ID': u.id, Name: u.name, Email: u.email, Phone: u.phone,
      Department: u.dept, Designation: u.designation, Role: ROLES[u.role],
      Status: u.status, 'Joining Date': u.joined,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees_export.xlsx');
  };

  const exportJSON = () => {
    const data = users.map(({ password, ...u }) => u);   // exclude passwords
    downloadBlob(JSON.stringify(data, null, 2), 'application/json', 'employees_export.json');
  };

  const downloadSample = () => downloadBlob(SAMPLE_CSV, 'text/csv', 'sample_import_template.csv');

  const downloadBlob = (content, type, name) => {
    const a  = document.createElement('a');
    a.href   = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
  };

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* Success banner */}
      {imported > 0 && (
        <div style={{ background: `${C.green}15`, border: `1px solid ${C.green}40`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <CheckCircle size={18} color={C.green} />
          <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>
            {imported} employees imported successfully!
          </p>
          <button onClick={() => setImported(0)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}><X size={14}/></button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* ── Import card ───────────────────────────────────── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.blue}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>
              <Upload size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>Import from CSV</h3>
              <p style={{ fontSize: 12, color: C.muted }}>Upload a comma-separated file</p>
            </div>
          </div>

          {/* Drop zone */}
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileInput} style={{ display: 'none' }} />
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            style={{
              padding: '32px 16px', border: `2px dashed ${drag ? C.blue : C.border}`,
              borderRadius: 12, background: drag ? `${C.blue}08` : C.surface,
              textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = `${C.blue}08`; }}
            onMouseOut={e => { if (!drag) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; } }}>
            <FileSpreadsheet size={28} color={drag ? C.blue : C.muted} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: drag ? C.blue : C.muted, fontWeight: 500 }}>
              {drag ? 'Drop the file here' : 'Click or drag & drop a CSV file'}
            </p>
            <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Supports .csv format · Max 1000 rows</p>
          </div>

          {/* Sample download */}
          <button onClick={downloadSample}
            style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
            <Download size={13} /> Download Sample Template
          </button>

          {/* Field mapping guide */}
          <div style={{ marginTop: 16, padding: 12, background: C.surface, borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Required CSV Columns</p>
            {['name', 'email', 'phone', 'department', 'designation', 'joined'].map(col => (
              <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
                <code style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, padding: '1px 6px', borderRadius: 4 }}>{col}</code>
                {['name', 'email'].includes(col) && <span style={{ fontSize: 10, color: C.red }}>required</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Export card ───────────────────────────────────── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.green}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green }}>
              <Download size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>Export Employee Data</h3>
              <p style={{ fontSize: 12, color: C.muted }}>{users.length} records available</p>
            </div>
          </div>

          {/* Export stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Total',    val: users.length,                              color: C.blue   },
              { label: 'Active',   val: users.filter(u => u.status === 'active').length,   color: C.green  },
              { label: 'Inactive', val: users.filter(u => u.status === 'inactive').length, color: C.red    },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</p>
                <p style={{ fontSize: 11, color: C.muted }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ExportBtn icon={<FileSpreadsheet size={16}/>} label="Export as CSV (.csv)" color={C.green}   onClick={exportCSV}/>
            <ExportBtn icon={<File size={16}/>}            label="Export as Excel (.xlsx)" color={C.blue}  onClick={exportXLSX}/>
            <ExportBtn icon={<FileText size={16}/>}        label="Export as JSON (.json)"  color={C.purple} onClick={exportJSON}/>
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: C.green }}>🔒</span> Passwords are excluded from exports for security
          </p>
        </div>
      </div>

      {/* ── Import Preview ────────────────────────────────────── */}
      {(preview.length > 0 || parseErrs.length > 0) && (
        <div style={{ background: C.card, border: `1px solid ${preview.length ? C.accent : C.red}40`, borderRadius: 16, padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {preview.length > 0 ? <AlertTriangle size={16} color={C.accent}/> : <X size={16} color={C.red}/>}
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700 }}>
                {preview.length > 0 ? `${preview.length} Records Ready to Import` : 'Import Failed'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {preview.length > 0 && (
                <button onClick={() => setShowPreview(true)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Eye size={13}/> Preview All
                </button>
              )}
              <button onClick={() => { setPreview([]); setParseErrs([]); }}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 12, cursor: 'pointer' }}>
                Discard
              </button>
              {preview.length > 0 && (
                <button onClick={handleImport} disabled={importing}
                  style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: importing ? C.faint : C.green, color: '#fff', fontSize: 12, fontWeight: 700, cursor: importing ? 'not-allowed' : 'pointer' }}>
                  {importing ? 'Importing…' : `Confirm Import (${preview.length})`}
                </button>
              )}
            </div>
          </div>

          {/* Parse errors */}
          {parseErrs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {parseErrs.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, color: C.red }}>
                  <X size={12}/> {e}
                </div>
              ))}
            </div>
          )}

          {/* Preview table (first 5 rows) */}
          {preview.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Name', 'Email', 'Department', 'Designation', 'Auto ID', 'Temp Password'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {preview.slice(0, 5).map((u, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '9px 12px', color: C.text, fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '9px 12px', color: C.muted }}>{u.email}</td>
                      <td style={{ padding: '9px 12px', color: C.muted }}>{u.dept || <em style={{ color: C.red }}>—missing—</em>}</td>
                      <td style={{ padding: '9px 12px', color: C.muted }}>{u.designation || '—'}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <code style={{ color: C.accent, background: `${C.accent}15`, padding: '2px 7px', borderRadius: 5, fontSize: 11 }}>{u.id}</code>
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: C.muted, fontSize: 11 }}>{u.password}</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr><td colSpan={6} style={{ padding: '8px 12px', color: C.muted, fontSize: 11, fontStyle: 'italic' }}>…and {preview.length - 5} more rows</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Full preview modal */}
      {showPreview && (
        <Modal title={`Import Preview — ${preview.length} Records`} onClose={() => setShowPreview(false)} width={700}>
          <div style={{ overflowX: 'auto', maxHeight: 400 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                {['#', 'ID', 'Name', 'Email', 'Dept', 'Designation', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {preview.map((u, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}>
                    <td style={{ padding: '8px 12px', color: C.muted }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px' }}><code style={{ color: C.accent, fontSize: 11 }}>{u.id}</code></td>
                    <td style={{ padding: '8px 12px', color: C.text, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '8px 12px', color: C.muted }}>{u.email}</td>
                    <td style={{ padding: '8px 12px', color: C.muted }}>{u.dept}</td>
                    <td style={{ padding: '8px 12px', color: C.muted }}>{u.designation}</td>
                    <td style={{ padding: '8px 12px', color: C.muted }}>{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExportBtn({ icon, label, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseOver={() => setH(true)} onMouseOut={() => setH(false)}
      style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${color}40`, background: h ? `${color}20` : `${color}10`, color, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s', cursor: 'pointer' }}>
      {icon} {label}
    </button>
  );
}
