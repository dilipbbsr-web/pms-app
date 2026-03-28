/**
 * parts/06_AssignmentPerf/FeedbackForm.jsx
 * 360° peer feedback — employee rates colleagues anonymously.
 */
import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, User } from 'lucide-react';
import { C, ROLE_COLORS, RATING_COLORS } from '@constants/theme';
import { Avatar, Badge, EmptyState } from '@components/common';

const FEEDBACK_PARAMS = [
  { key: 'collaboration', label: 'Collaboration & Teamwork'   },
  { key: 'communication', label: 'Communication Skills'        },
  { key: 'reliability',   label: 'Reliability & Dependability' },
  { key: 'initiative',    label: 'Initiative & Proactiveness'  },
  { key: 'attitude',      label: 'Positive Attitude'           },
];

const RATING_LABELS = { 5:'Excellent', 4:'Good', 3:'Average', 2:'Below Average', 1:'Poor' };

let _fid = Date.now() + 4000;
const genFeedbackId = () => `FB-${String(++_fid).slice(-6)}`;

export default function FeedbackForm({ currentUser, users, appraisals, onSave }) {
  const [selectedEmp, setSelectedEmp]   = useState('');
  const [ratings,     setRatings]       = useState({});
  const [comment,     setComment]       = useState('');
  const [submitted,   setSubmitted]     = useState(false);
  const [error,       setError]         = useState('');

  // Peers — same dept, not self
  const peers = users.filter(u => u.id !== currentUser.id && u.status === 'active' &&
    (currentUser.role === 'super_admin' || u.dept === currentUser.dept));

  const emp = users.find(u => u.id === selectedEmp);
  const filledCount = Object.keys(ratings).length;

  const handleSubmit = () => {
    if (!selectedEmp) { setError('Please select a colleague'); return; }
    if (filledCount < FEEDBACK_PARAMS.length) { setError('Please rate all parameters'); return; }
    setError('');
    // Attach to existing appraisal or create standalone feedback
    const existingApr = appraisals.find(a => a.employeeId === selectedEmp);
    const feedback = {
      ...(existingApr || {}),
      id: existingApr?.id || genFeedbackId(),
      employeeId: selectedEmp,
      conductedBy: currentUser.id,
      period: 'Peer Feedback',
      scores: ratings,
      overallScore: parseFloat((Object.values(ratings).reduce((s,v)=>s+v,0)/FEEDBACK_PARAMS.length).toFixed(2)),
      summary: comment,
      status: 'peer_feedback',
      createdAt: existingApr?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(feedback);
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <CheckCircle size={48} color={C.green} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.9 }}/>
      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Feedback Submitted!</h3>
      <p style={{ color: C.muted, fontSize: 13 }}>Your anonymous feedback has been recorded for {emp?.name}.</p>
      <button onClick={() => { setSubmitted(false); setSelectedEmp(''); setRatings({}); setComment(''); }}
        style={{ marginTop: 20, padding: '9px 22px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
        Submit Another
      </button>
    </div>
  );

  if (peers.length === 0) return (
    <EmptyState icon="👥" title="No peers to evaluate" description="You need colleagues in the same department to give 360° feedback."/>
  );

  return (
    <div>
      <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}25`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={14} color={C.blue}/>
        <p style={{ fontSize: 12, color: C.muted }}>Your feedback is <strong style={{ color: C.text }}>anonymous</strong> and will only be seen in aggregate by HR. Be honest and constructive.</p>
      </div>

      {/* Peer selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
          Select Colleague <span style={{ color: C.red }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {peers.map(u => (
            <button key={u.id} onClick={() => { setSelectedEmp(u.id); setRatings({}); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1px solid ${selectedEmp===u.id?C.accent:C.border}`, background: selectedEmp===u.id?`${C.accent}15`:C.card, cursor: 'pointer', transition: 'all .15s' }}>
              <Avatar name={u.name} size={26} bg={ROLE_COLORS[u.role]}/>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{u.name}</p>
                <p style={{ fontSize: 10, color: C.muted }}>{u.designation}</p>
              </div>
            </button>
          ))}
        </div>
        {error && !selectedEmp && <p style={{ color: C.red, fontSize: 11, marginTop: 6 }}>{error}</p>}
      </div>

      {/* Parameters */}
      {selectedEmp && (
        <>
          <h4 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
            Rate {emp?.name?.split(' ')[0]}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {FEEDBACK_PARAMS.map(param => {
              const r = ratings[param.key] || 0;
              const rColor = RATING_COLORS[r] || C.muted;
              return (
                <div key={param.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.text }}>{param.label}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setRatings(p => ({...p,[param.key]:n}))} type="button"
                        style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${r>=n?rColor:C.border}`, background: r>=n?`${rColor}20`:'none', color: r>=n?rColor:C.faint, fontSize: 15, cursor: 'pointer', transition: 'all .1s' }}>
                        ★
                      </button>
                    ))}
                  </div>
                  {r > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: rColor, minWidth: 60 }}>{RATING_LABELS[r]}</span>}
                </div>
              );
            })}
          </div>

          {error && filledCount < FEEDBACK_PARAMS.length && <p style={{ color: C.red, fontSize: 11, marginBottom: 10 }}>{error}</p>}

          {/* Comment */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Comments (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
              placeholder="Any specific feedback you'd like to share…"
              style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, resize: 'none', outline: 'none', fontFamily: '"DM Sans",sans-serif' }}
              onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}/>
          </div>

          <button onClick={handleSubmit}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${C.accent},${C.accentDim})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${C.accent}40` }}>
            <Send size={14}/> Submit Feedback
          </button>
        </>
      )}
    </div>
  );
}
