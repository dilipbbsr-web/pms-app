/**
 * src/utils/storage.js
 * Hybrid: Supabase for users, localStorage for all other data.
 * This keeps all components working without async refactoring.
 */
import { supabase } from './supabase';

// ─── camelCase ↔ snake_case maps ─────────────────────────────
const toSnake = obj => {
  const map = {
    employeeId:'employee_id', assigneeId:'assignee_id', assignedBy:'assigned_by',
    conductedBy:'conducted_by', reviewedBy:'reviewed_by', reportingTo:'reporting_to',
    taskType:'task_type', dueDate:'due_date', startDate:'start_date',
    targetDate:'target_date', targetValue:'target_value', currentValue:'current_value',
    actualValue:'actual_value', metricType:'metric_type', metricUnit:'metric_unit',
    kraLink:'kra_link', kpiLink:'kpi_link', linkedGoal:'linked_goal',
    linkedKPI:'linked_kpi', overallScore:'overall_score', goalsNext:'goals_next',
    evalComment:'eval_comment', evaluatedBy:'evaluated_by', evaluatedAt:'evaluated_at',
    approvedComment:'approved_comment', rejectedComment:'rejected_comment',
    estimatedHours:'estimated_hours', itemId:'item_id', itemType:'item_type',
    reviewedAt:'reviewed_at', createdAt:'created_at', updatedAt:'updated_at',
    kpiName:'kpi_name', userId:'user_id',
  };
  const result = {};
  Object.entries(obj).forEach(([k, v]) => { result[map[k] || k] = v; });
  return result;
};

const toCamel = obj => {
  if (!obj) return obj;
  const map = {
    employee_id:'employeeId', assignee_id:'assigneeId', assigned_by:'assignedBy',
    conducted_by:'conductedBy', reviewed_by:'reviewedBy', reporting_to:'reportingTo',
    task_type:'taskType', due_date:'dueDate', start_date:'startDate',
    target_date:'targetDate', target_value:'targetValue', current_value:'currentValue',
    actual_value:'actualValue', metric_type:'metricType', metric_unit:'metricUnit',
    kra_link:'kraLink', kpi_link:'kpiLink', linked_goal:'linkedGoal',
    linked_kpi:'linkedKPI', overall_score:'overallScore', goals_next:'goalsNext',
    eval_comment:'evalComment', evaluated_by:'evaluatedBy', evaluated_at:'evaluatedAt',
    approved_comment:'approvedComment', rejected_comment:'rejectedComment',
    estimated_hours:'estimatedHours', item_id:'itemId', item_type:'itemType',
    reviewed_at:'reviewedAt', created_at:'createdAt', updated_at:'updatedAt',
    kpi_name:'kpiName', user_id:'userId',
  };
  const result = {};
  Object.entries(obj).forEach(([k, v]) => { result[map[k] || k] = v; });
  return result;
};

const camelRows = rows => (rows || []).map(toCamel);

// ─── Supabase helpers (async - users only) ────────────────────
async function getSupabase(table) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) { console.error(`[PMS] get ${table}:`, error.message); return []; }
  return camelRows(data);
}

async function upsertSupabase(table, obj) {
  const row = toSnake({ ...obj, updatedAt: new Date().toISOString() });
  const { data, error } = await supabase.from(table).upsert(row, { onConflict: 'id' }).select().single();
  if (error) { console.error(`[PMS] upsert ${table}:`, error.message); return null; }
  return toCamel(data);
}

async function deleteSupabase(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) { console.error(`[PMS] delete ${table}:`, error.message); return false; }
  return true;
}

// ─── localStorage helpers (sync - all other data) ────────────
const LS = {
  get: (key, fallback = []) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ─── Public Storage API ───────────────────────────────────────
export const Storage = {

  // ── USERS — Supabase (async) ──────────────────────────────
  getUsers:    ()     => getSupabase('users'),
  upsertUser:  (u)    => upsertSupabase('users', u),
  deleteUser:  (id)   => deleteSupabase('users', id),
  loginUser: async (email, password) => {
    const { data, error } = await supabase
      .from('users').select('*')
      .eq('email', email).eq('password', password).single();
    if (error || !data) return null;
    return toCamel(data);
  },

  // ── GOALS — localStorage (sync) ───────────────────────────
  getGoals:  ()       => LS.get('pms_v1_goals'),
  setGoals:  (v)      => LS.set('pms_v1_goals', v),

  // ── KPIs — localStorage (sync) ────────────────────────────
  getKPIs:   ()       => LS.get('pms_v1_kpis'),
  setKPIs:   (v)      => LS.set('pms_v1_kpis', v),

  // ── TASKS — localStorage (sync) ───────────────────────────
  getTasks:  ()       => LS.get('pms_v1_tasks'),
  setTasks:  (v)      => LS.set('pms_v1_tasks', v),

  // ── APPRAISALS — localStorage (sync) ──────────────────────
  getAppraisals:  ()  => LS.get('pms_v1_appraisals'),
  setAppraisals:  (v) => LS.set('pms_v1_appraisals', v),

  // ── APPROVALS — localStorage (sync) ───────────────────────
  getApprovals:  ()   => LS.get('pms_v1_approvals'),
  setApprovals:  (v)  => LS.set('pms_v1_approvals', v),

  // ── NOTIFICATIONS — localStorage (sync) ───────────────────
  getNotifications:  ()  => LS.get('pms_v1_notifications'),
  setNotifications:  (v) => LS.set('pms_v1_notifications', v),

  // ── SESSION — localStorage (sync) ─────────────────────────
  getSession:   ()     => { try { return JSON.parse(localStorage.getItem('pms_session')); } catch { return null; } },
  setSession:   (user) => localStorage.setItem('pms_session', JSON.stringify(user)),
  clearSession: ()     => localStorage.removeItem('pms_session'),

  // ── CLEAR ALL (reset) ──────────────────────────────────────
  clearAll: () => {
    ['pms_v1_goals','pms_v1_kpis','pms_v1_tasks','pms_v1_appraisals',
     'pms_v1_approvals','pms_v1_notifications','pms_session','pms_id_counter']
    .forEach(k => localStorage.removeItem(k));
  },
};
