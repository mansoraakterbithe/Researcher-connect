// ============================================================
// FILE: src/pages/ProfilePage.jsx
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ProfilePage.css';

// ── LOGO (same across all pages) ─────────────────────────────
function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="32" height="32">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="15" fill="url(#ppLogoGrad)"/>
      <defs>
        <linearGradient id="ppLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

// ── SAMPLE DATA — replace with real API data later ────────────
const PROFILE = {
  name: 'Mansora Akter Bithe',
  initials: 'M',
  role: 'student',
  verified: true,
  university: 'UWE Bristol',
  department: 'Data Science & AI',
  location: 'Bristol, United Kingdom',
  remote: true,
  matchScore: 94,
  impactScore: 782,
  followers: 47,
  following: 12,
  papers: 1,
  endorsements: 8,
  status: 'active',
  // Student specific
  seekingSupervisor: true,
  targetDegree: 'PhD',
  fundingNeeded: 'Full scholarship preferred',
  availableFrom: 'September 2026',
  about: 'Data Scientist and AI researcher with a published IEEE paper on skin disease classification using deep learning (ICCIT 2024). Currently completing BSc Top-Up in Data Science & AI at UWE Bristol. My research focuses on medical image analysis, explainable AI, and building tools that make AI accessible in clinical settings.',
  skills: [
    { name: 'Python', endorsed: true },
    { name: 'TensorFlow', endorsed: true },
    { name: 'PyTorch', endorsed: true },
    { name: 'SHAP', endorsed: true },
    { name: 'Scikit-learn', endorsed: false },
    { name: 'LightGBM', endorsed: false },
    { name: 'R', endorsed: false },
    { name: 'OpenCV', endorsed: false },
    { name: 'Flask', endorsed: false },
    { name: 'React', endorsed: false },
    { name: 'MongoDB', endorsed: false },
    { name: 'SQL', endorsed: false },
  ],
  openTo: [
    { label: '🔬 Research Collaboration', on: true },
    { label: '📚 Co-authorship', on: true },
    { label: '🎓 PhD Opportunities', on: true },
    { label: '👨‍🏫 Supervision', on: false },
  ],
  dnaBars: [
    { label: 'AI/ML', pct: 90, color: 'linear-gradient(to top,#1B3A6B,#5BA4E6)' },
    { label: 'Vision', pct: 75, color: 'linear-gradient(to top,#4A2C6B,#a78bfa)' },
    { label: 'Medicine', pct: 60, color: 'linear-gradient(to top,#1B6B3A,#34d399)' },
    { label: 'Data Sci', pct: 45, color: 'linear-gradient(to top,#8B6914,#FFD700)' },
    { label: 'NLP', pct: 30, color: 'linear-gradient(to top,#2C5AA0,#7CC4F0)' },
    { label: 'Stats', pct: 20, color: 'linear-gradient(to top,#6B1B3A,#f87171)' },
  ],
  impactBreakdown: [
    { label: 'Publications', val: 280, pct: 40, color: 'linear-gradient(90deg,#FFD700,#FFB800)' },
    { label: 'Matches', val: 180, pct: 65, color: 'linear-gradient(90deg,#5BA4E6,#2C5AA0)' },
    { label: 'Activity', val: 200, pct: 55, color: 'linear-gradient(90deg,#34d399,#2CA05A)' },
    { label: 'Connections', val: 122, pct: 30, color: 'linear-gradient(90deg,#a78bfa,#7B3FA0)' },
  ],
  timeline: [
    {
      year: '2024', color: '#FFD700',
      title: 'IEEE ICCIT 2024 — First Author Publication',
      desc: 'Published "Deep Learning for Skin Disease Classification" — CNN-based medical imaging study with 94.3% accuracy on HAM10000 dataset.',
      tag: 'Published Paper', tagColor: 'blue',
      popup: {
        title: 'Deep Learning for Skin Disease Classification',
        body: 'Comparative study of CNN architectures (VGG16, ResNet50, EfficientNet-B4) on HAM10000 dataset. Transfer learning with ImageNet weights. 94.3% accuracy, 0.91 F1 score across 7 disease classes.',
        stats: [{ val: '94.3%', label: 'Accuracy' }, { val: '0.91', label: 'F1 Score' }, { val: 'IEEE', label: 'Venue' }],
      },
    },
    {
      year: '2024', color: '#5BA4E6',
      title: 'SAM Segmentation on ISIC 2018',
      desc: 'Zero-shot segmentation using Meta\'s Segment Anything Model (SAM). Mean IoU 0.744 vs Otsu baseline 0.570.',
      tag: 'Advanced ML Project', tagColor: 'blue',
      popup: {
        title: 'SAM: Zero-Shot Skin Lesion Segmentation',
        body: 'Applied Meta\'s Segment Anything Model (SAM, ICCV 2023) to ISIC 2018 skin lesion dataset without any fine-tuning. Achieved mean IoU of 0.744 compared to Otsu thresholding baseline of 0.570 — 30% improvement.',
        stats: [{ val: '0.744', label: 'Mean IoU' }, { val: '0.570', label: 'Baseline' }, { val: '+30%', label: 'Improvement' }],
      },
    },
    {
      year: '2025', color: '#34d399',
      title: 'University Ranking Volatility Prediction — LightGBM + SHAP',
      desc: 'Early warning system for university ranking drops using LightGBM with SHAP explainability and Flask demo app.',
      tag: 'Research Project', tagColor: 'green',
      popup: {
        title: 'Early Warning Detection of Ranking Volatility',
        body: 'UWE resit project. LightGBM regression model + volatility classifier with SHAP explainability. Both UWE Bristol decline events (2020, 2024) correctly flagged at-risk one year in advance. Flask demo with glassmorphism UI.',
        stats: [{ val: '100%', label: 'Event Detection' }, { val: 'LightGBM', label: 'Model' }, { val: 'SHAP', label: 'Explainability' }],
      },
    },
  ],
  papers: [
    {
      title: 'Deep Learning for Skin Disease Classification Using Dermoscopic Images',
      venue: 'IEEE ICCIT 2024', year: '2024',
      popup: {
        title: 'Skin Disease Classification — IEEE ICCIT 2024',
        body: 'First-author paper. Comparative study of CNN architectures for automated dermatology. EfficientNet-B4 best performer with 94.3% accuracy.',
        stats: [{ val: '94.3%', label: 'Accuracy' }, { val: 'First Author', label: 'Position' }, { val: 'Published', label: 'Status' }],
      },
    },
  ],
  endorsementList: [
    { skill: 'Deep Learning', count: 5 },
    { skill: 'SHAP Explainability', count: 3 },
    { skill: 'Medical Imaging', count: 4 },
    { skill: 'Python / TensorFlow', count: 6 },
  ],
  readingList: [
    { title: 'SAM: Segment Anything — Kirillov et al.', venue: 'ICCV 2023', date: 'Jul 2024' },
    { title: 'Attention Is All You Need — Vaswani et al.', venue: 'NeurIPS 2017', date: 'Jan 2024' },
    { title: 'A Survey of Deep Learning for Medical Image Analysis', venue: 'Medical Image Analysis 2017', date: 'Mar 2024' },
  ],
};

