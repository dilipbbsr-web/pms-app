/**
 * parts/04_KPI_KRA/MyKPIs.jsx
 * Employee's own KPI entries — table + card view with
 * achievement %, rating badge, period filter, edit/delete.
 */

import { useState } from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { C, RATING_COLORS } from '@constants/theme';
import { ActionBtn, Badge, EmptyState } from '@components/common';

const RATING_LABELS = { 5: 'Outstanding', 4: 'Exceeds Expectations', 3: 'Meets Expectations', 2: 'Below Expectations', 1: 'Poor', 0: 'No Data' };
const PERIOD_OPTS   = ['All', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

export default function MyKPIs({ kpis, currentUser, users, onEdit, onDelete }) {
  const [periodF, setPeriodF] = useState('All');
  const [yearF,   setYearF]   = useState('');

  const years    = [...new Set(kpis.map(k => k.year))].sort().reverse();
  const filtered = kpis.filter(k =>
    (periodF === 'All' || k.period === periodF) &&
    (!yearF || k.year === yearF)
  );

  if (kpis.length === 0) return (
    <EmptyState icon="📊" title="No KPI entries yet"
      description="Click 'Add KPI Entry' to start logging your performance metrics."/>
  );

  // Summary metrics
  const avg = kpis.length ? (kpis.reduce((s, k) => s + (k.rating || 0), 0) / kpis.length).toFixed(1) : 0;
  const achieved = kpis.filter(k => k.achievement >= 100).length;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total KPIs',    val: kpis.length,                      color: C.blue    },
          { label: 'Avg Rating',    val: `${avg}/5`,                        color: RATING_COLORS[Math.round(avg)] || C.accent },
          { label: 'Target Achieved', val: achieved,                        color: C.green   },
          { label: 'Pending',       val: kpis.filter(k => !k.actualValue).length, color: C.muted },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', borderTop: `3px solid ${color}` }}>
            <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {PERIOD_OPTS.map(p => (
          <button key={p} onClick={() => setPeriodF(p)}
            style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${periodF === p ? C.accent : C.border}`, background: periodF === p ? `${C.accent}18` : 'none', color: periodF === p ? C.accent : C.muted, fontSize: 12, fontWeight: periodF === p ? 600 : 400, cursor: 'pointer' }}>
            {p}
          </button>
        ))}
        {years.length > 0 && (
          <select value={yearF} onChange={e => setYearF(e.target.value)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '5px 12px', color: yearF ? C.text : C.muted, fontSize: 12, outline: 'none', marginLeft: 4 }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>{filtered.length} entries</span>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && <p style={{ color: C.muted, textAlign: 'center', padding: 32, fontSize: 13 }}>No KPIs match this filter</p>}
        {filtered.map(kpi => {
          const rating = kpi.rating || 0;
          const rColor = RATING_COLORS[rating] || C.muted;
          const pct    = Math.min(kpi.achievement || 0, 100);
          const trend  = (kpi.achievement || 0) >= 100 ? 'up' : (kpi.achievement || 0) >= 70 ? 'flat' : 'down';

          return (
            <div key={kpi.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${rColor}` }}>
              {/* KPI info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <code style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, padding: '2px 7px', borderRadius: 4 }}>{kpi.id}</code>
                  <Badge label={kpi.period} color={C.blue}/>
                  <Badge label={kpi.quarter} color={C.teal || C.blue}/>
                  <Badge label={kpi.year} color={C.muted}/>
                  {kpi.kraLink && <Badge label={`KRA: ${kpi.kraLink}`} color={C.purple}/>}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{kpi.kpiName}</p>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      Actual: <strong style={{ color: C.text }}>{kpi.actualValue || '—'}</strong> / Target: <strong style={{ color: C.text }}>{kpi.targetValue}</strong> {kpi.metricUnit}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: rColor }}>{kpi.achievement || 0}% achieved</span>
                  </div>
                  <div style={{ height: 7, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${rColor},${C.blue})`, borderRadius: 99, transition: 'width .6s ease' }}/>
                  </div>
                </div>

                {kpi.notes && <p style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic' }}>{kpi.notes}</p>}
              </div>

              {/* Rating block */}
              <div style={{ textAlign: 'center', minWidth: 90, padding: '10px 14px', background: `${rColor}12`, borderRadius: 12, border: `1px solid ${rColor}30` }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: rColor }}>
                  {trend === 'up' ? <TrendingUp size={16}/> : trend === 'down' ? <TrendingDown size={16}/> : <Minus size={16}/>}
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: rColor }}>{rating || '—'}</p>
                <p style={{ fontSize: 10, color: rColor, fontWeight: 600, lineHeight: 1.3 }}>{RATING_LABELS[rating]}</p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Wt: {kpi.weight}%</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ActionBtn icon={<Edit2 size={13}/>}  color={C.accent} title="Edit"   onClick={() => onEdit(kpi)}/>
                <ActionBtn icon={<Trash2 size={13}/>} color={C.red}    title="Delete" onClick={() => onDelete(kpi.id)}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
