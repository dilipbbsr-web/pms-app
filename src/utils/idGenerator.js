/**
 * utils/idGenerator.js
 * Generates sequential employee IDs: EMP-0001, EMP-0002 …
 * Counter persisted in localStorage so IDs never repeat across sessions.
 */

const COUNTER_KEY = 'pms_id_counter';

function getCounter() {
  const stored = localStorage.getItem(COUNTER_KEY);
  return stored ? parseInt(stored, 10) : 1;
}

function saveCounter(n) {
  localStorage.setItem(COUNTER_KEY, String(n));
}

export function generateEmployeeId() {
  const n = getCounter();
  saveCounter(n + 1);
  return `EMP-${String(n).padStart(4, '0')}`;
}

/** Peek at the next ID without incrementing */
export function peekNextId() {
  return `EMP-${String(getCounter()).padStart(4, '0')}`;
}

/** Seed/reset counter (used when importing bulk data) */
export function setIdCounter(n) {
  saveCounter(n);
}
