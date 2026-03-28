/**
 * components/layout/Topbar.jsx
 * Sticky top bar — page title, notifications bell, current user info.
 */

import { useState } from 'react';
import { Bell, Plus, Search } from 'lucide-react';
import { C, ROLE_COLORS } from '@constants/theme';
import { ROLES } from '@constants/roles';
import { Avatar, Badge } from '@components/common';

export default function Topbar({ currentUser, pageTitle, pageSubtitle, primaryAction, notifications = [] }) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      padding: '14px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {/* Left — page title */}
      <div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 700, color: C.text }}>{pageTitle}</h1>
        {pageSubtitle && <p style={{ fontSize: '11px', color: C.muted, marginTop: 1 }}>{pageSubtitle}</p>}
      </div>

      {/* Right — actions + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Primary action button (optional) */}
        {primaryAction && (
          <button onClick={primaryAction.onClick}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg,${C.accent},${C.accentDim})`,
              color: '#fff', fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              boxShadow: `0 3px 10px ${C.accent}40`,
            }}>
            {primaryAction.icon || <Plus size={15} />}
            {primaryAction.label}
          </button>
        )}

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(s => !s)}
            style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.card, color: C.muted, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', position: 'relative',
            }}>
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                borderRadius: '50%', background: C.red, border: `2px solid ${C.surface}`,
              }} />
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div style={{
              position: 'absolute', top: 44, right: 0, width: 300,
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: '13px' }}>
                Notifications {unread > 0 && <Badge label={`${unread} new`} color={C.red} />}
              </div>
              {notifications.length === 0 ? (
                <p style={{ padding: '20px 16px', color: C.muted, fontSize: '13px', textAlign: 'center' }}>No notifications</p>
              ) : notifications.slice(0, 5).map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: n.read ? 'transparent' : `${C.accent}08` }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: C.text }}>{n.title}</p>
                  <p style={{ fontSize: '11px', color: C.muted, marginTop: 2 }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 12px',
        }}>
          <Avatar name={currentUser.name} size={24} bg={ROLE_COLORS[currentUser.role]} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{currentUser.name}</span>
          <Badge label={ROLES[currentUser.role]} color={ROLE_COLORS[currentUser.role]} />
        </div>
      </div>
    </header>
  );
}
