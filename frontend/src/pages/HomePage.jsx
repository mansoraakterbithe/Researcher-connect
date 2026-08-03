import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';
import Footer from '../components/Footer';
import CreatePostModal from "../components/CreatePostModal";
import { useAuth } from '../context/AuthContext';

function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="32" height="32">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="15" fill="url(#homeLogoGrad)"/>
      <defs>
        <linearGradient id="homeLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

const CATEGORIES = ['All', 'AI / ML', 'Biology', 'Medicine', 'Physics', 'Data Science', 'Chemistry'];

const TRENDING = [
  { label: 'AI / Healthcare', color: '#5BA4E6', pct: '↑ 340%', up: true },
  { label: 'Computer Vision', color: '#a78bfa', pct: '↑ 218%', up: true },
  { label: 'NLP / LLMs', color: '#34d399', pct: '↑ 195%', up: true },
  { label: 'Trad. Statistics', color: '#f87171', pct: '↓ 12%', up: false },
];

function HomePage() {
  const navigate = useNavigate();
  const { logout, user, authFetch } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [suggested, setSuggested] = useState([]);

  const initial = user?.username?.charAt(0).toUpperCase() || 'M';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await authFetch('/posts');
        const data = await res.json();
        const mapped = (data.posts || []).map(p => ({
          id: p._id,
          author: p.author?.username || 'Unknown',
          initials: p.author?.username?.charAt(0).toUpperCase() || 'R',
          avatarBg: 'linear-gradient(135deg,#1B3A6B,#2C5AA0)',
          uni: p.author?.university || 'ResearchConnect',
          verified: p.author?.isVerified || false,
          time: new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: p.type,
          title: p.title,
          excerpt: p.content || p.abstract || '',
          tags: (p.tags || []).slice(0, 3).map(tag => ({ label: tag, color: 'blue' })),
          match: null,
          popup: {
            title: p.title,
            body: p.content || p.abstract || 'No description provided.',
            stats: [
              { val: p.type, label: 'Type' },
              { val: (p.likes?.length || 0).toString(), label: 'Likes' },
              { val: (p.comments?.length || 0).toString(), label: 'Comments' },
            ],
            hint: '🔍 Click to read more'
          }
        }));
        setPosts(mapped);
      } catch (err) {
        console.error('Feed fetch error:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchSuggested = async () => {
      try {
        const res = await authFetch('/connections/suggestions');
        const data = await res.json();
        setSuggested((data.suggestions || []).slice(0, 3).map(s => ({
          initials: s.username?.charAt(0).toUpperCase() || 'R',
          name: s.username,
          role: `${s.university || 'ResearchConnect'} · ${s.role}`
        })));
      } catch (err) {
        console.error('Suggestions fetch error:', err);
      }
    };

    fetchPosts();
    fetchSuggested();
  }, []);

  return (
    <div className="hf">

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="hf-nav">
        <div className="hf-nav-left">
          <div className="hf-logo" onClick={() => navigate('/')}>
            <Logo />
            <div className="hf-logo-text">Resea<span>Rc</span></div>
          </div>
          <div className="hf-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search posts, people, topics..."/>
          </div>
        </div>
        <div className="hf-nav-right">
          <div className="hf-nav-link active">Home</div>
          <div className="hf-nav-link">Opportunities</div>
          <div className="hf-nav-link">Connections</div>
          <div className="hf-nav-link" onClick={() => navigate('/notifications')}>🔔 Notifications</div>
          <div className="hf-nav-link">Events</div>
          <button className="hf-new-btn" onClick={() => setShowPostModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Post
          </button>
          <div className="hf-avatar-wrap">
            <div className="hf-avatar" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>{initial}</div>
            {showAvatarMenu && (
              <div className="hf-avatar-menu">
                <div className="hf-avatar-menu-item" onClick={() => { navigate('/profile'); setShowAvatarMenu(false); }}>👤 View Profile</div>
                <div className="hf-avatar-menu-item" onClick={() => { navigate('/profile/edit'); setShowAvatarMenu(false); }}>✏️ Edit Profile</div>
                <div className="hf-avatar-menu-item" onClick={() => { navigate('/settings'); setShowAvatarMenu(false); }}>⚙️ Settings</div>
                <div className="hf-avatar-menu-divider"/>
                <div className="hf-avatar-menu-item logout" onClick={() => { logout(); navigate('/auth'); setShowAvatarMenu(false); }}>🚪 Logout</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="hf-body">

        {/* ── LEFT SIDEBAR ────────────────────────────── */}
        <aside className="hf-sidebar">
          <div className="hf-side-label">Menu</div>
          {[
            { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', label: 'Home Feed', active: true },
            { icon: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z', label: 'Discover' },
            { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', label: 'Connections' },
            { icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z', label: 'Messages' },
          ].map(item => (
            <div key={item.label} className={`hf-side-item ${item.active ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </div>
          ))}

          <div className="hf-divider"/>
          <div className="hf-side-label">Create</div>
          {[
            { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', label: 'Post' },
            { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01', label: 'Need Help' },
            { icon: 'M2 3h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3zM8 21h8M12 17v4', label: 'Opportunity' },
          ].map(item => (
            <div key={item.label} className="hf-side-item" onClick={() => setShowPostModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </div>
          ))}

          <div className="hf-divider"/>
          <div className="hf-side-label">My Activity</div>
          {[
            { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', label: 'My Profile', path: '/profile' },
            { icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z', label: 'Saved', path: '/saved' },
            { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'My Matches', path: '/matches' },
          ].map(item => (
            <div key={item.label} className="hf-side-item" onClick={() => item.path && navigate(item.path)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </div>
          ))}
        </aside>

        {/* ── MAIN FEED ────────────────────────────────── */}
        <main className="hf-feed">
          <div className="hf-cats">
            {CATEGORIES.map(cat => (
              <div
                key={cat}
                className={`hf-cat ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="hf-sec-head">
            <div className="hf-sec-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              </svg>
            </div>
            <div className="hf-sec-title">Latest Posts</div>
          </div>

          {loadingPosts ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              No posts yet. Be the first to post!
            </div>
          ) : posts.map((post, i) => (
            <div className="hf-post-wrap" key={post.id}>
              <div className="hf-post" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                <div className="hf-post-header">
                  <div className="hf-post-author">
                    <div className="hf-post-avatar" style={{ background: post.avatarBg }}>
                      {post.initials}
                    </div>
                    <div>
                      <div className="hf-post-name">
                        {post.author}
                        {post.verified && <span className="hf-verified">✓ Verified</span>}
                      </div>
                      <div className="hf-post-meta">{post.uni} · {post.time}</div>
                    </div>
                  </div>
                  {post.match && <div className="hf-match">⚡ {post.match}% match</div>}
                </div>

                <div className="hf-post-title">{post.title}</div>
                <div className="hf-post-excerpt">{post.excerpt}</div>

                <div className="hf-post-footer">
                  <div className="hf-post-tags">
                    {post.tags.map(tag => (
                      <span key={tag.label} className={`hf-tag hf-tag-${tag.color}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <div className="hf-post-actions">
                    {post.type === 'opportunity' ? (
                      <button className="hf-action hf-action-apply">Apply Now</button>
                    ) : (
                      <button className="hf-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {post.type === 'question' ? 'Answer' : 'Chat'}
                      </button>
                    )}
                    <button className="hf-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <button className="hf-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* HOVER POPUP */}
              <div className="hf-popup">
                <div className="hf-popup-title">{post.popup.title}</div>
                <div className="hf-popup-body">{post.popup.body}</div>
                <div className="hf-popup-stats">
                  {post.popup.stats.map(s => (
                    <div key={s.label} className="hf-popup-stat">
                      <strong>{s.val}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="hf-popup-divider"/>
                <div className="hf-popup-hint">{post.popup.hint}</div>
              </div>
            </div>
          ))}
        </main>

        {/* ── RIGHT SIDEBAR ────────────────────────────── */}
        <aside className="hf-right">
          <div className="hf-widget">
            <div className="hf-widget-title">Your Profile</div>
            <div className="hf-profile-mini">
              <div className="hf-profile-avatar">{initial}</div>
              <div className="hf-profile-name">{user?.username || 'Researcher'}</div>
              <div className="hf-profile-role">{user?.role || 'Student'} · ResearchConnect</div>
            </div>
            <div className="hf-stats-row">
              <div className="hf-stat"><strong>0</strong><span>Followers</span></div>
              <div className="hf-stat"><strong>0</strong><span>Following</span></div>
              <div className="hf-stat"><strong>—</strong><span>Match</span></div>
            </div>
          </div>

          <div className="hf-widget">
            <div className="hf-widget-title">Trending Fields</div>
            {TRENDING.map(t => (
              <div className="hf-trend" key={t.label}>
                <div className="hf-trend-label">
                  <div className="hf-trend-dot" style={{ background: t.color }}/>
                  {t.label}
                </div>
                <div className={`hf-trend-pct ${t.up ? '' : 'down'}`}>{t.pct}</div>
              </div>
            ))}
          </div>

          {suggested.length > 0 && (
            <div className="hf-widget">
              <div className="hf-widget-title">Suggested Connections</div>
              {suggested.map(s => (
                <div className="hf-suggested" key={s.name}>
                  <div className="hf-sug-left">
                    <div className="hf-sug-avatar">{s.initials}</div>
                    <div>
                      <div className="hf-sug-name">{s.name}</div>
                      <div className="hf-sug-role">{s.role}</div>
                    </div>
                  </div>
                  <button className="hf-follow-btn">Follow</button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="hf-chatbot">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2e" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      {showPostModal && <CreatePostModal onClose={() => setShowPostModal(false)} userRole={user?.role || 'student'} />}
      <Footer />
    </div>
  );
}

export default HomePage;