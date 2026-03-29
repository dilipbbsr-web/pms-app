/**
 * src/utils/storage.js
 * Supabase-powered data layer — replaces localStorage.
 */
import { supabase } from './supabase';

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
  Object.entries(obj).forEach(([k, v]) => {
    result[map[k] || k] = v;
  });
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
  Object.entries(obj).forEach(([k, v]) => {
    result[map[k] || k] = v;
  });
  return result;
};

const camelRows = rows => (rows || []).map(toCamel);

async function getAll(table) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) { console.error(`[PMS] getAll ${table}:`, error.message); return []; }
  return camelRows(data);
}

async function upsertRow(table, obj) {
  const row = toSnake({ ...obj, updatedAt: new Date().toISOString() });
  const { data, error } = await supabase.from(table).upsert(row, { onConflict: 'id' }).select().single();
  if (error) { console.error(`[PMS] upsert ${table}:`, error.message); return null; }
  return toCamel(data);
}

async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) { console.error(`[PMS] delete ${table}:`, error.message); return false; }
  return true;
}

export const Storage = {
  getUsers:        ()      => getAll('users'),
  upsertUser:      (u)     => upsertRow('users', u),
  deleteUser:      (id)    => deleteRow('users', id),
  loginUser: async (email, password) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
    if (error || !data) return null;
    return toCamel(data);
  },
  getGoals:        ()      => getAll('goals'),
  upsertGoal:      (g)     => upsertRow('goals', g),
  deleteGoal:      (id)    => deleteRow('goals', id),
  getKPIs:         ()      => getAll('kpis'),
  upsertKPI:       (k)     => upsertRow('kpis', k),
  deleteKPI:       (id)    => deleteRow('kpis', id),
  getTasks:        ()      => getAll('tasks'),
  upsertTask:      (t)     => upsertRow('tasks', t),
  deleteTask:      (id)    => deleteRow('tasks', id),
  getAppraisals:   ()      => getAll('appraisals'),
  upsertAppraisal: (a)     => upsertRow('appraisals', a),
  getApprovals:    ()      => getAll('approvals'),
  insertApproval: async (log) => {
    const row = toSnake({ ...log, reviewedAt: new Date().toISOString() });
    const { data, error } = await supabase.from('approvals').insert(row).select().single();
    if (error) { console.error('[PMS] insertApproval:', error.message); return null; }
    return toCamel(data);
  },
  getNotifications:   ()   => getAll('notifications'),
  upsertNotification: (n)  => upsertRow('notifications', n),
  deleteNotification: (id) => deleteRow('notifications', id),
  getSession:   ()     => { try { return JSON.parse(localStorage.getItem('pms_session')); } catch { return null; } },
  setSession:   (user) => localStorage.setItem('pms_session', JSON.stringify(user)),
  clearSession: ()     => localStorage.removeItem('pms_session'),
};
