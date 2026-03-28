/**
 * parts/06_AssignmentPerf/MyAppraisal.jsx
 * Employee view of own appraisals — scorecard, parameter breakdown, comments.
 */
import { useState } from 'react';
import { Award, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { C, RATING_COLORS, ROLE_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const RATING_LABELS = { 5:'Outstanding', 4:'Exceeds', 3:'Meets', 2:'Below', 1:'Poor' };
const APPRAISAL_PARAMS = {
  'Work Quality': [
    { key:'accuracy',   label:'Accuracy & Thoroughness', weight:15 },
    { key:'output',     label:'Output & Productivity',   weight:15 },
    { key:'initiative', label:'Initiative & Ownership',  weight:10 },
  ],
  'Skills & Knowledge': [
    { key:'technical',    label:'Technical / Functional Skills', weight:15 },
    { key:'learning',     label:'Learning & Development',        weight:10 },
    { key:'problemsolve', label:'Problem Solving',               weight:10 },
  ],
  'Behaviour & Attitude': [
    { key:'teamwork',      label:'Teamwork & Collaboration',     weight:10 },
    { key:'communication', label:'Communication Skills',         weight:10 },
    { key:'attitude',      label:'Attitude & Professionalism',   weight:5  },
  ],
};

export default function MyAppraisal({ appraisals, currentUser, users }) {
  const [expanded, setExpanded] = useState({});
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const sorted = [...appraisals].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  const latest = sorted[0];

  if (appraisals.length === 0) return (
    <EmptyState icon="🏆" title="No appraisals yet"
      description="Your performance appraisal will appear here once your manager submits it."/>
  );

  const getManager = id => users.find(u => u.id === id);

  return (
    <div>
      {/* Latest appraisal hero */}
      {latest && (() => {
        const overall = latest.overallScore || 0;
        const oColor  = RATING_COLORS[Math.round(overall)] || C.muted;
        const mgr     = getManager(latest.conductedBy);
        return (
          <div style={{ background: `linear-gradient(135deg,${C.card},#1a2540)`, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px', marginBottom: 24, borderTop: `4px solid ${oColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Latest Appraisal · {latest.period}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 48, fontWeight: 800, color: oColor, lineHeight: 1 }}>{overall.toFixed(2)}</p>
                  <p style={{ fontSize: 16, color: C.muted }}>/5.00</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: oColor, marginTop: 4 }}>{RATING_LABELS[Math.round(overall)] || '—'}</p>
              </div>
              {mgr && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Appraised by</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <Avatar name={mgr.name} size={30} bg={ROLE_COLORS[mgr.role]}/>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{mgr.name}</p>
                      <p style={{ fontSize: 10, color: C.muted }}>{mgr.designation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Parameter preview bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, marginTop: 20 }}>
              {Object.values(APPRAISAL_PARAMS).flat().map(p => {
                const score = latest.scores?.[p.key] || 0;
                const sc    = RATING_COLORS[score] || C.faint;
                return (
                  <div key={p.key} style={{ background: `${C.surface}`, borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>{p.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc }}>{score || '—'}/5</span>
                    </div>
                    <div style={{ height: 4, background: C.faint, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(score/5)*100}%`, background: sc, borderRadius: 99 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* All appraisals list */}
      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>All Appraisals ({appraisals.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(apr => {
          const overall = apr.overallScore || 0;
          const oColor  = RATING_COLORS[Math.round(overall)] || C.muted;
          const open    = expanded[apr.id];
          const mgr     = getManager(apr.conductedBy);
          return (
            <div key={apr.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeft: `4px solid ${oColor}` }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggle(apr.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <code style={{ fontSize: 11, color: C.accent, background: `${C.accent}15`, padding: '2px 7px', borderRadius: 4 }}>{apr.id}</code>
                    <Badge label={apr.period} color={C.blue}/>
                    <Badge label={`${RATING_LABELS[Math.round(overall)] || '—'}`} color={oColor}/>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted }}>Conducted by {mgr?.name || '—'} · {new Date(apr.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: oColor }}>{overall.toFixed(1)}</p>
                  <p style={{ fontSize: 10, color: C.muted }}>/5.00</p>
                </div>
                {open ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
              </div>

              {open && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${C.border}` }}>
                  {/* Summary */}
                  {apr.summary && (
                    <div style={{ marginTop: 14, padding: '12px 14px', background: C.surface, borderRadius: 10, marginBottom: 10 }}>
                      <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>Summary</p>
                      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{apr.summary}</p>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {apr.strengths && (
                      <div style={{ padding: '10px 14px', background: `${C.green}08`, borderRadius: 10, border: `1px solid ${C.green}25` }}>
                        <p style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 4 }}>Strengths</p>
                        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{apr.strengths}</p>
                      </div>
                    )}
                    {apr.improvement && (
                      <div style={{ padding: '10px 14px', background: `${C.red}08`, borderRadius: 10, border: `1px solid ${C.red}25` }}>
                        <p style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 4 }}>Areas for Improvement</p>
                        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{apr.improvement}</p>
                      </div>
                    )}
                    {apr.goalsNext && (
                      <div style={{ padding: '10px 14px', background: `${C.blue}08`, borderRadius: 10, border: `1px solid ${C.blue}25`, gridColumn: '1/-1' }}>
                        <p style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginBottom: 4 }}>Goals for Next Period</p>
                        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{apr.goalsNext}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
