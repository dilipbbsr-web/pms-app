/**
 * parts/02_DepartmentHierarchy/HierarchyTree.jsx
 * Visual org hierarchy for a selected department:
 *  — Groups designations by hierarchy level (L1→L6)
 *  — Shows real employees mapped under each designation
 *  — Approval chain callout (L1 → L2 → L3)
 *  — Expandable designation nodes
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Award, GitBranch, ArrowRight } from 'lucide-react';
import { C, ROLE_COLORS, DEPT_COLORS } from '@constants/theme';
import { DEPT_HIERARCHY, APPROVAL_CHAIN, DEFAULT_KRAS } from '@constants/departments';
import { ROLES } from '@constants/roles';
import { Avatar, Badge } from '@components/common';

const LEVEL_LABELS = {
  1: 'Leadership',
  2: 'Management',
  3: 'Senior',
  4: 'Mid-Level',
  5: 'Junior',
  6: 'Intern',
};

const LEVEL_COLORS = {
  1: '#8B5CF6',  // purple
  2: '#3B82F6',  // blue
  3: '#14B8A6',  // teal
  4: '#F59E0B',  // amber
  5: '#10B981',  // green
  6: '#64748B',  // muted
};

export default function HierarchyTree({ dept, users, onBack }) {
  const [expandedDesig, setExpandedDesig] = useState({});
  const deptColor = DEPT_COLORS[dept] || C.accent;
  const hierarchy = DEPT_HIERARCHY[dept] || [];
  const approval  = APPROVAL_CHAIN[dept]  || {};
  const deptUsers = users.filter(u => u.dept === dept);

  // Group designations by level
  const byLevel = hierarchy.reduce((acc, item) => {
    if (!acc[item.level]) acc[item.level] = [];
    acc[item.level].push(item);
    return acc;
  }, {});

  const levels = Object.keys(byLevel).map(Number).sort();

  const toggleDesig = (title) =>
    setExpandedDesig(p => ({ ...p, [title]: !p[title] }));

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>

      {/* Back + dept header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: deptColor }} />
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800 }}>{dept}</h2>
            <span style={{ fontSize: 13, color: C.muted }}>— {deptUsers.length} employees</span>
          </div>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Organisation hierarchy · {levels.length} levels</p>
        </div>
      </div>

      {/* Approval chain banner */}
      <div style={{ background: `${C.purple}10`, border: `1px solid ${C.purple}30`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <GitBranch size={15} color={C.purple} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>3-Level Approval Chain</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {['L1', 'L2', 'L3'].map((key, i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: C.card, border: `1px solid ${C.purple}40`, borderRadius: 10, padding: '8px 16px' }}>
                <p style={{ fontSize: 10, color: C.purple, fontWeight: 600, marginBottom: 2 }}>{key}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{approval[key] || '—'}</p>
              </div>
              {i < 2 && <ArrowRight size={16} color={C.purple} style={{ opacity: 0.5 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Hierarchy levels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {levels.map(level => (
          <div key={level}>
            {/* Level header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: `${LEVEL_COLORS[level]}20`, color: LEVEL_COLORS[level],
                border: `1px solid ${LEVEL_COLORS[level]}40`,
              }}>
                Level {level} — {LEVEL_LABELS[level]}
              </div>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted }}>{byLevel[level].length} designation{byLevel[level].length > 1 ? 's' : ''}</span>
            </div>

            {/* Designation nodes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingLeft: level * 16 }}>
              {byLevel[level].map(({ title, category }) => {
                const empls   = deptUsers.filter(u => u.designation === title);
                const kras    = DEFAULT_KRAS[title] || [];
                const open    = expandedDesig[title];

                return (
                  <div key={title}
                    style={{
                      background: C.card, border: `1px solid ${open ? LEVEL_COLORS[level] : C.border}`,
                      borderRadius: 12, overflow: 'hidden',
                      width: 'calc(50% - 6px)', minWidth: 260,
                      transition: 'border .2s',
                    }}>

                    {/* Designation header */}
                    <div
                      onClick={() => toggleDesig(title)}
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: open ? `${LEVEL_COLORS[level]}08` : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: LEVEL_COLORS[level], flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</p>
                          <p style={{ fontSize: 11, color: C.muted }}>{category} · {empls.length} employee{empls.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {empls.length > 0 && (
                          <div style={{ display: 'flex' }}>
                            {empls.slice(0, 3).map((u, i) => (
                              <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -6, border: `1.5px solid ${C.card}`, borderRadius: '50%' }}>
                                <Avatar name={u.name} size={22} bg={ROLE_COLORS[u.role]} />
                              </div>
                            ))}
                          </div>
                        )}
                        {open ? <ChevronDown size={15} color={C.muted} /> : <ChevronRight size={15} color={C.muted} />}
                      </div>
                    </div>

                    {/* Expanded: employees + KRAs */}
                    {open && (
                      <div style={{ borderTop: `1px solid ${C.border}` }}>
                        {/* Employees */}
                        {empls.length > 0 ? (
                          <div style={{ padding: '10px 16px' }}>
                            <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>Employees</p>
                            {empls.map(u => (
                              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Avatar name={u.name} size={26} bg={ROLE_COLORS[u.role]} />
                                  <div>
                                    <p style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{u.name}</p>
                                    <p style={{ fontSize: 10, color: C.muted }}>{u.id}</p>
                                  </div>
                                </div>
                                <Badge
                                  label={u.status === 'active' ? 'Active' : 'Inactive'}
                                  color={u.status === 'active' ? C.green : C.red}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '10px 16px' }}>
                            <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No employees assigned yet</p>
                          </div>
                        )}

                        {/* KRAs */}
                        {kras.length > 0 && (
                          <div style={{ padding: '10px 16px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
                            <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Default KRAs</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {kras.map(kra => (
                                <span key={kra} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${LEVEL_COLORS[level]}15`, color: LEVEL_COLORS[level], border: `1px solid ${LEVEL_COLORS[level]}30` }}>
                                  {kra}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
