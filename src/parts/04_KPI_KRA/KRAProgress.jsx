/**
 * parts/04_KPI_KRA/KRAProgress.jsx
 * Groups KPI entries by KRA and shows rolled-up achievement per KRA.
 */

import { C, RATING_COLORS } from '@constants/theme';
import { DEFAULT_KRAS } from '@constants/departments';
import { EmptyState } from '@components/common';

export function KRAProgress({ kpis, currentUser }) {
  const kras = DEFAULT_KRAS[currentUser.designation] || [];

  if (kpis.length === 0) return (
    <EmptyState icon="🎯" title="No KPI data yet" description="Add KPI entries linked to KRAs to see progress here."/>
  );

  const kraRollup = kras.map(kra => {
    const linked = kpis.filter(k => k.kraLink === kra);
    const avg    = linked.length
      ? Math.round(linked.reduce((s, k) => s + (k.achievement || 0), 0) / linked.length)
      : 0;
    const avgRating = linked.length
      ? parseFloat((linked.reduce((s, k) => s + (k.rating || 0), 0) / linked.length).toFixed(1))
      : 0;
    return { kra, linked, avg, avgRating };
  });

  const unlinked = kpis.filter(k => !k.kraLink || !kras.includes(k.kraLink));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: C.muted }}>KRA achievement for <strong style={{ color: C.text }}>{currentUser.designation}</strong></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {kraRollup.map(({ kra, linked, avg, avgRating }) => {
          const rColor = RATING_COLORS[Math.round(avgRating)] || C.muted;
          return (
            <div key={kra} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', borderLeft: `4px solid ${rColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{kra}</p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{linked.length} KPI{linked.length !== 1 ? 's' : ''} linked</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: rColor }}>{avg}%</p>
                  {avgRating > 0 && <p style={{ fontSize: 11, color: rColor }}>Rating: {avgRating}/5</p>}
                </div>
              </div>

              {/* Achievement bar */}
              <div style={{ height: 8, background: C.faint, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${Math.min(avg, 100)}%`, background: rColor, borderRadius: 99, transition: 'width .6s ease' }}/>
              </div>

              {/* Linked KPIs */}
              {linked.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {linked.map(k => (
                    <div key={k.id} style={{ background: C.surface, borderRadius: 8, padding: '6px 12px', fontSize: 11, color: C.text }}>
                      <span style={{ color: C.muted }}>{k.kpiName}</span>
                      <span style={{ color: RATING_COLORS[k.rating] || C.muted, fontWeight: 700, marginLeft: 6 }}>{k.achievement || 0}%</span>
                    </div>
                  ))}
                </div>
              )}
              {linked.length === 0 && (
                <p style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>No KPIs linked to this KRA yet</p>
              )}
            </div>
          );
        })}

        {/* Unlinked KPIs */}
        {unlinked.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8 }}>Unlinked KPIs ({unlinked.length})</p>
            {unlinked.map(k => (
              <p key={k.id} style={{ fontSize: 12, color: C.muted, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>{k.kpiName} — {k.achievement || 0}% achieved</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * DeptKPIs.jsx — Manager/Admin view of all dept KPIs with employee comparison
 */
export function DeptKPIs({ kpis, users, currentUser }) {
  const getUser = id => users.find(u => u.id === id);

  if (kpis.length === 0) return (
    <EmptyState icon="🏢" title="No dept KPI data" description="Employees in this department haven't logged KPIs yet."/>
  );

  // Group by employee
  const empIds = [...new Set(kpis.map(k => k.employeeId))];

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        {kpis.length} KPI entries across {empIds.length} employee{empIds.length !== 1 ? 's' : ''} in your department
      </p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
              {['Employee', 'KPI', 'Period', 'Target', 'Actual', 'Achievement', 'Rating'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kpis.map((k, i) => {
              const emp    = getUser(k.employeeId);
              const rColor = RATING_COLORS[k.rating] || C.muted;
              return (
                <tr key={k.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}
                  onMouseOver={e => e.currentTarget.style.background = `${C.accent}07`}
                  onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? C.card : C.surface}>
                  <td style={{ padding: '11px 16px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{emp?.name || '—'}</p>
                    <p style={{ fontSize: 10, color: C.muted }}>{emp?.designation || ''}</p>
                  </td>
                  <td style={{ padding: '11px 16px', color: C.text, fontSize: 12, maxWidth: 180 }}>{k.kpiName}</td>
                  <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{k.period} · {k.quarter}</td>
                  <td style={{ padding: '11px 16px', color: C.text, fontSize: 12 }}>{k.targetValue} {k.metricUnit}</td>
                  <td style={{ padding: '11px 16px', color: k.actualValue ? C.text : C.faint, fontSize: 12 }}>{k.actualValue || '—'} {k.actualValue ? k.metricUnit : ''}</td>
                  <td style={{ padding: '11px 16px', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(k.achievement || 0, 100)}%`, background: rColor, borderRadius: 99 }}/>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: rColor, minWidth: 32 }}>{k.achievement || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 800, color: rColor }}>{k.rating || '—'}</span>
                    <span style={{ fontSize: 10, color: rColor, marginLeft: 3 }}>/5</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Scorecard.jsx — Weighted overall performance scorecard
 */
export function Scorecard({ kpis, currentUser, users, allKpis }) {
  if (kpis.length === 0) return (
    <EmptyState icon="🏆" title="No scorecard data" description="Add KPI entries to generate your performance scorecard."/>
  );

  const totalWeight  = kpis.reduce((s, k) => s + (k.weight || 0), 0);
  const weightedScore= totalWeight > 0
    ? kpis.reduce((s, k) => s + ((k.rating || 0) * (k.weight || 0)), 0) / totalWeight
    : 0;
  const overall = parseFloat(weightedScore.toFixed(2));
  const overallColor = RATING_COLORS[Math.round(overall)] || C.muted;
  const LABELS = { 5: 'Outstanding', 4: 'Exceeds Expectations', 3: 'Meets Expectations', 2: 'Below Expectations', 1: 'Needs Improvement' };

  return (
    <div>
      {/* Overall score hero */}
      <div style={{ background: `linear-gradient(135deg,${C.card},#1a2540)`, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28, borderTop: `4px solid ${overallColor}` }}>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: `${overallColor}15`, borderRadius: 16, border: `1px solid ${overallColor}30` }}>
          <p style={{ fontSize: 11, color: overallColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Overall Score</p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 48, fontWeight: 800, color: overallColor, lineHeight: 1 }}>{overall}</p>
          <p style={{ fontSize: 11, color: overallColor, marginTop: 4 }}>out of 5.00</p>
        </div>
        <div>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: overallColor, marginBottom: 6 }}>{LABELS[Math.round(overall)] || 'No Rating'}</p>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Based on <strong style={{ color: C.text }}>{kpis.length} KPI{kpis.length !== 1 ? 's' : ''}</strong> with total weight of <strong style={{ color: C.text }}>{totalWeight}%</strong></p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{currentUser.designation} · {currentUser.dept}</p>
        </div>
      </div>

      {/* KPI breakdown */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700 }}>KPI Breakdown</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {['KPI', 'KRA', 'Period', 'Achievement', 'Rating', 'Weight', 'Weighted Score'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kpis.map((k, i) => {
              const rColor  = RATING_COLORS[k.rating] || C.muted;
              const wScore  = ((k.rating || 0) * (k.weight || 0) / 100).toFixed(2);
              return (
                <tr key={k.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}>
                  <td style={{ padding: '10px 16px', color: C.text, fontSize: 12, maxWidth: 180 }}>{k.kpiName}</td>
                  <td style={{ padding: '10px 16px', color: C.purple, fontSize: 11 }}>{k.kraLink || '—'}</td>
                  <td style={{ padding: '10px 16px', color: C.muted, fontSize: 11 }}>{k.quarter} {k.year}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 5, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(k.achievement || 0, 100)}%`, background: rColor, borderRadius: 99 }}/>
                      </div>
                      <span style={{ fontSize: 11, color: rColor, fontWeight: 600 }}>{k.achievement || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: rColor }}>{k.rating || '—'}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>/5</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: C.muted, fontSize: 12 }}>{k.weight}%</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700, color: rColor }}>{wScore}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.surface, borderTop: `2px solid ${C.border}` }}>
              <td colSpan={5} style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: C.text }}>Weighted Total</td>
              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.accent }}>{totalWeight}%</td>
              <td style={{ padding: '12px 16px', fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 800, color: overallColor }}>{overall}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default KRAProgress;
