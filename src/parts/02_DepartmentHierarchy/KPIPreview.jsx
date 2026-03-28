/**
 * parts/02_DepartmentHierarchy/KPIPreview.jsx
 * KPI categories and KRA list for a department — read-only preview.
 * Full editing comes in Part 4 (KPI/KRA module).
 */

import { BarChart2, Target, ChevronRight } from 'lucide-react';
import { C, DEPT_COLORS } from '@constants/theme';
import { KPI_CATEGORIES, DEPT_HIERARCHY, DEFAULT_KRAS } from '@constants/departments';

export default function KPIPreview({ dept, onBack }) {
  const color   = DEPT_COLORS[dept] || C.accent;
  const kpis    = KPI_CATEGORIES[dept] || [];
  const levels  = DEPT_HIERARCHY[dept]  || [];

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={onBack}
          style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 17, fontWeight: 700 }}>{dept} — KPIs &amp; KRAs</h3>
          <p style={{ fontSize: 12, color: C.muted }}>Performance metrics catalogue for this department</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* KPI list */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, borderTop: `3px solid ${color}` }}>
            <BarChart2 size={15} color={color} />
            <h4 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700 }}>KPI Categories</h4>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{kpis.length} metrics</span>
          </div>
          {kpis.map((kpi, i) => (
            <div key={kpi} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text }}>{kpi}</span>
              </div>
              <span style={{ fontSize: 11, color: C.muted }}>Configure in Part 4</span>
            </div>
          ))}
        </div>

        {/* KRA list per designation */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, borderTop: `3px solid ${C.purple}` }}>
            <Target size={15} color={C.purple} />
            <h4 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700 }}>Default KRAs by Designation</h4>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {levels.map(({ title }) => {
              const kras = DEFAULT_KRAS[title] || [];
              if (!kras.length) return null;
              return (
                <div key={title} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {kras.map(kra => (
                      <span key={kra} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${C.purple}15`, color: C.purple, border: `1px solid ${C.purple}30` }}>
                        {kra}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