// SUPERVISOR SAMPLE (used when viewing a professor's profile)
const SUPERVISOR_AVAILABILITY = {
  status: 'open',
  // 'open' = green, 'limited' = yellow, 'closed' = red
  statusLabel: 'Open to Students',
  taking: true,
  fundedPhD: true,
  fundedSlots: 2,
  scholarshipSupport: 'Full scholarship available for exceptional candidates',
  projectType: 'Both (my projects + student-proposed)',
  levels: ['Masters', 'PhD'],
  responseTime: '3-5 days',
  requirements: 'Strong Python skills, some ML background, passion for medical AI',
  deadline: 'Applications open — rolling basis',
};

function ProfilePage() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [interested, setInterested] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ why: '', background: '', topic: '', cv: '' });
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  function handleLike() {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  }

  function handleApplySubmit(e) {
    e.preventDefault();
    setApplySubmitted(true);
  }

  return (
    <div className="pp">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="pp-nav">
        <div className="pp-nav-left">
          <div className="pp-logo-wrap" onClick={() => navigate('/')}>
            <Logo/>
            <span className="pp-logo-text">Resea<span>Rc</span></span>
          </div>
          <div className="pp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search people, papers, topics..."/>
          </div>
        </div>
        <div className="pp-nav-right">
          <div className="pp-nav-link" onClick={() => navigate('/home')}>Home</div>
          <div className="pp-nav-link">Opportunities</div>
          <div className="pp-nav-link">Connections</div>
          <button className="pp-new-btn">+ New Post</button>
          <div className="pp-avatar-nav" onClick={() => navigate('/profile')}>M</div>
        </div>
      </nav>

      {/* ── COVER ───────────────────────────────────────── */}
      <div className="pp-cover">
        <div className="pp-cover-orb1"/>
        <div className="pp-cover-orb2"/>
        <div className="pp-cover-grid"/>
        <button className="pp-cover-edit-btn" onClick={() => navigate('/profile/edit')}>
          ✏️ Edit Cover
        </button>
      </div>

      {/* ── PROFILE HEADER ──────────────────────────────── */}
      <div className="pp-header-wrap">
        <div className="pp-header-inner">

          <div className="pp-avatar-row">
            <div className="pp-avatar-wrap">
              <div className="pp-avatar">M</div>
              <div className={`pp-status-dot ${PROFILE.status}`} title="Actively looking"/>
            </div>

            <div className="pp-header-actions">
              {/* COMPATIBILITY BADGE */}
              <div className="pp-compat-badge">
                <span className="pp-compat-num">94%</span>
                <div>
                  <div className="pp-compat-strong">Research Match</div>
                  <div className="pp-compat-sub">with your profile</div>
                </div>
              </div>

              <div className="pp-action-row">
                <button className="pp-btn-primary" onClick={() => setShowApplyModal(true)}>
                  🤝 Request Collaboration
                </button>
                <button className="pp-btn-secondary">💬 Message</button>
                <button className="pp-btn-secondary" onClick={() => navigate('/profile/edit')}>
                  ✏️ Edit Profile
                </button>
                <div className="pp-icon-btn" title="Share">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <div className="pp-icon-btn" title="More">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pp-name-section">
            <div className="pp-name">
              {PROFILE.name}
              {PROFILE.verified && <span className="pp-verified">✓ Verified</span>}
              <span className="pp-role-tag">🎓 Student</span>
            </div>
            <div className="pp-uni">{PROFILE.department} · {PROFILE.university}, UK</div>
            <div className="pp-location">📍 {PROFILE.location} · {PROFILE.remote ? 'Open to Remote' : 'On-site only'}</div>
          </div>

          {/* OPEN TO CHIPS */}
          <div className="pp-open-row">
            <span className="pp-open-label">Open to:</span>
            {PROFILE.openTo.map(item => (
              <span key={item.label} className={`pp-open-chip ${item.on ? 'on' : 'off'}`}>
                {item.label}
              </span>
            ))}
          </div>

          {/* STUDENT SEEKING SUPERVISOR BANNER */}
          {PROFILE.seekingSupervisor && (
            <div className="pp-seeking-banner">
              <div className="pp-seeking-dot"/>
              <div>
                <div className="pp-seeking-title">🎓 Actively Seeking PhD Supervisor</div>
                <div className="pp-seeking-sub">
                  Target: {PROFILE.targetDegree} · Start: {PROFILE.availableFrom} · Funding: {PROFILE.fundingNeeded}
                </div>
              </div>
              <button className="pp-seeking-btn" onClick={() => navigate('/matches')}>
                View Matching Supervisors →
              </button>
            </div>
          )}

          {/* STATS */}
          <div className="pp-stats-row">
            {[
              { num: '1', label: 'Papers', color: '' },
              { num: '94%', label: 'Match Score', color: 'gold' },
              { num: '47', label: 'Followers', color: '' },
              { num: '12', label: 'Following', color: '' },
              { num: '782', label: 'Impact Score', color: 'green' },
              { num: '8', label: 'Endorsements', color: '' },
            ].map(s => (
              <div key={s.label} className="pp-stat">
                <div className={`pp-stat-num ${s.color}`}>{s.num}</div>
                <div className="pp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* REACTIONS */}
          <div className="pp-reactions">
            <button className={`pp-react-btn like ${liked ? 'active' : ''}`} onClick={handleLike}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              {liked ? 'Liked' : 'Like'} · {likeCount}
            </button>
            <button className="pp-react-btn dislike">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
              2
            </button>
            <button className={`pp-react-btn interest ${interested ? 'active' : ''}`} onClick={() => setInterested(!interested)}>
              <svg viewBox="0 0 24 24" fill={interested ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {interested ? 'Interested ✓' : 'Interested'}
            </button>
            <button className="pp-react-btn share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Profile
            </button>
          </div>

          {/* TABS */}
          <div className="pp-tabs">
            {['about', 'papers', 'projects', 'connections'].map(tab => (
              <div
                key={tab}
                className={`pp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ────────────────────────────────────── */}
      <div className="pp-body">
        <div className="pp-main">

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <>
              {/* ABOUT */}
              <div className="pp-card">
                <div className="pp-card-head">About <span className="pp-card-edit">✏️ Edit</span></div>
                <p className="pp-about-text">{PROFILE.about}</p>
              </div>

              {/* IMPACT SCORE */}
              <div className="pp-card">
                <div className="pp-card-head">
                  Impact Score
                  <span className="pp-card-sub">How is this calculated?</span>
                </div>
                <div className="pp-impact-wrap">
                  <div className="pp-impact-ring">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <defs>
                        <linearGradient id="impGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#FFD700"/>
                          <stop offset="100%" stopColor="#FFB800"/>
                        </linearGradient>
                      </defs>
                      <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                      <circle cx="45" cy="45" r="36" fill="none" stroke="url(#impGrad)" strokeWidth="7"
                        strokeLinecap="round" strokeDasharray="226" strokeDashoffset="57"
                        transform="rotate(-90 45 45)"/>
                    </svg>
                    <div className="pp-impact-center">782</div>
                  </div>
                  <div className="pp-impact-bars">
                    {PROFILE.impactBreakdown.map(item => (
                      <div key={item.label} className="pp-impact-row">
                        <div className="pp-impact-lbl">{item.label}</div>
                        <div className="pp-impact-bar-bg">
                          <div className="pp-impact-bar-fill" style={{ width: `${item.pct}%`, background: item.color }}/>
                        </div>
                        <div className="pp-impact-val">{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RESEARCH DNA */}
              <div className="pp-card">
                <div className="pp-card-head">
                  Research DNA
                  <span className="pp-card-sub">Your unique research fingerprint</span>
                </div>
                <div className="pp-dna-wrap">
                  {PROFILE.dnaBars.map(bar => (
                    <div key={bar.label} className="pp-dna-col">
                      <div className="pp-dna-bar-wrap">
                        <div
                          className="pp-dna-bar"
                          style={{ height: `${bar.pct}%`, background: bar.color }}
                          title={`${bar.label}: ${bar.pct}%`}
                        />
                      </div>
                      <div className="pp-dna-lbl">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div className="pp-card">
                <div className="pp-card-head">Skills & Tools <span className="pp-card-edit">✏️ Edit</span></div>
                <div className="pp-skills-wrap">
                  {PROFILE.skills.map(skill => (
                    <span key={skill.name} className={`pp-skill ${skill.endorsed ? 'endorsed' : ''}`}>
                      {skill.name}{skill.endorsed ? ' ✓' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* RESEARCH JOURNEY TIMELINE */}
              <div className="pp-card">
                <div className="pp-card-head">Research Journey <span className="pp-card-edit">✏️ Edit</span></div>
                <div className="pp-timeline">
                  {PROFILE.timeline.map((item, i) => (
                    <div key={i} className="pp-tl-wrap">
                      <div className="pp-tl-item">
                        <div className="pp-tl-dot" style={{ borderColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}/>
                        <div className="pp-tl-year" style={{ color: item.color }}>{item.year}</div>
                        <div className="pp-tl-title">{item.title}</div>
                        <div className="pp-tl-desc">{item.desc}</div>
                        <span className="pp-tl-tag" style={{
                          background: item.tagColor === 'green' ? 'rgba(52,211,153,0.08)' : 'rgba(91,164,230,0.08)',
                          borderColor: item.tagColor === 'green' ? 'rgba(52,211,153,0.2)' : 'rgba(91,164,230,0.2)',
                          color: item.tagColor === 'green' ? '#34d399' : '#5BA4E6',
                        }}>
                          {item.tag}
                        </span>
                      </div>
                      {/* HOVER POPUP */}
                      <div className="pp-popup">
                        <div className="pp-popup-title">{item.popup.title}</div>
                        <div className="pp-popup-body">{item.popup.body}</div>
                        <div className="pp-popup-stats">
                          {item.popup.stats.map(s => (
                            <div key={s.label} className="pp-popup-stat">
                              <strong>{s.val}</strong>
                              <span>{s.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pp-popup-hint">🔍 Hover to explore · Click to read more</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* READING LIST */}
              <div className="pp-card">
                <div className="pp-card-head">📚 Reading List <span className="pp-card-edit">✏️ Edit</span></div>
                <div className="pp-reading-list">
                  {PROFILE.readingList.map((paper, i) => (
                    <div key={i} className="pp-reading-item">
                      <div className="pp-reading-title">{paper.title}</div>
                      <div className="pp-reading-meta">{paper.venue} · Read {paper.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PAPERS TAB */}
          {activeTab === 'papers' && (
            <div className="pp-card">
              <div className="pp-card-head">Published Papers</div>
              {PROFILE.papers.map((paper, i) => (
                <div key={i} className="pp-tl-wrap">
                  <div className="pp-paper-item">
                    <div className="pp-paper-title">{paper.title}</div>
                    <div className="pp-paper-meta">{paper.venue} · {paper.year}</div>
                    <div className="pp-paper-tags">
                      <span className="pp-ptag">First Author</span>
                      <span className="pp-ptag green">Published</span>
                    </div>
                  </div>
                  <div className="pp-popup">
                    <div className="pp-popup-title">{paper.popup.title}</div>
                    <div className="pp-popup-body">{paper.popup.body}</div>
                    <div className="pp-popup-stats">
                      {paper.popup.stats.map(s => (
                        <div key={s.label} className="pp-popup-stat">
                          <strong>{s.val}</strong>
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pp-popup-hint">📄 Click to read full paper</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────── */}
        <aside className="pp-right">

          {/* SUPERVISOR AVAILABILITY CARD */}
          <div className="pp-avail-card">
            <div className="pp-avail-head">
              <div className="pp-avail-status open">
                <div className="pp-avail-dot"/>
                {SUPERVISOR_AVAILABILITY.statusLabel}
              </div>
              <span className="pp-avail-badge">🔬 Supervisor</span>
            </div>

            <div className="pp-avail-grid">
              <div className="pp-avail-item">
                <div className="pp-avail-label">PhD Supervision</div>
                <div className="pp-avail-val green">✓ Available</div>
              </div>
              <div className="pp-avail-item">
                <div className="pp-avail-label">Funded Slots</div>
                <div className="pp-avail-val gold">{SUPERVISOR_AVAILABILITY.fundedSlots} positions</div>
              </div>
              <div className="pp-avail-item">
                <div className="pp-avail-label">Student Levels</div>
                <div className="pp-avail-val">{SUPERVISOR_AVAILABILITY.levels.join(', ')}</div>
              </div>
              <div className="pp-avail-item">
                <div className="pp-avail-label">Response Time</div>
                <div className="pp-avail-val">{SUPERVISOR_AVAILABILITY.responseTime}</div>
              </div>
            </div>

            <div className="pp-avail-scholarship">
              <div className="pp-avail-label">💰 Scholarship</div>
              <div className="pp-avail-scholarship-text">{SUPERVISOR_AVAILABILITY.scholarshipSupport}</div>
            </div>

            <div className="pp-avail-req">
              <div className="pp-avail-label">Requirements</div>
              <div className="pp-avail-req-text">{SUPERVISOR_AVAILABILITY.requirements}</div>
            </div>

            <div className="pp-avail-deadline">
              📅 {SUPERVISOR_AVAILABILITY.deadline}
            </div>

            <button className="pp-apply-btn" onClick={() => setShowApplyModal(true)}>
              🎓 Apply to Work With This Supervisor
            </button>
          </div>

          {/* COLLABORATION REQUEST */}
          <div className="pp-collab-card">
            <div className="pp-collab-title">🤝 Request Collaboration</div>
            <div className="pp-collab-sub">Tell Mansora what you'd like to work on together</div>
            <textarea
              className="pp-collab-textarea"
              placeholder="e.g. I'm working on a skin lesion detection project and would love your expertise..."
              rows={3}
            />
            <button className="pp-collab-btn">Send Request</button>
          </div>

          {/* ENDORSEMENTS */}
          <div className="pp-card">
            <div className="pp-card-head">Skill Endorsements</div>
            {PROFILE.endorsementList.map(e => (
              <div key={e.skill} className="pp-endorse-row">
                <span className="pp-endorse-skill">{e.skill}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pp-endorse-count">{e.count} ✓</span>
                  <button className="pp-endorse-btn">+ Endorse</button>
                </div>
              </div>
            ))}
          </div>

        </aside>
      </div>

      {/* ── APPLY MODAL ──────────────────────────────────── */}
      {showApplyModal && (
        <div className="pp-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}>
            {applySubmitted ? (
              <div className="pp-modal-success">
                <div className="pp-modal-success-icon">✓</div>
                <div className="pp-modal-success-title">Application Sent!</div>
                <div className="pp-modal-success-sub">
                  Your request has been sent. You'll receive a notification when they respond — usually within 3-5 days.
                </div>
                <button className="pp-modal-close-btn" onClick={() => { setShowApplyModal(false); setApplySubmitted(false); }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="pp-modal-head">
                  <div className="pp-modal-title">Apply to Work With This Supervisor</div>
                  <div className="pp-modal-sub">No email needed — your application goes directly to their ResearchConnect inbox</div>
                  <button className="pp-modal-x" onClick={() => setShowApplyModal(false)}>✕</button>
                </div>

                <form className="pp-modal-form" onSubmit={handleApplySubmit}>
                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Why do you want to work with this supervisor? *</label>
                    <textarea
                      className="pp-modal-input pp-modal-ta"
                      placeholder="Explain why their research interests align with yours..."
                      value={applyForm.why}
                      onChange={e => setApplyForm({ ...applyForm, why: e.target.value })}
                      required rows={3}
                    />
                  </div>

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Your research background *</label>
                    <textarea
                      className="pp-modal-input pp-modal-ta"
                      placeholder="Briefly describe your relevant experience, projects, and skills..."
                      value={applyForm.background}
                      onChange={e => setApplyForm({ ...applyForm, background: e.target.value })}
                      required rows={3}
                    />
                  </div>

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Proposed research topic or area</label>
                    <input
                      className="pp-modal-input"
                      placeholder="e.g. Explainable AI for dermatology diagnosis"
                      value={applyForm.topic}
                      onChange={e => setApplyForm({ ...applyForm, topic: e.target.value })}
                    />
                  </div>

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Are you seeking funding?</label>
                    <select
                      className="pp-modal-input pp-modal-select"
                      value={applyForm.funding}
                      onChange={e => setApplyForm({ ...applyForm, funding: e.target.value })}
                    >
                      <option value="">Select funding situation</option>
                      <option value="self">Self-funded</option>
                      <option value="partial">Seeking partial funding</option>
                      <option value="full">Need full scholarship</option>
                      <option value="open">Open to discussion</option>
                    </select>
                  </div>

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Attach CV (optional)</label>
                    <div className="pp-modal-upload">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Drop CV here or click to upload</span>
                      <span className="pp-modal-upload-hint">PDF, max 5MB</span>
                    </div>
                  </div>

                  <div className="pp-modal-footer">
                    <button type="button" className="pp-modal-cancel" onClick={() => setShowApplyModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="pp-modal-submit">
                      Send Application →
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;