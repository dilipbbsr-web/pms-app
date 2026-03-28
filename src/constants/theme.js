/**
 * theme.js
 * Single source of truth for all color tokens, spacing, and design constants.
 * Imported by every component in the system — change here, applies everywhere.
 */

export const C = {
  // ── Backgrounds ──────────────────────────────────────
  bg:      '#0F1117',   // Page background (darkest)
  surface: '#161B27',   // Sidebar / panels
  card:    '#1E2535',   // Card surfaces
  cardAlt: '#222B3D',   // Alternate card (subtle stripe)

  // ── Borders ──────────────────────────────────────────
  border:  '#2A3348',
  borderHover: '#3D4F6A',

  // ── Text ─────────────────────────────────────────────
  text:    '#E2E8F0',   // Primary text
  muted:   '#64748B',   // Secondary / label text
  faint:   '#334155',   // Disabled / placeholder

  // ── Brand accent ─────────────────────────────────────
  accent:     '#F59E0B',   // Amber — primary CTA
  accentDim:  '#B45309',   // Gradient end / hover

  // ── Semantic ─────────────────────────────────────────
  blue:    '#3B82F6',
  blueDim: '#1D4ED8',
  green:   '#10B981',
  red:     '#EF4444',
  purple:  '#8B5CF6',
  teal:    '#14B8A6',
  orange:  '#F97316',
  pink:    '#EC4899',
};

/** Role → brand colour mapping */
export const ROLE_COLORS = {
  super_admin: C.purple,
  admin:       C.blue,
  employee:    C.green,
};

/** Status → brand colour mapping */
export const STATUS_COLORS = {
  active:   C.green,
  inactive: C.red,
  pending:  C.accent,
  approved: C.green,
  rejected: C.red,
  draft:    C.muted,
};

/** Department → accent colour mapping (used on dept cards) */
export const DEPT_COLORS = {
  'Human Resources':      C.pink,
  'Software Development': C.blue,
  'Sales & Service':      C.orange,
  'IT Infrastructure':    C.teal,
  'BPO / KPO':            C.purple,
  'Administration':       C.accent,
};

/** Priority colours for goals / tasks */
export const PRIORITY_COLORS = {
  high:   C.red,
  medium: C.accent,
  low:    C.green,
};

/** KPI rating → colour */
export const RATING_COLORS = {
  5: C.green,
  4: C.teal,
  3: C.accent,
  2: C.orange,
  1: C.red,
};
