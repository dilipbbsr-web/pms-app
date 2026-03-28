/**
 * parts/01_UserManagement/EmployeeForm.jsx
 * Add / Edit employee form:
 *  — All fields with validation
 *  — Auto-generated EMP-XXXX ID shown (read-only for add)
 *  — Department → Designation cascade dropdown
 *  — Reporting-To picker from same dept
 *  — Password generate + strength meter
 *  — Role selector (Super Admin only)
 */

import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Calendar,
  Hash, Shield, CheckCircle, Key, RefreshCw, Save, X, Info,
} from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES, can } from '@constants/roles';
import { DEPARTMENTS, DESIGNATIONS_BY_DEPT } from '@constants/departments';
import { generateEmployeeId, peekNextId } from '@utils/idGenerator';
import { generatePassword, validatePassword } from '@utils/passwordGenerator';
import { InputField, PasswordField, Badge } from '@components/common';

export default function EmployeeForm({ editUser, onSave, onCancel, currentUser, existingUsers }) {
  const isEdit  = !!editUser;
  const isSuper = currentUser.role === 'super_admin';

  const blank = {
    name: '', email: '', phone: '', dept: '', designation: '',
    role: 'employee', status: 'active',
    joined: new Date().toISOString().split('T')[0],
    reportingTo: '', password: generatePassword(),
  };

  const [form,   setForm]   = useState(isEdit ? { ...blank, ...editUser } : blank);
  const [errors, setErrors] = useState({});
  const [previewId] = useState(() => isEdit ? editUser.id : peekNextId());
  const [pwdStrength, setPwdStrength] = useState({ valid: true, message: 'Strong password' });

  const f = (key) => (val) => {
    setForm(p => ({
      ...p, [key]: val,
      // Reset designation when dept changes
      ...(key === 'dept' ? { designation: '', reportingTo: '' } : {}),
    }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  // Evaluate password strength on change
  useEffect(() => {
    if (form.password) setPwdStrength(validatePassword(form.password));
  }, [form.password]);

  // Reporting-to options: employees in same dept, excluding self
  const reportingOpts = existingUsers
    .filter(u => u.dept === form.dept && u.id !== editUser?.id)
    .map(u => ({ value: u.id, label: `${u.name} — ${u.designation}` }));

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    else {
      const dup = existingUsers.find(u => u.email === form.email && u.id !== editUser?.id);
      if (dup) e.email = 'Email already used by another employee';
    }
    if (!form.dept)         e.dept        = 'Select a department';
    if (!form.designation)  e.designation = 'Select a designation';
    if (!form.joined)       e.joined      = 'Joining date is required';
    const pv = validatePassword(form.password);
    if (!pv.valid) e.password = pv.message;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const user = isEdit
      ? { ...editUser, ...form }
      : { ...form, id: generateEmployeeId() };
    onSave(user);
  };

  // ── Strength bar ────────────────────────────────────────────
  const strengthColor = (pwd) => {
    if (pwd.length < 6) return C.red;
    if (pwd.length < 8) return C.orange;
    const r = validatePassword(pwd);
    return r.valid ? C.green : C.accent;
  };
  const strengthPct = (pwd) => Math.min(100, Math.round((pwd.length / 12) * 100));

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800 }}>
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {isEdit ? 'Modify existing employee record' : 'All fields marked * are required. ID is auto-generated.'}
          </p>
        </div>

        {/* Auto ID preview */}
        <div style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: '10px 18px', textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: C.muted }}>Employee ID</p>
          <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: C.accent, marginTop: 2 }}>{previewId}</p>
          <p style={{ fontSize: 10, color: C.muted }}>{isEdit ? 'Cannot change' : 'Auto-assigned'}</p>
        </div>
      </div>

      {/* ── Form card ─────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>

        {/* Row 1: Name + Email */}
        <FormRow>
          <InputField label="Full Name" icon={<User size={14}/>} value={form.name}  onChange={f('name')}  placeholder="e.g. Rohan Mehta" required error={errors.name}/>
          <InputField label="Email Address" icon={<Mail size={14}/>} value={form.email} onChange={f('email')} placeholder="name@company.com" type="email" required error={errors.email}/>
        </FormRow>

        {/* Row 2: Phone + Joining Date */}
        <FormRow>
          <InputField label="Phone Number" icon={<Phone size={14}/>} value={form.phone}  onChange={f('phone')}  placeholder="+91 9XXXXXXXXX"/>
          <InputField label="Joining Date" icon={<Calendar size={14}/>} value={form.joined} onChange={f('joined')} type="date" required error={errors.joined}/>
        </FormRow>

        {/* Row 3: Department + Designation */}
        <FormRow>
          <InputField label="Department" icon={<Building2 size={14}/>} value={form.dept} onChange={f('dept')} options={DEPARTMENTS} required error={errors.dept}/>
          <InputField label="Designation" icon={<Briefcase size={14}/>} value={form.designation} onChange={f('designation')}
            options={form.dept ? DESIGNATIONS_BY_DEPT[form.dept] : []}
            required error={errors.designation}
            hint={!form.dept ? 'Select a department first' : ''}/>
        </FormRow>

        {/* Row 4: Reporting To + Status */}
        <FormRow>
          <InputField label="Reporting To" icon={<User size={14}/>} value={form.reportingTo} onChange={f('reportingTo')}
            options={reportingOpts}
            hint={!form.dept ? 'Select a department first' : ''}/>

          <InputField label="Status" icon={<CheckCircle size={14}/>} value={form.status} onChange={f('status')}
            options={[{ value: 'active', label: '✓ Active' }, { value: 'inactive', label: '✗ Inactive' }]}/>
        </FormRow>

        {/* Role (Super Admin only) */}
        {isSuper && (
          <FormRow>
            <InputField label="System Role" icon={<Shield size={14}/>} value={form.role} onChange={f('role')}
              options={Object.entries(ROLES).map(([k, v]) => ({ value: k, label: v }))}
              hint="Only Super Admin can assign roles"/>
            <div /> {/* spacer */}
          </FormRow>
        )}

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password <span style={{ color: C.red }}>*</span>
            </label>
            <button onClick={() => f('password')(generatePassword())} type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 12, cursor: 'pointer' }}>
              <RefreshCw size={12} /> Generate New
            </button>
          </div>

          <PasswordField
            value={form.password}
            onChange={v => f('password')(v)}
            error={errors.password}
          />

          {/* Strength meter */}
          <div style={{ marginTop: -8 }}>
            <div style={{ height: 4, background: C.faint, borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${strengthPct(form.password)}%`,
                background: strengthColor(form.password),
                transition: 'width .3s ease, background .3s',
              }} />
            </div>
            <p style={{ fontSize: 11, color: strengthColor(form.password) }}>{pwdStrength.message}</p>
          </div>
        </div>

        {/* Info note */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: `${C.blue}10`, border: `1px solid ${C.blue}25`, borderRadius: 10, marginBottom: 24 }}>
          <Info size={14} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            Employee credentials will be shared directly. The employee should change their password after first login.
            {!isEdit && <> Assigned ID: <strong style={{ color: C.accent, fontFamily: 'monospace' }}>{previewId}</strong></>}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <button onClick={onCancel}
            style={{ padding: '10px 22px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave}
            style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.accent}40` }}>
            <Save size={14} /> {isEdit ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormRow({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
      {children}
    </div>
  );
}
