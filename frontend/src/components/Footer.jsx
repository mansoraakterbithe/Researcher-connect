// ============================================================
// FILE: src/components/Footer.jsx
// WHY: One footer used on EVERY page.
// 🍰 EXAMPLE: like a stamp on every page of a passport —
// the same mark appears everywhere without rewriting it
// each time. Change this one file and all pages update.
// ============================================================

import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="rc-footer">
      {/* TOP GOLD LINE */}
      <div className="rc-footer-topline"/>

      <div className="rc-footer-inner">
        <div className="rc-footer-grid">

          {/* BRAND COLUMN */}
          <div className="rc-footer-brand">
            {/* LOGO */}
            <div className="rc-footer-logo" onClick={() => navigate('/')}>
              <svg viewBox="0 0 48 48" width="32" height="32">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
                <circle cx="24" cy="24" r="15" fill="url(#ftLogoGrad)"/>
                <defs>
                  <linearGradient id="ftLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
              <span className="rc-footer-logo-text">Resea<span>Rc</span></span>
            </div>

            <p className="rc-footer-desc">
              The UK's smart research matching platform — connecting students with verified supervisors and funded opportunities across every academic field.
            </p>

            {/* UK BADGE */}
            <div className="rc-footer-uk-badge">
              <div className="rc-footer-badge-dot"/>
              UK Research Platform — Russell Group Focused
            </div>

            {/* SOCIAL ICONS */}
            <div className="rc-footer-socials">
              {[
                { path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', label: 'Facebook' },
                { path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', label: 'LinkedIn' },
                { path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z', label: 'Twitter' },
                { path: null, label: 'Instagram', isInstagram: true },
              ].map((s) => (
                <div key={s.label} className="rc-footer-soc-btn" title={s.label}>
                  {s.isInstagram ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" width="15" height="15">
                      <rect x="2" y="2" width="20" height="20" rx="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="rgba(255,255,255,0.5)"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" width="15" height="15">
                      <path d={s.path}/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PLATFORM LINKS */}
          <div className="rc-footer-col">
            <h4>Platform</h4>
            {[
              { label: 'Home Feed', path: '/home' },
              { label: 'Discover', path: '/home' },
              { label: 'Opportunities', path: '/opportunities' },
              { label: 'Smart Matches', path: '/matches' },
              { label: 'Connections', path: '/connections' },
              { label: 'Events', path: '/events' },
              { label: 'Messages', path: '/messages' },
            ].map(link => (
              <a key={link.label} onClick={() => navigate(link.path)}>
                {link.label}
              </a>
            ))}
          </div>

          {/* RESOURCES LINKS */}
          <div className="rc-footer-col">
            <h4>Resources</h4>
            {[
              'About Us', 'Blog', 'Docs',
              'Community', 'Verify Authorship',
              'Leaderboard', 'Research Tips',
            ].map(label => (
              <a key={label} href="#">{label}</a>
            ))}
          </div>

          {/* LEGAL LINKS */}
          <div className="rc-footer-col">
            <h4>Legal</h4>
            {[
              'Terms of Service', 'Privacy Policy',
              'Cookie Policy', 'GDPR',
              'Accessibility', 'Contact Us',
            ].map(label => (
              <a key={label} href="#">{label}</a>
            ))}
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="rc-footer-bottom">
          <div className="rc-footer-copy">
            © 2026 ResearchConnect Ltd. All rights reserved.
          </div>
          <div className="rc-footer-bottom-links">
            {['Terms', 'Privacy', 'Cookies', 'Contact'].map(l => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;