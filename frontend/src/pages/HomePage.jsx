import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';
import Footer from '../components/Footer';
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

const POSTS = [
  {
    id: 1, type: 'paper',
    author: 'Mansora Akter Bithe', initials: 'M',
    avatarBg: 'linear-gradient(135deg,#1B3A6B,#2C5AA0)',
    uni: 'UWE Bristol', time: 'Jul 7, 2024', verified: true,
    title: 'Deep learning for early-stage skin disease classification — IEEE ICCIT 2024',
    excerpt: 'A comparative study of CNN architectures achieving 94.3% accuracy using transfer learning with EfficientNet-B4 on HAM10000 dataset...',
    tags: [{ label: 'AI / ML', color: 'blue' }, { label: 'Published', color: 'gold' }],
    match: 94,
    popup: {
      title: 'Deep learning for skin disease classification using dermoscopic images',
      body: 'IEEE ICCIT 2024 — Comparative study of CNN architectures (VGG16, ResNet50, EfficientNet-B4). Transfer learning with ImageNet weights. Data augmentation with Albumentations. Tested on HAM10000 dataset with 7 disease classes.',
      stats: [{ val: '94.3%', label: 'Accuracy' }, { val: '0.91', label: 'F1 Score' }, { val: '7', label: 'Classes' }],
      hint: '🔬 Click to read full paper',
    },
  },
  {
    id: 2, type: 'opportunity',
    author: 'Dr. Sarah Chen', initials: 'Dr',
    avatarBg: 'linear-gradient(135deg,#2C5AA0,#1B7BC4)',
    uni: 'UCL Medical AI Lab · London', time: 'Jun 30, 2026', verified: true,
    title: 'Research Assistant Opportunity — Deep Learning for Medical Imaging',
    excerpt: 'Looking for a motivated student with Python and ML experience to join our team working on transformer-based architectures for radiology...',
    tags: [{ label: 'Opportunity', color: 'green' }, { label: 'Medicine', color: 'blue' }, { label: 'AI / ML', color: 'purple' }],
    match: 87,
    popup: {
      title: 'Research Assistant — Transformer Models for Radiology AI',
      body: '12-month funded position at UCL. Working on Vision Transformers (ViT) for zero-shot radiology analysis. Requirements: Python, PyTorch, basic ML. UK students preferred. Start: September 2026.',
      stats: [{ val: '12mo', label: 'Duration' }, { val: 'Funded', label: 'Stipend' }, { val: 'London', label: 'Location' }],
      hint: '📋 Click to apply — deadline July 15',
    },
  },
  {
    id: 3, type: 'question',
    author: 'James Kumar', initials: 'JK',
    avatarBg: 'linear-gradient(135deg,#4A2C6B,#7B3FA0)',
    uni: 'University of Edinburgh', time: 'Jun 30, 2026', verified: false,
    title: 'Question: Best approach for handling class imbalance in medical imaging datasets?',
    excerpt: 'Working on skin lesion classification with severe class imbalance (95% benign, 5% malignant). SMOTE vs focal loss vs weighted sampling?',
    tags: [{ label: 'Question', color: 'purple' }, { label: 'AI / ML', color: 'blue' }],
    match: null,
    popup: {
      title: 'Class Imbalance in Medical Imaging — Community Discussion',
      body: 'Dataset: ISIC 2018, 10,015 images, 7 classes. Benign nevi dominant (6,705 samples). Malignant melanoma only 1,113. Getting 78% accuracy but very poor recall on minority class (0.31).',
      stats: [{ val: '4', label: 'Answers' }, { val: '23', label: 'Views' }, { val: '2h', label: 'Ago' }],
      hint: '💬 3 experts are answering this',
    },
  },
  {
    id: 4, type: 'paper',
    author: 'Prof. Ahmed Hassan', initials: 'AH',
    avatarBg: 'linear-gradient(135deg,#1B6B3A,#2CA05A)',
    uni: 'University of Manchester', time: 'Jun 29, 2026', verified: true,
    title: 'New paper: Explainable AI for clinical decision support — MICCAI 2026 accepted',
    excerpt: 'SHAP-based explanations for deep learning models in clinical settings. Code and dataset available on GitHub for open research...',
    tags: [{ label: 'Paper', color: 'gold' }, { label: 'AI / ML', color: 'blue' }, { label: 'Open Source', color: 'green' }],
    match: null,
    popup: {
      title: 'Explainable AI for Clinical Decision Support Systems',
      body: 'MICCAI 2026 accepted. Novel SHAP integration with attention mechanisms in ResNet-50 for chest X-ray analysis. Produces clinician-readable heatmaps. Dataset: ChestX-ray14 (112,120 images).',
      stats: [{ val: 'MICCAI', label: 'Venue' }, { val: '92.1%', label: 'AUC' }, { val: 'Open', label: 'Source' }],
      hint: '📄 Click to read full paper',
    },
  },
];

const CATEGORIES = ['All', 'AI / ML', 'Biology', 'Medicine', 'Physics', 'Data Science', 'Chemistry'];

const TRENDING = [
  { label: 'AI / Healthcare', color: '#5BA4E6', pct: '↑ 340%', up: true },
  { label: 'Computer Vision', color: '#a78bfa', pct: '↑ 218%', up: true },
  { label: 'NLP / LLMs', color: '#34d399', pct: '↑ 195%', up: true },
  { label: 'Trad. Statistics', color: '#f87171', pct: '↓ 12%', up: false },
];

const SUGGESTED = [
  { initials: 'SC', name: 'Dr. Sarah Chen', role: 'UCL · AI Research' },
  { initials: 'AH', name: 'Prof. Ahmed Hassan', role: 'Manchester · XAI' },
  { initials: 'JK', name: 'James Kumar', role: 'Edinburgh · ML' },
];

function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

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
          <div className="hf-nav-link">Events</div>
          <button className="hf-new-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Post
          </button>
          <div className="hf-avatar" onClick={() => navigate('/profile')}>M</div>
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
            <div key={item.label} className="hf-side-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </div>
          ))}

          <div className="hf-divider"/>
          <div className="hf-side-label">My Activity</div>
          {[
            { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', label: 'My Profile' },
            { icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z', label: 'Saved' },
            { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'My Matches' },
          ].map(item => (
            <div key={item.label} className="hf-side-item">
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

          {POSTS.map((post, i) => (
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
              <div className="hf-profile-avatar">M</div>
              <div className="hf-profile-name">Mansora Akter Bithe</div>
              <div className="hf-profile-role">Data Scientist · UWE Bristol</div>
            </div>
            <div className="hf-stats-row">
              <div className="hf-stat"><strong>10</strong><span>Followers</span></div>
              <div className="hf-stat"><strong>2</strong><span>Following</span></div>
              <div className="hf-stat"><strong>94%</strong><span>Match</span></div>
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

          <div className="hf-widget">
            <div className="hf-widget-title">Suggested Connections</div>
            {SUGGESTED.map(s => (
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
        </aside>
      </div>

      {/* CHATBOT */}
      <div className="hf-chatbot">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2e" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;