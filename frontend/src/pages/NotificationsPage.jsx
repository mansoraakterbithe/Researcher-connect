import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/NotificationsPage.css';
import Footer from '../components/Footer';
import CreatePostModal from '../components/CreatePostModal';

function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="32" height="32">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="15" fill="url(#npLogoGrad)"/>
      <defs>
        <linearGradient id="npLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B3A6B"/>
          <stop offset="100%" stopColor="#2C5AA0"/>
        </linearGradient>
      </defs>
      <path d="M24 16 L34 20 L24 24 L14 20 Z" fill="#FFD700"/>
      <path d="M18 22 L18 27 Q24 30 30 27 L30 22" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="34" y1="20" x2="34" y2="26" stroke="#FFD700" strokeWidth="1.2"/>
      <circle cx="34" cy="27" r="1.3" fill="#FFD700"/>
      <circle cx="40" cy="14" r="2.5" fill="#FFD700"/>
      <circle cx="8" cy="32" r="2" fill="#5BA4E6"/>
    </svg>
  );
}

// ── NOTIFICATION DATA ─────────────────────────────────────────
// 🍰 Later this comes from: GET /api/notifications
const NOTIFICATIONS = [
  {
    id: 1, type: 'match', unread: true,
    icon: '⚡', color: 'green',
    title: 'New Research Match',
    body: 'Dr. Sarah Chen from UCL matches 94% with your research profile. She is currently accepting PhD students.',
    time: '2 minutes ago',
    action: 'View Profile',
    actionPath: '/profile',
  },
  {
    id: 2, type: 'application', unread: true,
    icon: '🎓', color: 'gold',
    title: 'Application Update',
    body: 'Dr. Sarah Chen has reviewed your application and sent a response. Check your messages.',
    time: '1 hour ago',
    action: 'View Message',
    actionPath: '/messages',
  },
  {
    id: 3, type: 'like', unread: true,
    icon: '👍', color: 'blue',
    title: 'Prof. Ahmed Hassan liked your post',
    body: 'Your post "Deep learning for early-stage skin disease classification" received a like from Prof. Ahmed Hassan at University of Manchester.',
    time: '3 hours ago',
    action: 'View Post',
    actionPath: '/home',
  },
  {
    id: 4, type: 'endorse', unread: true,
    icon: '✓', color: 'green',
    title: 'New Skill Endorsement',
    body: 'James Kumar endorsed your skill in Deep Learning. You now have 6 endorsements for this skill.',
    time: '5 hours ago',
    action: 'View Profile',
    actionPath: '/profile',
  },
  {
    id: 5, type: 'connection', unread: false,
    icon: '🤝', color: 'blue',
    title: 'New Connection Request',
    body: 'Dr. Priya Sharma from University of Edinburgh wants to connect with you. She works on NLP for healthcare.',
    time: 'Yesterday',
    action: 'View Request',
    actionPath: '/connections',
  },
  {
    id: 6, type: 'comment', unread: false,
    icon: '💬', color: 'purple',
    title: 'New Answer on Your Question',
    body: 'Someone answered your question "Best approach for handling class imbalance in medical imaging datasets?" with a detailed response about focal loss.',
    time: 'Yesterday',
    action: 'View Answer',
    actionPath: '/home',
  },
  {
    id: 7, type: 'opportunity', unread: false,
    icon: '💼', color: 'gold',
    title: 'New Opportunity Match',
    body: 'A new funded PhD position at UCL Medical AI Lab matches your research profile. Application deadline is July 15, 2026.',
    time: '2 days ago',
    action: 'View Opportunity',
    actionPath: '/home',
  },
  {
    id: 8, type: 'system', unread: false,
    icon: '🔬', color: 'blue',
    title: 'Your Research DNA was updated',
    body: 'Based on your recent activity, your Research DNA has been updated. AI/ML is now at 92% — up from 90%.',
    time: '3 days ago',
    action: 'View Profile',
    actionPath: '/profile',
  },
  {
    id: 9, type: 'paper', unread: false,
    icon: '📄', color: 'purple',
    title: 'Paper Citation Alert',
    body: 'Your IEEE ICCIT 2024 paper has been cited by a new publication. Keep an eye on your impact score.',
    time: '4 days ago',
    action: 'View Paper',
    actionPath: '/profile',
  },
  {
    id: 10, type: 'match', unread: false,
    icon: '⚡', color: 'green',
    title: 'Weekly Match Report',
    body: 'This week you have 3 new supervisor matches above 80% compatibility. Your profile was viewed by 12 researchers.',
    time: '5 days ago',
    action: 'View Matches',
    actionPath: '/matches',
  },
];

