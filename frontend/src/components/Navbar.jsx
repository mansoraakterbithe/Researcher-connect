import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ activePage = '' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setShowAvatarMenu(false);
  };

  const initial = user?.username?.charAt(0).toUpperCase() || 'R';

  return (
    <nav className="shared-nav">
      <div className="shared-nav-left">
        <div className="shared-logo" onClick={() => navigate('/')}>
          <svg viewBox="0 0 48 48" width="32" height="32">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
            <circle cx="24" cy="24" r="15" fill="url(#navGrad)"/>
            <defs>
              <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <span className="shared-logo-text">Resea<span>Rc</span></span>
        </div>

        <div className="shared-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search people, papers, topics..."/>
        </div>
      </div>

      <div className="shared-nav-right">
        <div className={`shared-nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => navigate('/home')}>Home</div>
        <div className={`shared-nav-link ${activePage === 'connections' ? 'active' : ''}`} onClick={() => navigate('/connections')}>Connections</div>
        <div className={`shared-nav-link ${activePage === 'notifications' ? 'active' : ''}`} onClick={() => navigate('/notifications')}>🔔 Notifications</div>

        <div className="shared-avatar-wrap">
          <div className="shared-avatar" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
            {initial}
          </div>
          {showAvatarMenu && (
            <div className="shared-avatar-menu">
              <div className="shared-menu-item" onClick={() => { navigate('/profile'); setShowAvatarMenu(false); }}>👤 View Profile</div>
              <div className="shared-menu-item" onClick={() => { navigate('/profile/edit'); setShowAvatarMenu(false); }}>✏️ Edit Profile</div>
              <div className="shared-menu-item" onClick={() => { navigate('/notifications'); setShowAvatarMenu(false); }}>🔔 Notifications</div>
              <div className="shared-menu-item" onClick={() => { navigate('/settings'); setShowAvatarMenu(false); }}>⚙️ Settings</div>
              <div className="shared-menu-divider"/>
              <div className="shared-menu-item logout" onClick={handleLogout}>🚪 Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;