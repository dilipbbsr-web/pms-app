/**
 * utils/storage.js
 * Typed localStorage wrappers with JSON serialisation, error handling,
 * and a version key so stale data is cleared on schema changes.
 */

const VERSION    = 'pms_v1';
const KEYS = {
  users:        `${VERSION}_users`,
  departments:  `${VERSION}_departments`,
  goals:        `${VERSION}_goals`,
  kpis:         `${VERSION}_kpis`,
  tasks:        `${VERSION}_tasks`,
  appraisals:   `${VERSION}_appraisals`,
  approvals:    `${VERSION}_approvals`,
  notifications:`${VERSION}_notifications`,
  session:      `${VERSION}_session`,
};

export { KEYS };

// ─── Generic get / set / remove ──────────────────────────────────
export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error('[PMS Storage] Failed to write key:', key);
    return false;
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

// ─── Typed helpers ────────────────────────────────────────────────
import { DEMO_PASSWORDS } from '@data/demoPasswords';

export const Storage = {
  getUsers: () => {
    const users = getItem(KEYS.users, []);
    // Attach demo passwords at runtime (not stored in source)
    return users.map(u => ({
      ...u, // spread existing user properties
      password: u.password || DEMO_PASSWORDS[u.id] || 'Change@123',
    }));
  }
};

  setUsers:          (v) => setItem(KEYS.users, v),

  getGoals;         ()  => getItem(KEYS.goals, []),
  setGoals;          (v) => setItem(KEYS.goals, v),

  getKPIs;           ()  => getItem(KEYS.kpis, []),
  setKPIs;           (v) => setItem(KEYS.kpis, v),

  getTasks;          ()  => getItem(KEYS.tasks, []),
  setTasks;          (v) => setItem(KEYS.tasks, v),

  getAppraisals;     ()  => getItem(KEYS.appraisals, []),
  setAppraisals;     (v) => setItem(KEYS.appraisals, v),

  getApprovals;      ()  => getItem(KEYS.approvals, []),
  setApprovals;      (v) => setItem(KEYS.approvals, v),

  getNotifications; ()  => getItem(KEYS.notifications, []),
  setNotifications;  (v) => setItem(KEYS.notifications, v),

  getSession;       ()  => getItem(KEYS.session, null),
  setSession;        (v) => setItem(KEYS.session, v),
  clearSession;      ()  => removeItem(KEYS.session),

  /** Clears ALL PMS data — used for factory reset / testing */
  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('pms_id_counter');
  },
};
