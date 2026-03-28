/**
 * roles.js
 * Role definitions, labels, and permission matrix.
 * Import PERMISSIONS to do role-gate checks anywhere in the app.
 *
 * Usage:
 *   import { can } from '@constants/roles'
 *   if (can(currentUser.role, 'deleteEmployee')) { ... }
 */

// ─── Role keys & display labels ──────────────────────────────────
export const ROLES = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  employee:    'Employee',
};

// ─── Permission matrix ───────────────────────────────────────────
// true  = allowed
// false = not allowed
const MATRIX = {
  // ── User Management ────────────────────────────────────
  viewAllEmployees:       { super_admin: true,  admin: true,  employee: false },
  viewOwnProfile:         { super_admin: true,  admin: true,  employee: true  },
  addEmployee:            { super_admin: true,  admin: true,  employee: false },
  editEmployee:           { super_admin: true,  admin: true,  employee: false },
  editOwnProfile:         { super_admin: true,  admin: true,  employee: true  },
  deleteEmployee:         { super_admin: true,  admin: false, employee: false },
  deleteWithVerification: { super_admin: true,  admin: true,  employee: false },
  importEmployees:        { super_admin: true,  admin: true,  employee: false },
  exportEmployees:        { super_admin: true,  admin: true,  employee: false },
  changeRoles:            { super_admin: true,  admin: false, employee: false },

  // ── Department & Hierarchy ─────────────────────────────
  manageDepartments:      { super_admin: true,  admin: true,  employee: false },
  viewDeptHierarchy:      { super_admin: true,  admin: true,  employee: true  },

  // ── Goal Setting ───────────────────────────────────────
  setOwnGoals:            { super_admin: true,  admin: true,  employee: true  },
  viewTeamGoals:          { super_admin: true,  admin: true,  employee: false },
  approveGoals:           { super_admin: true,  admin: true,  employee: false },
  editAnyGoal:            { super_admin: true,  admin: false, employee: false },

  // ── KPI / KRA ──────────────────────────────────────────
  manageKPITemplates:     { super_admin: true,  admin: true,  employee: false },
  viewOwnKPI:             { super_admin: true,  admin: true,  employee: true  },
  viewTeamKPI:            { super_admin: true,  admin: true,  employee: false },
  enterKPIActuals:        { super_admin: true,  admin: true,  employee: true  },

  // ── Task Evaluation ────────────────────────────────────
  assignTasks:            { super_admin: true,  admin: true,  employee: false },
  viewOwnTasks:           { super_admin: true,  admin: true,  employee: true  },
  markTaskComplete:       { super_admin: true,  admin: true,  employee: true  },
  evaluateTasks:          { super_admin: true,  admin: true,  employee: false },

  // ── Performance Evaluation ─────────────────────────────
  conductAppraisal:       { super_admin: true,  admin: true,  employee: false },
  viewOwnAppraisal:       { super_admin: true,  admin: true,  employee: true  },
  viewTeamAppraisals:     { super_admin: true,  admin: true,  employee: false },
  finalizeAppraisal:      { super_admin: true,  admin: false, employee: false },

  // ── Approval Workflow ──────────────────────────────────
  approveL1:              { super_admin: true,  admin: true,  employee: false },
  approveL2:              { super_admin: true,  admin: true,  employee: false },
  approveL3:              { super_admin: true,  admin: false, employee: false },

  // ── Dashboard ──────────────────────────────────────────
  viewOrgDashboard:       { super_admin: true,  admin: true,  employee: false },
  viewDeptDashboard:      { super_admin: true,  admin: true,  employee: false },
  viewOwnDashboard:       { super_admin: true,  admin: true,  employee: true  },

  // ── Reports ────────────────────────────────────────────
  exportReports:          { super_admin: true,  admin: true,  employee: false },
  viewOwnReport:          { super_admin: true,  admin: true,  employee: true  },
  scheduleReports:        { super_admin: true,  admin: false, employee: false },

  // ── Notifications ──────────────────────────────────────
  sendNotifications:      { super_admin: true,  admin: true,  employee: false },
  viewNotifications:      { super_admin: true,  admin: true,  employee: true  },
};

/**
 * Check if a role has a specific permission.
 * @param {string} role       - 'super_admin' | 'admin' | 'employee'
 * @param {string} permission - key from MATRIX
 * @returns {boolean}
 */
export function can(role, permission) {
  if (!MATRIX[permission]) {
    console.warn(`[PMS] Unknown permission: "${permission}"`);
    return false;
  }
  return MATRIX[permission][role] === true;
}

/**
 * Returns all permissions a role has.
 * @param {string} role
 * @returns {string[]}
 */
export function permissionsFor(role) {
  return Object.entries(MATRIX)
    .filter(([, m]) => m[role] === true)
    .map(([key]) => key);
}