const FILTERS = ['All', 'Unread', 'Matches', 'Applications', 'Connections', 'Posts'];

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  }

  function deleteNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function getFiltered() {
    if (activeFilter === 'All') return notifications;
    if (activeFilter === 'Unread') return notifications.filter(n => n.unread);
    if (activeFilter === 'Matches') return notifications.filter(n => n.type === 'match');
    if (activeFilter === 'Applications') return notifications.filter(n => n.type === 'application');
    if (activeFilter === 'Connections') return notifications.filter(n => n.type === 'connection');
    if (activeFilter === 'Posts') return notifications.filter(n => ['like', 'comment', 'paper'].includes(n.type));
    return notifications;
  }

  const filtered = getFiltered();

  return (
    <div className="np">

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="np-nav">
        <div className="np-nav-left">
          <div className="np-logo" onClick={() => navigate('/')}>
            <Logo/>
            <span className="np-logo-text">Resea<span>Rc</span></span>
          </div>
          <div className="np-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search notifications..."/>
          </div>
        </div>
        <div className="np-nav-right">
          <div className="np-nav-link" onClick={() => navigate('/home')}>Home</div>
          <div className="np-nav-link" onClick={() => navigate('/connections')}>Connections</div>
          <div className="np-nav-link np-nav-active">
            Notifications
            {unreadCount > 0 && <span className="np-nav-badge">{unreadCount}</span>}
          </div>
          <button className="np-new-btn" onClick={() => setShowPostModal(true)}>+ New Post</button>
          <div className="np-avatar" onClick={() => navigate('/profile')}>M</div>
        </div>
      </nav>

      <div className="np-body">

        {/* ── LEFT — NOTIFICATION FEED ─────────────────── */}
        <div className="np-main">

          {/* PAGE HEADER */}
          <div className="np-page-head">
            <div>
              <div className="np-page-title">
                Notifications
                {unreadCount > 0 && (
                  <span className="np-unread-badge">{unreadCount} new</span>
                )}
              </div>
              <div className="np-page-sub">Stay up to date with your research network</div>
            </div>
            {unreadCount > 0 && (
              <button className="np-mark-all-btn" onClick={markAllRead}>
                ✓ Mark all as read
              </button>
            )}
          </div>

          {/* FILTER CHIPS */}
          <div className="np-filters">
            {FILTERS.map(f => (
              <div
                key={f}
                className={`np-filter ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                {f === 'Unread' && unreadCount > 0 && (
                  <span className="np-filter-count">{unreadCount}</span>
                )}
              </div>
            ))}
          </div>

          {/* NOTIFICATION LIST */}
          {filtered.length === 0 ? (
            <div className="np-empty">
              <div className="np-empty-icon">🔔</div>
              <div className="np-empty-title">No notifications here</div>
              <div className="np-empty-sub">When something happens in your network, it will show up here</div>
            </div>
          ) : (
            <div className="np-list">
              {filtered.map((n, i) => (
                <div
                  key={n.id}
                  className={`np-item ${n.unread ? 'unread' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => markRead(n.id)}
                >
                  {/* UNREAD DOT */}
                  {n.unread && <div className="np-dot"/>}

                  {/* ICON */}
                  <div className={`np-icon ${n.color}`}>{n.icon}</div>

                  {/* CONTENT */}
                  <div className="np-content">
                    <div className="np-item-title">{n.title}</div>
                    <div className="np-item-body">{n.body}</div>
                    <div className="np-item-footer">
                      <span className="np-time">{n.time}</span>
                      <button
                        className="np-action-btn"
                        onClick={e => { e.stopPropagation(); navigate(n.actionPath); }}
                      >
                        {n.action} →
                      </button>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    className="np-delete-btn"
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────── */}
        <aside className="np-right">

          {/* NOTIFICATION SETTINGS */}
          <div className="np-widget">
            <div className="np-widget-title">Notification Settings</div>
            {[
              { label: 'New Matches', desc: 'When a new supervisor match is found', on: true },
              { label: 'Application Updates', desc: 'When a supervisor responds', on: true },
              { label: 'Likes & Comments', desc: 'When someone reacts to your posts', on: true },
              { label: 'Connection Requests', desc: 'When someone wants to connect', on: true },
              { label: 'Weekly Digest', desc: 'Summary of your week on ResearchConnect', on: false },
              { label: 'Email Notifications', desc: 'Also send to your email', on: false },
            ].map((setting, i) => (
              <NotificationToggle key={i} {...setting}/>
            ))}
          </div>

          {/* ACTIVITY SUMMARY */}
          <div className="np-widget">
            <div className="np-widget-title">This Week</div>
            {[
              { label: 'Profile Views', val: '12', color: '#FFD700' },
              { label: 'Match Score', val: '94%', color: '#34d399' },
              { label: 'Post Likes', val: '7', color: '#5BA4E6' },
              { label: 'New Connections', val: '3', color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} className="np-stat-row">
                <span className="np-stat-label">{stat.label}</span>
                <span className="np-stat-val" style={{ color: stat.color }}>{stat.val}</span>
              </div>
            ))}
          </div>

        </aside>
      </div>

      <Footer/>

      {showPostModal && (
        <CreatePostModal
          onClose={() => setShowPostModal(false)}
          userRole="student"
        />
      )}
    </div>
  );
}

// ── TOGGLE COMPONENT ─────────────────────────────────────────
function NotificationToggle({ label, desc, on: initialOn }) {
  const [on, setOn] = useState(initialOn);
  return (
    <div className="np-toggle-row">
      <div className="np-toggle-info">
        <div className="np-toggle-label">{label}</div>
        <div className="np-toggle-desc">{desc}</div>
      </div>
      <div className={`np-toggle ${on ? 'on' : ''}`} onClick={() => setOn(!on)}>
        <div className="np-toggle-dot"/>
      </div>
    </div>
  );
}

export default NotificationsPage;