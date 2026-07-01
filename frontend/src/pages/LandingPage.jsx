// ============================================================
// FILE: src/pages/LandingPage.jsx
// ============================================================
import { useNavigate } from 'react-router-dom';
import { useLandingAnimations } from './hooks/useLandingAnimations';
import './styles/LandingPage.css';
import Footer from '../components/Footer';
// ── CATEGORY LIST ────────────────────────────────────────────
const categories = [
  { id: 1, name: 'Physics', group: 'science', icon: 'physics' },
  { id: 2, name: 'Chemistry', group: 'science', icon: 'chemistry' },
  { id: 3, name: 'Biology', group: 'science', icon: 'biology' },
  { id: 4, name: 'Mathematics', group: 'science', icon: 'maths' },
  { id: 5, name: 'Computer Science', group: 'engineering', icon: 'cs' },
  { id: 6, name: 'Electrical Engineering', group: 'engineering', icon: 'ee' },
  { id: 7, name: 'AI / Machine Learning', group: 'engineering', icon: 'ai' },
  { id: 8, name: 'Medicine', group: 'medicine', icon: 'medicine' },
  { id: 9, name: 'Neuroscience', group: 'medicine', icon: 'neuro' },
  { id: 10, name: 'L.L.B / Law', group: 'law', icon: 'llb' },
  { id: 11, name: 'Economics', group: 'law', icon: 'economics' },
  { id: 12, name: 'Humanities', group: 'arts', icon: 'humanities' },
  { id: 13, name: 'Business & Management', group: 'business', icon: 'business' },
  { id: 14, name: 'Data Science', group: 'business', icon: 'data' },
];

// ── FILTER GROUPS ────────────────────────────────────────────
const filterGroups = [
  { id: 'all', label: 'All Fields' },
  { id: 'science', label: 'Science' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'law', label: 'Law & Social' },
  { id: 'arts', label: 'Arts & Humanities' },
  { id: 'business', label: 'Business' },
];

// ── ICON COMPONENT ───────────────────────────────────────────
function CategoryIcon({ type }) {
  const icons = {
    physics: (
      <svg viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="5" fill="#E85C5C"/>
        <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="#FFD700" strokeWidth="1.8"/>
        <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="#FFD700" strokeWidth="1.8" transform="rotate(60 22 22)"/>
        <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="#FFD700" strokeWidth="1.8" transform="rotate(120 22 22)"/>
      </svg>
    ),
    chemistry: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="10" y="14" width="10" height="18" rx="3" fill="#5BA4E6" opacity="0.4" stroke="#5BA4E6" strokeWidth="1.5"/>
        <rect x="10" y="24" width="10" height="8" rx="2" fill="#34d399"/>
        <ellipse cx="15" cy="14" rx="5" ry="2" fill="none" stroke="#5BA4E6" strokeWidth="1.5"/>
        <rect x="24" y="10" width="10" height="22" rx="3" fill="#5BA4E6" opacity="0.4" stroke="#5BA4E6" strokeWidth="1.5"/>
        <rect x="24" y="24" width="10" height="8" rx="2" fill="#FFD700"/>
        <ellipse cx="29" cy="10" rx="5" ry="2" fill="none" stroke="#5BA4E6" strokeWidth="1.5"/>
      </svg>
    ),
    biology: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="18" y="6" width="4" height="32" rx="2" fill="#5BA4E6"/>
        <rect x="22" y="6" width="4" height="32" rx="2" fill="#4A90D9"/>
        <path d="M20 10 Q26 13 20 16 Q14 19 20 22 Q26 25 20 28 Q14 31 20 34" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M22 10 Q16 13 22 16 Q28 19 22 22 Q16 25 22 28 Q28 31 22 34" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    maths: (
      <svg viewBox="0 0 44 44" fill="none">
        <text x="8" y="28" fontSize="22" fill="#FFD700" fontFamily="serif" fontWeight="bold">∑</text>
        <circle cx="34" cy="14" r="5" fill="none" stroke="#5BA4E6" strokeWidth="1.5"/>
      </svg>
    ),
    cs: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="6" y="14" width="22" height="16" rx="3" fill="#1B3A6B"/>
        <rect x="8" y="16" width="18" height="12" rx="2" fill="#5BA4E6" opacity="0.4"/>
        <circle cx="33" cy="20" r="6" fill="#FDDBB4"/>
        <circle cx="33" cy="17" r="3.5" fill="#1A1A2E"/>
      </svg>
    ),
    ee: (
      <svg viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="10" r="5" fill="#FDDBB4" stroke="#e0a882" strokeWidth="1"/>
        <rect x="19" y="15" width="6" height="14" rx="2" fill="#2C5AA0"/>
        <line x1="19" y1="20" x2="8" y2="16" stroke="#5BA4E6" strokeWidth="1.5"/>
        <line x1="25" y1="20" x2="36" y2="16" stroke="#5BA4E6" strokeWidth="1.5"/>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="12" y="10" width="20" height="20" rx="4" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
        <circle cx="18" cy="18" r="2" fill="#FFD700"/>
        <circle cx="26" cy="18" r="2" fill="#FFD700"/>
        <circle cx="22" cy="24" r="2" fill="#5BA4E6"/>
      </svg>
    ),
    medicine: (
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M22 8 C14 8 8 14 8 20 C8 28 14 34 22 36 C30 34 36 28 36 20 C36 14 30 8 22 8Z" fill="none" stroke="#f87171" strokeWidth="1.5"/>
        <line x1="22" y1="14" x2="22" y2="30" stroke="#f87171" strokeWidth="2"/>
        <line x1="14" y1="22" x2="30" y2="22" stroke="#f87171" strokeWidth="2"/>
      </svg>
    ),
    neuro: (
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M22 10 C16 10 12 14 12 18 C10 20 10 24 12 26 C12 30 16 34 22 34 C28 34 32 30 32 26 C34 24 34 20 32 18 C32 14 28 10 22 10Z" fill="none" stroke="#f87171" strokeWidth="1.5"/>
      </svg>
    ),
    llb: (
      <svg viewBox="0 0 44 44" fill="none">
        <line x1="22" y1="8" x2="22" y2="14" stroke="#FFD700" strokeWidth="2"/>
        <line x1="10" y1="14" x2="34" y2="14" stroke="#FFD700" strokeWidth="2.5"/>
        <circle cx="22" cy="34" r="8" fill="#4A90D9" stroke="#2C5AA0" strokeWidth="1.5"/>
      </svg>
    ),
    economics: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="8" y="28" width="6" height="10" rx="2" fill="#FFD700" opacity="0.8"/>
        <rect x="17" y="20" width="6" height="18" rx="2" fill="#5BA4E6"/>
        <rect x="26" y="14" width="6" height="24" rx="2" fill="#FFD700"/>
      </svg>
    ),
    humanities: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="10" y="10" width="24" height="28" rx="3" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
        <line x1="14" y1="17" x2="30" y2="17" stroke="#a78bfa" strokeWidth="1.2" opacity="0.6"/>
        <line x1="14" y1="22" x2="30" y2="22" stroke="#a78bfa" strokeWidth="1.2" opacity="0.6"/>
      </svg>
    ),
    business: (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="10" y="18" width="24" height="16" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5"/>
        <rect x="16" y="14" width="12" height="6" rx="2" fill="none" stroke="#fb923c" strokeWidth="1.5"/>
      </svg>
    ),
    data: (
      <svg viewBox="0 0 44 44" fill="none">
        <polyline points="8,32 16,20 24,26 36,12" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="32" r="2.5" fill="#fb923c"/>
        <circle cx="36" cy="12" r="2.5" fill="#FFD700"/>
      </svg>
    ),
  };
  return icons[type] || null;
}

// ── LOGO COMPONENT ───────────────────────────────────────────
function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="15" fill="url(#logoGradient)"/>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B3A6B" />
          <stop offset="100%" stopColor="#2C5AA0" />
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

// ── MAIN COMPONENT ───────────────────────────────────────────
function LandingPage() {
  useLandingAnimations();
const navigate = useNavigate();

  return (
    <div className="lp">
      <div className="bg"></div>
      <canvas id="pc"></canvas>
      <div className="cg" id="cg"></div>

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="nav">
        <div className="logo">
          <Logo />
          <div className="logo-text">Resea<span>Rc</span></div>
        </div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Explore</a></li>
          <li><a href="#">About us</a></li>
        </ul>
        <div className="lang">En ▾</div>
      </nav>

      {/* ── HERO SECTION ────────────────────────────────── */}
      <div className="section hero-sec">
        <div className="hero-card reveal scale-in" id="heroCard">
          <div className="hero-left">
            <div className="badge reveal from-left">
              <span className="badge-dot"></span>
              AI-powered research matching
            </div>
            <h1 className="hero-title" id="htitle"></h1>
            <p className="hero-sub">
              Connecting students, researchers and academics with
              the right opportunities — powered by intelligent AI matching.
            </p>
            <div className="hero-btns">
              <button className="btn-p" onClick={() => window.open('/auth', '_blank')}>Get Started →</button>
              <button className="btn-s" onClick={() => window.open('/home')}>Explore Projects</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="orbit o1"><div className="od"></div></div>
            <div className="orbit o2"><div className="od od2"></div></div>
            <div className="orbit o3"></div>
            <div className="corner-glow"></div>
            <div className="sci-wrap">
              <svg style={{ width: '220px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(255,210,0,0.15))' }} viewBox="0 0 260 320">
                <ellipse cx="130" cy="315" rx="80" ry="7" fill="rgba(0,0,0,0.3)"/>
                <rect x="25" y="210" width="210" height="13" rx="5" fill="#0d1b2e" opacity="0.95"/>
                <rect x="35" y="223" width="190" height="7" rx="3" fill="#060e1a"/>
                <rect x="30" y="204" width="200" height="9" rx="4" fill="#1B3A6B"/>
                <rect x="58" y="162" width="9" height="44" rx="3" fill="#E8A020"/>
                <ellipse cx="63" cy="160" rx="11" ry="7" fill="#FFD700"/>
                <rect x="72" y="172" width="7" height="34" rx="3" fill="#5BA4E6"/>
                <ellipse cx="76" cy="170" rx="9" ry="6" fill="#7CC4F0"/>
                <rect x="83" y="177" width="6" height="27" rx="3" fill="#E85C5C"/>
                <rect x="92" y="180" width="6" height="24" rx="3" fill="#5BA4E6"/>
                <rect x="101" y="174" width="6" height="30" rx="3" fill="#FFD700"/>
                <rect x="155" y="146" width="58" height="56" rx="8" fill="rgba(255,215,0,0.08)" stroke="rgba(255,215,0,0.35)" strokeWidth="1.5"/>
                <circle cx="174" cy="170" r="14" fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="2"/>
                <circle cx="174" cy="170" r="7" fill="none" stroke="rgba(255,215,0,0.4)" strokeWidth="1.5"/>
                <ellipse cx="130" cy="74" rx="28" ry="30" fill="#FDDBB4"/>
                <path d="M102 70 Q102 42 130 42 Q158 42 158 70" fill="#2C1810"/>
                <ellipse cx="119" cy="79" rx="4.5" ry="5.5" fill="#2C1810"/>
                <ellipse cx="141" cy="79" rx="4.5" ry="5.5" fill="#2C1810"/>
                <ellipse cx="119" cy="78" rx="2" ry="2.5" fill="white"/>
                <ellipse cx="141" cy="78" rx="2" ry="2.5" fill="white"/>
                <path d="M122 91 Q130 97 138 91" stroke="#c07a50" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                <path d="M102 100 Q106 107 112 122 L113 204 L147 204 L148 122 Q154 107 158 100 Q144 95 130 95 Q116 95 102 100Z" fill="#FAFAFA"/>
                <path d="M112 134 L99 160 Q95 172 105 175 Q113 177 116 166 L119 145" fill="#FDDBB4"/>
                <path d="M148 134 L161 160 Q165 172 155 175 Q147 177 144 166 L141 145" fill="#FDDBB4"/>
                <rect x="113" y="204" width="34" height="52" rx="5" fill="#2C5AA0"/>
                <rect x="109" y="235" width="18" height="58" rx="7" fill="#FDDBB4"/>
                <rect x="133" y="235" width="18" height="58" rx="7" fill="#FDDBB4"/>
                <rect x="107" y="285" width="22" height="13" rx="5" fill="#2C1810"/>
                <rect x="131" y="285" width="22" height="13" rx="5" fill="#2C1810"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="scroll-ind"><div className="scroll-line"></div><div className="scroll-dot"></div></div>
      </div>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <div className="stats-sec">
        <div className="stats-bar reveal from-bottom">
          <div className="stat"><div className="stat-n" id="s1">0</div><div className="stat-l">Researchers</div></div>
          <div className="stat"><div className="stat-n" id="s2">0</div><div className="stat-l">Active Projects</div></div>
          <div className="stat"><div className="stat-n" id="s3">0</div><div className="stat-l">Universities</div></div>
          <div className="stat"><div className="stat-n" id="s4">0</div><div className="stat-l">Collaborations</div></div>
        </div>
      </div>

      {/* ── CATEGORIES SECTION ──────────────────────────── */}
      <div className="cats-sec">
        <div className="cats-head reveal from-bottom">
          <h2>Explore Research Fields</h2>
          <p>Browse all disciplines or search for something specific</p>
        </div>

        <div className="cat-search-wrap reveal from-bottom">
          <input
            className="cat-search"
            id="catSearch"
            type="text"
            placeholder="Search research fields... e.g. Machine Learning, Medicine"
          />
          <button className="search-btn" id="searchBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0d1b2e" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        <div className="filter-chips reveal from-bottom" id="filterChips">
          {filterGroups.map((g) => (
            <div
              key={g.id}
              className={`chip ${g.id === 'all' ? 'active' : ''}`}
              data-group={g.id}
            >
              {g.label}
            </div>
          ))}
        </div>

        <div className="cat-grid" id="catGrid">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="cat-card reveal from-bottom"
              data-cat={cat.group}
              data-name={cat.name.toLowerCase()}
              style={{ display: i >= 6 ? 'none' : 'flex' }}
            >
              <div className="cat-icon-box">
                <CategoryIcon type={cat.icon} />
              </div>
              <span className="cat-name">{cat.name}</span>
            </div>
          ))}
          <div className="no-results" id="noResults">
            No fields found for "<span id="searchTerm"></span>" — try a different keyword
          </div>
        </div>

        <div className="view-all-wrap reveal from-bottom">
          <button className="btn-view-all" id="viewAllBtn">Show All Fields ↓</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;