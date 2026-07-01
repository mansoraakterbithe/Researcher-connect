import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ProfilePage.css';
import Footer from '../components/Footer';

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

// ── STUDENT PROFILE DATA ──────────────────────────────────────
const STUDENT_PROFILE = {
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
  papersCount: 1,
  endorsementsCount: 8,
  status: 'active',
  seekingSupervisor: true,
  targetDegree: 'PhD',
  fundingNeeded: 'Full scholarship preferred',
  availableFrom: 'September 2026',
  about: 'Data Scientist and AI researcher with a published IEEE paper on skin disease classification (ICCIT 2024). Currently completing BSc Top-Up in Data Science & AI at UWE Bristol. My research focuses on medical image analysis, explainable AI, and building tools that make AI accessible in clinical settings. I am building ResearchConnect — a UK academic research matching platform.',
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
    { label: '🌍 International Projects', on: false },
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
      desc: 'Zero-shot segmentation using Meta\'s Segment Anything Model. Mean IoU 0.744 vs Otsu baseline 0.570.',
      tag: 'ML Project', tagColor: 'blue',
      popup: {
        title: 'SAM: Zero-Shot Skin Lesion Segmentation',
        body: 'Applied Meta\'s Segment Anything Model (SAM) to ISIC 2018 dataset without fine-tuning. Mean IoU 0.744 vs Otsu 0.570 — 30% improvement over baseline.',
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
        body: 'LightGBM regression model + volatility classifier with SHAP explainability. Both UWE Bristol decline events (2020, 2024) correctly flagged at-risk one year in advance.',
        stats: [{ val: '100%', label: 'Event Detection' }, { val: 'LightGBM', label: 'Model' }, { val: 'SHAP', label: 'XAI' }],
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

// ── SUPERVISOR PROFILE DATA ───────────────────────────────────
const SUPERVISOR_PROFILE = {
  name: 'Dr. Sarah Chen',
  initials: 'Dr',
  role: 'supervisor',
  verified: true,
  university: 'University College London',
  department: 'Medical AI Lab',
  location: 'London, United Kingdom',
  remote: true,
  matchScore: 87,
  impactScore: 2840,
  followers: 312,
  following: 45,
  papersCount: 24,
  endorsementsCount: 67,
  status: 'active',
  about: 'Professor of Medical AI at UCL. My research focuses on Vision Transformers and explainable deep learning for clinical decision support. 24 peer-reviewed publications including MICCAI, NeurIPS and Nature Medicine. Currently leading a £2.1M UKRI-funded project on AI-assisted radiology.',
  researchAreas: ['Medical Imaging', 'Vision Transformers', 'Explainable AI', 'Clinical Decision Support', 'Radiology AI'],
  availability: {
    status: 'open',
    statusLabel: 'Open to Students',
    takingStudents: true,
    fundedPhD: true,
    fundedSlots: 2,
    scholarshipSupport: 'Full UKRI scholarship available for exceptional candidates. Covers tuition + £18,000/year stipend.',
    projectType: 'Both my projects and student-proposed topics',
    levels: ['Masters', 'PhD'],
    responseTime: '3-5 working days',
    requirements: 'Strong Python and ML background, ideally some experience with medical imaging or computer vision. UK/EU students preferred but international considered.',
    deadline: 'Rolling applications — no fixed deadline',
    startDate: 'October 2026 or January 2027',
  },
  openTo: [
    { label: '🎓 PhD Supervision', on: true },
    { label: '🔬 Research Collaboration', on: true },
    { label: '📚 Co-authorship', on: true },
    { label: '🏫 Masters Students', on: true },
  ],
  dnaBars: [
    { label: 'AI/ML', pct: 95, color: 'linear-gradient(to top,#1B3A6B,#5BA4E6)' },
    { label: 'Medicine', pct: 90, color: 'linear-gradient(to top,#1B6B3A,#34d399)' },
    { label: 'Vision', pct: 85, color: 'linear-gradient(to top,#4A2C6B,#a78bfa)' },
    { label: 'XAI', pct: 70, color: 'linear-gradient(to top,#8B6914,#FFD700)' },
    { label: 'NLP', pct: 40, color: 'linear-gradient(to top,#2C5AA0,#7CC4F0)' },
    { label: 'Stats', pct: 55, color: 'linear-gradient(to top,#6B1B3A,#f87171)' },
  ],
  impactBreakdown: [
    { label: 'Publications', val: 1200, pct: 85, color: 'linear-gradient(90deg,#FFD700,#FFB800)' },
    { label: 'Citations', val: 800, pct: 75, color: 'linear-gradient(90deg,#5BA4E6,#2C5AA0)' },
    { label: 'Supervision', val: 540, pct: 60, color: 'linear-gradient(90deg,#34d399,#2CA05A)' },
    { label: 'Connections', val: 300, pct: 45, color: 'linear-gradient(90deg,#a78bfa,#7B3FA0)' },
  ],
  recentPapers: [
    {
      title: 'Vision Transformers for Zero-Shot Medical Image Segmentation',
      venue: 'MICCAI 2026', year: '2026',
      popup: {
        title: 'ViT for Zero-Shot Medical Segmentation',
        body: 'Novel application of Vision Transformers to medical image segmentation without task-specific training. Tested on 5 clinical datasets including chest X-ray, MRI brain, and dermoscopy.',
        stats: [{ val: 'MICCAI', label: 'Venue' }, { val: '91.2%', label: 'Dice Score' }, { val: '2026', label: 'Year' }],
      },
    },
    {
      title: 'Explainable AI for Clinical Decision Support — SHAP meets Attention',
      venue: 'Nature Medicine 2025', year: '2025',
      popup: {
        title: 'XAI for Clinical Decision Support',
        body: 'Integrating SHAP explanations with attention mechanisms in ResNet-50 for chest X-ray diagnosis. Clinician-readable heatmaps validated in a 3-hospital trial.',
        stats: [{ val: 'Nature Medicine', label: 'Venue' }, { val: '92.1%', label: 'AUC' }, { val: '3 hospitals', label: 'Trial' }],
      },
    },
  ],
  supervisedStudents: [
    { name: 'James Kumar', degree: 'PhD', year: '2024', topic: 'Transformer-based ECG analysis' },
    { name: 'Priya Sharma', degree: 'Masters', year: '2025', topic: 'Federated learning for radiology' },
  ],
  endorsementList: [
    { skill: 'Medical Imaging AI', count: 28 },
    { skill: 'PhD Supervision', count: 19 },
    { skill: 'Vision Transformers', count: 24 },
    { skill: 'Grant Writing', count: 15 },
  ],
};

// ── CURRENT PROFILE — switch between student/supervisor here ──
// Later this will come from your backend based on logged-in user
// To test supervisor view: const PROFILE = STUDENT_PROFILE;
const PROFILE = SUPERVISOR_PROFILE;

function ProfilePage() {
  const navigate = useNavigate();
  const isStudent = PROFILE.role === 'student';
  const isSupervisor = PROFILE.role === 'supervisor';

  const [liked, setLiked] = useState(false);
  const [interested, setInterested] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applyForm, setApplyForm] = useState({
  why: '', background: '', topic: '', funding: '',
  cv: '', statement: '', transcript: '', writing: '', reference: '', other: '',
});
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

      {/* ── NAVBAR ──────────────────────────────────────── */}
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
          <div className="pp-avatar-nav">M</div>
        </div>
      </nav>

      {/* ── COVER ───────────────────────────────────────── */}
      <div className={`pp-cover ${isSupervisor ? 'supervisor' : ''}`}>
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
              <div className="pp-avatar">{PROFILE.initials}</div>
              <div className={`pp-status-dot ${PROFILE.status}`}/>
            </div>

            <div className="pp-header-actions">
              <div className="pp-compat-badge">
                <span className="pp-compat-num">{PROFILE.matchScore}%</span>
                <div>
                  <div className="pp-compat-strong">Research Match</div>
                  <div className="pp-compat-sub">with your profile</div>
                </div>
              </div>

              <div className="pp-action-row">
                {/* STUDENT sees: Request Collaboration */}
                {isStudent && (
                  <button className="pp-btn-primary" onClick={() => setShowApplyModal(true)}>
                    🤝 Request Collaboration
                  </button>
                )}
                {/* SUPERVISOR sees: Apply to Work With */}
                {isSupervisor && (
                  <button className="pp-btn-primary pp-btn-apply" onClick={() => setShowApplyModal(true)}>
                    🎓 Apply to Work With
                  </button>
                )}
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
              </div>
            </div>
          </div>

          {/* NAME + BADGES */}
          <div className="pp-name-section">
            <div className="pp-name">
              {PROFILE.name}
              {PROFILE.verified && (
                <span className="pp-verified">
                  {isSupervisor ? '✓ Verified Supervisor' : '✓ Verified'}
                </span>
              )}
              <span className="pp-role-tag">
                {isStudent ? '🎓 Student' : '🔬 Supervisor'}
              </span>
            </div>
            <div className="pp-uni">{PROFILE.department} · {PROFILE.university}, UK</div>
            <div className="pp-location">
              📍 {PROFILE.location} · {PROFILE.remote ? 'Open to Remote' : 'On-site only'}
            </div>
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

          {/* STUDENT ONLY — Seeking Supervisor Banner */}
          {isStudent && PROFILE.seekingSupervisor && (
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

          {/* SUPERVISOR ONLY — Quick Availability Banner */}
          {isSupervisor && (
            <div className="pp-avail-banner">
              <div className={`pp-avail-banner-dot ${PROFILE.availability.status}`}/>
              <div>
                <div className="pp-avail-banner-title">
                  {PROFILE.availability.status === 'open' && '🟢 Currently accepting research students'}
                  {PROFILE.availability.status === 'limited' && '🟡 Limited spots available'}
                  {PROFILE.availability.status === 'closed' && '🔴 Not currently taking students'}
                </div>
                <div className="pp-avail-banner-sub">
                  {PROFILE.availability.fundedPhD && `${PROFILE.availability.fundedSlots} funded PhD positions available · `}
                  Responds in {PROFILE.availability.responseTime}
                </div>
              </div>
              <button className="pp-btn-primary pp-btn-apply" onClick={() => setShowApplyModal(true)}>
                Apply Now →
              </button>
            </div>
          )}

          {/* STATS ROW */}
          <div className="pp-stats-row">
            {isStudent ? [
              { num: PROFILE.papersCount.toString(), label: 'Papers', color: '' },
              { num: `${PROFILE.matchScore}%`, label: 'Match Score', color: 'gold' },
              { num: PROFILE.followers.toString(), label: 'Followers', color: '' },
              { num: PROFILE.following.toString(), label: 'Following', color: '' },
              { num: PROFILE.impactScore.toString(), label: 'Impact Score', color: 'green' },
              { num: PROFILE.endorsementsCount.toString(), label: 'Endorsements', color: '' },
            ] : [
              { num: PROFILE.papersCount.toString(), label: 'Publications', color: 'gold' },
              { num: PROFILE.followers.toString(), label: 'Followers', color: '' },
              { num: PROFILE.availability.fundedSlots.toString(), label: 'Funded Slots', color: 'green' },
              { num: PROFILE.supervisedStudents.length.toString(), label: 'Students Supervised', color: '' },
              { num: PROFILE.impactScore.toString(), label: 'Impact Score', color: 'green' },
              { num: PROFILE.endorsementsCount.toString(), label: 'Endorsements', color: '' },
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

              {/* SUPERVISOR ONLY — Research Areas */}
              {isSupervisor && (
                <div className="pp-card">
                  <div className="pp-card-head">Research Areas</div>
                  <div className="pp-skills-wrap">
                    {PROFILE.researchAreas.map(area => (
                      <span key={area} className="pp-skill">{area}</span>
                    ))}
                  </div>
                </div>
              )}

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
                    <div className="pp-impact-center">{PROFILE.impactScore}</div>
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
                        <div className="pp-dna-bar" style={{ height: `${bar.pct}%`, background: bar.color }}/>
                      </div>
                      <div className="pp-dna-lbl">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STUDENT ONLY — Skills */}
              {isStudent && (
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
              )}

              {/* STUDENT ONLY — Research Journey Timeline */}
              {isStudent && (
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
                          <div className="pp-popup-hint">🔍 Click to read more</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUPERVISOR ONLY — Recent Papers with popup */}
              {isSupervisor && (
                <div className="pp-card">
                  <div className="pp-card-head">Recent Publications</div>
                  {PROFILE.recentPapers.map((paper, i) => (
                    <div key={i} className="pp-tl-wrap">
                      <div className="pp-paper-item">
                        <div className="pp-paper-title">{paper.title}</div>
                        <div className="pp-paper-meta">{paper.venue} · {paper.year}</div>
                        <div className="pp-paper-tags">
                          <span className="pp-ptag">Lead Author</span>
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

              {/* SUPERVISOR ONLY — Students Supervised */}
              {isSupervisor && (
                <div className="pp-card">
                  <div className="pp-card-head">Students Supervised</div>
                  {PROFILE.supervisedStudents.map((s, i) => (
                    <div key={i} className="pp-supervised-item">
                      <div className="pp-supervised-avatar">{s.name.split(' ').map(n => n[0]).join('')}</div>
                      <div>
                        <div className="pp-supervised-name">{s.name}</div>
                        <div className="pp-supervised-meta">{s.degree} · {s.year} · {s.topic}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STUDENT ONLY — Reading List */}
              {isStudent && (
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
              )}
            </>
          )}

          {/* PAPERS TAB */}
          {activeTab === 'papers' && (
            <div className="pp-card">
              <div className="pp-card-head">
                {isStudent ? 'Published Papers' : 'All Publications'}
              </div>
              <div className="pp-empty-state">
                <div className="pp-empty-icon">📄</div>
                <div className="pp-empty-text">
                  {isStudent
                    ? 'Papers you publish will appear here'
                    : 'Full publication list coming soon'}
                </div>
                <button className="pp-empty-btn">+ Add Paper</button>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="pp-card">
              <div className="pp-card-head">
                {isStudent ? 'My Projects' : 'Active Research Projects'}
              </div>
              <div className="pp-empty-state">
                <div className="pp-empty-icon">🔬</div>
                <div className="pp-empty-text">
                  {isStudent
                    ? 'Projects you work on will appear here'
                    : 'Active opportunities and projects appear here'}
                </div>
                <button className="pp-empty-btn">
                  {isStudent ? '+ Add Project' : '+ Post Opportunity'}
                </button>
              </div>
            </div>
          )}

          {/* CONNECTIONS TAB */}
          {activeTab === 'connections' && (
            <div className="pp-card">
              <div className="pp-card-head">Connections</div>
              <div className="pp-empty-state">
                <div className="pp-empty-icon">🤝</div>
                <div className="pp-empty-text">Connections appear here</div>
                <button className="pp-empty-btn" onClick={() => navigate('/connections')}>
                  Find Connections
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────── */}
        <aside className="pp-right">

          {/* SUPERVISOR ONLY — Full Availability Card */}
          {isSupervisor && (
            <div className="pp-avail-card">
              <div className="pp-avail-head">
                <div className={`pp-avail-status ${PROFILE.availability.status}`}>
                  <div className="pp-avail-dot"/>
                  {PROFILE.availability.statusLabel}
                </div>
                <span className="pp-avail-badge">🔬 Verified Supervisor</span>
              </div>

              <div className="pp-avail-grid">
                <div className="pp-avail-item">
                  <div className="pp-avail-label">PhD Supervision</div>
                  <div className="pp-avail-val green">✓ Available</div>
                </div>
                <div className="pp-avail-item">
                  <div className="pp-avail-label">Funded Slots</div>
                  <div className="pp-avail-val gold">{PROFILE.availability.fundedSlots} positions</div>
                </div>
                <div className="pp-avail-item">
                  <div className="pp-avail-label">Levels</div>
                  <div className="pp-avail-val">{PROFILE.availability.levels.join(', ')}</div>
                </div>
                <div className="pp-avail-item">
                  <div className="pp-avail-label">Response Time</div>
                  <div className="pp-avail-val">{PROFILE.availability.responseTime}</div>
                </div>
              </div>

              <div className="pp-avail-scholarship">
                <div className="pp-avail-label">💰 Scholarship</div>
                <div className="pp-avail-scholarship-text">{PROFILE.availability.scholarshipSupport}</div>
              </div>

              <div className="pp-avail-req">
                <div className="pp-avail-label">Requirements</div>
                <div className="pp-avail-req-text">{PROFILE.availability.requirements}</div>
              </div>

              <div className="pp-avail-deadline">📅 {PROFILE.availability.deadline}</div>
              <div className="pp-avail-deadline">🗓 Start: {PROFILE.availability.startDate}</div>

              <button className="pp-apply-btn" onClick={() => setShowApplyModal(true)}>
                🎓 Apply to Work With This Supervisor
              </button>
            </div>
          )}

          {/* STUDENT ONLY — Collaboration Request Box */}
          {isStudent && (
            <div className="pp-collab-card">
              <div className="pp-collab-title">🤝 Request Collaboration</div>
              <div className="pp-collab-sub">Tell {PROFILE.name.split(' ')[0]} what you'd like to work on</div>
              <textarea
                className="pp-collab-textarea"
                placeholder="e.g. I'm working on a skin lesion project and would love your input on the CNN architecture choices..."
                rows={3}
              />
              <button className="pp-collab-btn">Send Request</button>
            </div>
          )}

          {/* ENDORSEMENTS — both roles */}
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
                <div className="pp-modal-success-title">
                  {isSupervisor ? 'Application Sent!' : 'Request Sent!'}
                </div>
                <div className="pp-modal-success-sub">
                  {isSupervisor
                    ? 'Your application has been sent directly to their ResearchConnect inbox. You\'ll receive a notification when they respond — usually within 3-5 days.'
                    : 'Your collaboration request has been sent. You\'ll be notified when they respond.'}
                </div>
                <button className="pp-modal-close-btn" onClick={() => { setShowApplyModal(false); setApplySubmitted(false); }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="pp-modal-head">
                  <div className="pp-modal-title">
                    {isSupervisor
                      ? `Apply to Work With ${PROFILE.name.split(' ')[0]}`
                      : `Request Collaboration with ${PROFILE.name.split(' ')[0]}`}
                  </div>
                  <div className="pp-modal-sub">
                    {isSupervisor
                      ? 'No email needed — your application goes directly to their ResearchConnect inbox'
                      : 'Send a direct collaboration request — no email needed'}
                  </div>
                  <button className="pp-modal-x" onClick={() => setShowApplyModal(false)}>✕</button>
                </div>

                <form className="pp-modal-form" onSubmit={handleApplySubmit}>
                  <div className="pp-modal-field">
                    <label className="pp-modal-label">
                      {isSupervisor
                        ? 'Why do you want to work with this supervisor? *'
                        : 'What would you like to collaborate on? *'}
                    </label>
                    <textarea
                      className="pp-modal-input pp-modal-ta"
                      placeholder={isSupervisor
                        ? "Explain why their research aligns with yours..."
                        : "Describe your project and how you'd like to collaborate..."}
                      value={applyForm.why}
                      onChange={e => setApplyForm({ ...applyForm, why: e.target.value })}
                      required rows={3}
                    />
                  </div>

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">Your research background *</label>
                    <textarea
                      className="pp-modal-input pp-modal-ta"
                      placeholder="Briefly describe your experience, projects, and skills..."
                      value={applyForm.background}
                      onChange={e => setApplyForm({ ...applyForm, background: e.target.value })}
                      required rows={3}
                    />
                  </div>

                  {isSupervisor && (
                    <>
                      <div className="pp-modal-field">
                        <label className="pp-modal-label">Proposed research topic</label>
                        <input
                          className="pp-modal-input"
                          placeholder="e.g. Explainable AI for dermatology diagnosis"
                          value={applyForm.topic}
                          onChange={e => setApplyForm({ ...applyForm, topic: e.target.value })}
                        />
                      </div>

                      <div className="pp-modal-field">
                        <label className="pp-modal-label">Funding situation</label>
                        <select
                          className="pp-modal-input pp-modal-select"
                          value={applyForm.funding}
                          onChange={e => setApplyForm({ ...applyForm, funding: e.target.value })}
                        >
                          <option value="">Select your funding situation</option>
                          <option value="self">Self-funded</option>
                          <option value="partial">Seeking partial funding</option>
                          <option value="full">Need full scholarship</option>
                          <option value="open">Open to discussion</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="pp-modal-field">
                    <label className="pp-modal-label">
                      Supporting Documents
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: 6 }}>
                        — attach as many as relevant
                      </span>
                    </label>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">📄</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">CV / Resume</div>
                        <div className="pp-modal-doc-sub">Your academic or research CV</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, cv: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.cv && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">🔬</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">Research Statement</div>
                        <div className="pp-modal-doc-sub">Why you want to do this research</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, statement: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.statement && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">🎓</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">Academic Transcript</div>
                        <div className="pp-modal-doc-sub">Your grades and academic record</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, transcript: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.transcript && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">📝</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">Writing Sample / Past Paper</div>
                        <div className="pp-modal-doc-sub">A paper or project you have written</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, writing: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.writing && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">✉️</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">Reference Letter</div>
                        <div className="pp-modal-doc-sub">From a previous supervisor or lecturer</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, reference: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.reference && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-row">
                      <div className="pp-modal-doc-icon">📎</div>
                      <div className="pp-modal-doc-info">
                        <div className="pp-modal-doc-title">Other Supporting Document</div>
                        <div className="pp-modal-doc-sub">Portfolio, certificate, or anything else</div>
                      </div>
                      <label className="pp-modal-doc-btn">
                        Upload
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png,.zip" style={{ display: 'none' }}
                          onChange={e => setApplyForm({ ...applyForm, other: e.target.files[0]?.name || '' })}/>
                      </label>
                      {applyForm.other && <div className="pp-modal-doc-done">✓</div>}
                    </div>

                    <div className="pp-modal-doc-note">
                      📌 All documents go directly to their ResearchConnect inbox — no email needed. Max 5MB per file. PDF preferred.
                    </div>
                  </div>

                  <div className="pp-modal-footer">
                    <button type="button" className="pp-modal-cancel" onClick={() => setShowApplyModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="pp-modal-submit">
                      {isSupervisor ? 'Send Application →' : 'Send Request →'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProfilePage;