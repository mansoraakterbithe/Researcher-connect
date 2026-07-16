import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/EditProfilePage.css';
import Footer from '../components/Footer';

function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="32" height="32">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="15" fill="url(#epLogoGrad)"/>
      <defs>
        <linearGradient id="epLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

// ── INITIAL FORM DATA ─────────────────────────────────────────
// 🍰 Later this will come from your backend API:
// const profile = await fetch('/api/profile/me')
const INITIAL_DATA = {
  // Basic info
  name: 'Mansora Akter Bithe',
  role: 'student',
  university: 'UWE Bristol',
  department: 'Data Science & AI',
  location: 'Bristol, United Kingdom',
  remote: true,
  about: 'Data Scientist and AI researcher with a published IEEE paper on skin disease classification (ICCIT 2024). Currently completing BSc Top-Up in Data Science & AI at UWE Bristol. My research focuses on medical image analysis, explainable AI, and building tools that make AI accessible in clinical settings.',

  // Student specific
  seekingSupervisor: true,
  targetDegree: 'PhD',
  fundingNeeded: 'Full scholarship preferred',
  availableFrom: 'September 2026',

  // Supervisor specific
  availabilityStatus: 'open',
  fundedSlots: 2,
  scholarshipInfo: '',
  requirements: '',
  responseTime: '3-5 days',

  // Open to
  openTo: {
    collaboration: true,
    coauthorship: true,
    phd: true,
    supervision: false,
    international: false,
  },

  // Skills
  skills: ['Python', 'TensorFlow', 'PyTorch', 'SHAP', 'Scikit-learn', 'LightGBM', 'R', 'OpenCV', 'Flask', 'React', 'MongoDB', 'SQL'],

  // Research interests
  researchInterests: ['Medical Imaging', 'Explainable AI', 'Deep Learning', 'Computer Vision'],

  // Social links
  linkedin: 'https://linkedin.com/in/mansora',
  github: 'https://github.com/mansoraakterbithe',
  twitter: '',
  website: '',

  // Status
  status: 'active',
};

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: '👤' },
  { id: 'about', label: 'About', icon: '📝' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'opento', label: 'Open To', icon: '🎯' },
  { id: 'social', label: 'Social Links', icon: '🔗' },
  { id: 'availability', label: 'Availability', icon: '📅' },
];

function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_DATA);
  const [activeSection, setActiveSection] = useState('basic');
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const isStudent = form.role === 'student';
  const isSupervisor = form.role === 'supervisor';

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleOpenToChange(key) {
    setForm(prev => ({
      ...prev,
      openTo: { ...prev.openTo, [key]: !prev.openTo[key] }
    }));
  }

  function addSkill(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(',', '');
      if (val && !form.skills.includes(val)) {
        setForm(prev => ({ ...prev, skills: [...prev.skills, val] }));
      }
      setSkillInput('');
    }
  }

  function removeSkill(skill) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  function addInterest(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = interestInput.trim().replace(',', '');
      if (val && !form.researchInterests.includes(val)) {
        setForm(prev => ({ ...prev, researchInterests: [...prev.researchInterests, val] }));
      }
      setInterestInput('');
    }
  }

  function removeInterest(interest) {
    setForm(prev => ({ ...prev, researchInterests: prev.researchInterests.filter(i => i !== interest) }));
  }

  async function handleSave() {
    setSaving(true);
    // 🍰 Later: await fetch('/api/profile/me', { method: 'PUT', body: JSON.stringify(form) })
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="ep">

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="ep-nav">
        <div className="ep-nav-left">
          <div className="ep-logo" onClick={() => navigate('/')}>
            <Logo/>
            <span className="ep-logo-text">Resea<span>Rc</span></span>
          </div>
        </div>
        <div className="ep-nav-center">
          <span className="ep-nav-title">Edit Profile</span>
        </div>
        <div className="ep-nav-right">
          <button className="ep-cancel-btn" onClick={() => navigate('/profile')}>
            Cancel
          </button>
          <button
            className={`ep-save-btn ${saving ? 'saving' : ''} ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </nav>

      <div className="ep-body">

        {/* ── LEFT SIDEBAR — SECTION NAV ───────────────── */}
        <aside className="ep-sidebar">
          {/* AVATAR PREVIEW */}
          <div className="ep-avatar-preview">
            <div className="ep-avatar">M</div>
            <button className="ep-avatar-change">📷 Change Photo</button>
          </div>

          <div className="ep-sidebar-divider"/>

          {/* SECTION LINKS */}
          {SECTIONS.map(section => (
            // hide availability section for students
            (section.id === 'availability' && isStudent) ? null : (
              <div
                key={section.id}
                className={`ep-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="ep-sidebar-icon">{section.icon}</span>
                {section.label}
              </div>
            )
          ))}

          <div className="ep-sidebar-divider"/>

          {/* PROFILE PREVIEW LINK */}
          <div className="ep-sidebar-item preview" onClick={() => navigate('/profile')}>
            <span className="ep-sidebar-icon">👁️</span>
            Preview Profile
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main className="ep-main">

          {/* ── BASIC INFO ──────────────────────────────── */}
          {activeSection === 'basic' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">👤 Basic Information</div>
                <div className="ep-section-sub">Your public identity on ResearchConnect</div>
              </div>

              {/* COVER PHOTO */}
              <div className="ep-card">
                <div className="ep-card-label">Cover Photo</div>
                <div className="ep-cover-upload">
                  <div className="ep-cover-preview">
                    <div className="ep-cover-gradient"/>
                    <button className="ep-cover-btn">📷 Change Cover Photo</button>
                  </div>
                </div>
              </div>

              <div className="ep-card">
                <div className="ep-field">
                  <label className="ep-label">Full Name *</label>
                  <input className="ep-input"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Your full name"/>
                </div>

                <div className="ep-row">
                  <div className="ep-field">
                    <label className="ep-label">University / Institution *</label>
                    <input className="ep-input"
                      value={form.university}
                      onChange={e => handleChange('university', e.target.value)}
                      placeholder="e.g. UWE Bristol"/>
                  </div>
                  <div className="ep-field">
                    <label className="ep-label">Department / Faculty</label>
                    <input className="ep-input"
                      value={form.department}
                      onChange={e => handleChange('department', e.target.value)}
                      placeholder="e.g. Data Science & AI"/>
                  </div>
                </div>

                <div className="ep-row">
                  <div className="ep-field">
                    <label className="ep-label">Location</label>
                    <input className="ep-input"
                      value={form.location}
                      onChange={e => handleChange('location', e.target.value)}
                      placeholder="e.g. Bristol, United Kingdom"/>
                  </div>
                  <div className="ep-field">
                    <label className="ep-label">Role</label>
                    <select className="ep-input ep-select"
                      value={form.role}
                      onChange={e => handleChange('role', e.target.value)}>
                      <option value="student">Student / Researcher</option>
                      <option value="supervisor">Supervisor / Professor</option>
                    </select>
                  </div>
                </div>

                <div className="ep-field">
                  <label className="ep-label">Online Status</label>
                  <div className="ep-status-row">
                    {[
                      { val: 'active', label: '🟢 Actively Looking', desc: 'Visible to supervisors browsing students' },
                      { val: 'passive', label: '🟡 Open but not urgent', desc: 'Visible but not highlighted' },
                      { val: 'closed', label: '🔴 Not available', desc: 'Hidden from search results' },
                    ].map(s => (
                      <div
                        key={s.val}
                        className={`ep-status-option ${form.status === s.val ? 'active' : ''}`}
                        onClick={() => handleChange('status', s.val)}
                      >
                        <div className="ep-status-label">{s.label}</div>
                        <div className="ep-status-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ep-field">
                  <div className="ep-toggle-row">
                    <div>
                      <div className="ep-label">Open to Remote Collaboration</div>
                      <div className="ep-sublabel">Show "Open to Remote" on your profile</div>
                    </div>
                    <div
                      className={`ep-toggle ${form.remote ? 'on' : ''}`}
                      onClick={() => handleChange('remote', !form.remote)}
                    >
                      <div className="ep-toggle-dot"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* STUDENT SPECIFIC */}
              {isStudent && (
                <div className="ep-card">
                  <div className="ep-card-label">PhD / Research Search</div>

                  <div className="ep-field">
                    <div className="ep-toggle-row">
                      <div>
                        <div className="ep-label">Actively Seeking PhD Supervisor</div>
                        <div className="ep-sublabel">Shows a banner on your profile visible to supervisors</div>
                      </div>
                      <div
                        className={`ep-toggle ${form.seekingSupervisor ? 'on' : ''}`}
                        onClick={() => handleChange('seekingSupervisor', !form.seekingSupervisor)}
                      />
                    </div>
                  </div>

                  {form.seekingSupervisor && (
                    <>
                      <div className="ep-row">
                        <div className="ep-field">
                          <label className="ep-label">Target Degree</label>
                          <select className="ep-input ep-select"
                            value={form.targetDegree}
                            onChange={e => handleChange('targetDegree', e.target.value)}>
                            <option value="PhD">PhD</option>
                            <option value="Masters">Masters by Research</option>
                            <option value="MPhil">MPhil</option>
                            <option value="Postdoc">Postdoc</option>
                          </select>
                        </div>
                        <div className="ep-field">
                          <label className="ep-label">Available From</label>
                          <input className="ep-input"
                            value={form.availableFrom}
                            onChange={e => handleChange('availableFrom', e.target.value)}
                            placeholder="e.g. September 2026"/>
                        </div>
                      </div>

                      <div className="ep-field">
                        <label className="ep-label">Funding Situation</label>
                        <select className="ep-input ep-select"
                          value={form.fundingNeeded}
                          onChange={e => handleChange('fundingNeeded', e.target.value)}>
                          <option value="Self-funded">Self-funded</option>
                          <option value="Seeking partial funding">Seeking partial funding</option>
                          <option value="Full scholarship preferred">Full scholarship preferred</option>
                          <option value="Open to discussion">Open to discussion</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ABOUT ───────────────────────────────────── */}
          {activeSection === 'about' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">📝 About You</div>
                <div className="ep-section-sub">Tell the research community who you are</div>
              </div>

              <div className="ep-card">
                <div className="ep-field">
                  <label className="ep-label">
                    About / Bio
                    <span className="ep-char">{form.about.length}/1000</span>
                  </label>
                  <textarea className="ep-input ep-ta" rows={8} maxLength={1000}
                    value={form.about}
                    onChange={e => handleChange('about', e.target.value)}
                    placeholder="Tell people about your research background, interests, and goals..."/>
                  <div className="ep-field-hint">
                    Tips: mention your research area, key projects, what you are looking for
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESEARCH ────────────────────────────────── */}
          {activeSection === 'research' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">🔬 Research Interests</div>
                <div className="ep-section-sub">Help the matching engine find the right people for you</div>
              </div>

              <div className="ep-card">
                <div className="ep-field">
                  <label className="ep-label">Research Interests</label>
                  <div className="ep-tags-wrap">
                    <div className="ep-tags-list">
                      {form.researchInterests.map(interest => (
                        <div key={interest} className="ep-tag-pill interest">
                          {interest}
                          <span className="ep-tag-x" onClick={() => removeInterest(interest)}>×</span>
                        </div>
                      ))}
                    </div>
                    <input className="ep-tags-input"
                      placeholder="Type an interest and press Enter..."
                      value={interestInput}
                      onChange={e => setInterestInput(e.target.value)}
                      onKeyDown={addInterest}/>
                  </div>
                  <div className="ep-field-hint">e.g. Medical Imaging, Explainable AI, NLP, Computer Vision</div>
                </div>

                {/* QUICK ADD SUGGESTIONS */}
                <div className="ep-field">
                  <label className="ep-label">Quick Add</label>
                  <div className="ep-quick-add">
                    {[
                      'Machine Learning', 'Deep Learning', 'Computer Vision',
                      'NLP', 'Medical Imaging', 'Explainable AI',
                      'Reinforcement Learning', 'Data Science', 'Bioinformatics',
                      'Robotics', 'Climate AI', 'Healthcare AI',
                    ].filter(s => !form.researchInterests.includes(s)).map(s => (
                      <span
                        key={s}
                        className="ep-quick-tag"
                        onClick={() => {
                          if (!form.researchInterests.includes(s)) {
                            setForm(prev => ({ ...prev, researchInterests: [...prev.researchInterests, s] }));
                          }
                        }}
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SKILLS ──────────────────────────────────── */}
          {activeSection === 'skills' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">⚡ Skills & Tools</div>
                <div className="ep-section-sub">Technical skills that appear on your profile</div>
              </div>

              <div className="ep-card">
                <div className="ep-field">
                  <label className="ep-label">Your Skills</label>
                  <div className="ep-tags-wrap">
                    <div className="ep-tags-list">
                      {form.skills.map(skill => (
                        <div key={skill} className="ep-tag-pill skill">
                          {skill}
                          <span className="ep-tag-x" onClick={() => removeSkill(skill)}>×</span>
                        </div>
                      ))}
                    </div>
                    <input className="ep-tags-input"
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}/>
                  </div>
                  <div className="ep-field-hint">Press Enter or comma to add · Click × to remove</div>
                </div>

                {/* QUICK ADD */}
                <div className="ep-field">
                  <label className="ep-label">Quick Add Common Skills</label>
                  <div className="ep-quick-add">
                    {[
                      'Python', 'R', 'MATLAB', 'SQL', 'TensorFlow', 'PyTorch',
                      'Scikit-learn', 'SHAP', 'OpenCV', 'HuggingFace',
                      'LangChain', 'FastAPI', 'Docker', 'Git', 'LaTeX',
                      'SPSS', 'Excel', 'Tableau', 'Power BI',
                    ].filter(s => !form.skills.includes(s)).map(s => (
                      <span
                        key={s}
                        className="ep-quick-tag"
                        onClick={() => {
                          if (!form.skills.includes(s)) {
                            setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
                          }
                        }}
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── OPEN TO ─────────────────────────────────── */}
          {activeSection === 'opento' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">🎯 Open To</div>
                <div className="ep-section-sub">Tell people what kinds of opportunities you want</div>
              </div>

              <div className="ep-card">
                {[
                  { key: 'collaboration', label: '🔬 Research Collaboration', desc: 'Working together on a research project' },
                  { key: 'coauthorship', label: '📚 Co-authorship', desc: 'Writing a paper together' },
                  { key: 'phd', label: '🎓 PhD Opportunities', desc: 'Looking for PhD supervision' },
                  { key: 'supervision', label: '👨‍🏫 Supervision', desc: 'Open to supervising students (supervisors only)' },
                  { key: 'international', label: '🌍 International Projects', desc: 'Open to collaborating with international researchers' },
                ].map(item => (
                  <div key={item.key} className="ep-opento-row">
                    <div className="ep-opento-info">
                      <div className="ep-opento-label">{item.label}</div>
                      <div className="ep-opento-desc">{item.desc}</div>
                    </div>
                    <div
                      className={`ep-toggle ${form.openTo[item.key] ? 'on' : ''}`}
                      onClick={() => handleOpenToChange(item.key)}
                    >
                      <div className="ep-toggle-dot"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SOCIAL LINKS ────────────────────────────── */}
          {activeSection === 'social' && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">🔗 Social Links</div>
                <div className="ep-section-sub">Connect your other profiles and websites</div>
              </div>

              <div className="ep-card">
                {[
                  { field: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/yourname' },
                  { field: 'github', label: 'GitHub', icon: '💻', placeholder: 'https://github.com/yourname' },
                  { field: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/yourname' },
                  { field: 'website', label: 'Personal Website', icon: '🌐', placeholder: 'https://yourwebsite.com' },
                ].map(link => (
                  <div key={link.field} className="ep-field">
                    <label className="ep-label">{link.icon} {link.label}</label>
                    <input className="ep-input"
                      value={form[link.field]}
                      onChange={e => handleChange(link.field, e.target.value)}
                      placeholder={link.placeholder}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AVAILABILITY — SUPERVISOR ONLY ──────────── */}
          {activeSection === 'availability' && isSupervisor && (
            <div className="ep-section">
              <div className="ep-section-head">
                <div className="ep-section-title">📅 Supervisor Availability</div>
                <div className="ep-section-sub">Students will see this on your profile when deciding to apply</div>
              </div>

              <div className="ep-card">
                <div className="ep-field">
                  <label className="ep-label">Current Status</label>
                  <div className="ep-status-row">
                    {[
                      { val: 'open', label: '🟢 Open', desc: 'Currently accepting students' },
                      { val: 'limited', label: '🟡 Limited', desc: 'A few spots left' },
                      { val: 'closed', label: '🔴 Closed', desc: 'Not taking students right now' },
                    ].map(s => (
                      <div
                        key={s.val}
                        className={`ep-status-option ${form.availabilityStatus === s.val ? 'active' : ''}`}
                        onClick={() => handleChange('availabilityStatus', s.val)}
                      >
                        <div className="ep-status-label">{s.label}</div>
                        <div className="ep-status-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ep-row">
                  <div className="ep-field">
                    <label className="ep-label">Funded PhD Slots</label>
                    <input className="ep-input" type="number" min="0" max="10"
                      value={form.fundedSlots}
                      onChange={e => handleChange('fundedSlots', e.target.value)}/>
                  </div>
                  <div className="ep-field">
                    <label className="ep-label">Typical Response Time</label>
                    <select className="ep-input ep-select"
                      value={form.responseTime}
                      onChange={e => handleChange('responseTime', e.target.value)}>
                      <option value="1-2 days">1-2 days</option>
                      <option value="3-5 days">3-5 days</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="2+ weeks">2+ weeks</option>
                    </select>
                  </div>
                </div>

                <div className="ep-field">
                  <label className="ep-label">Scholarship / Funding Info</label>
                  <textarea className="ep-input ep-ta" rows={3}
                    value={form.scholarshipInfo}
                    onChange={e => handleChange('scholarshipInfo', e.target.value)}
                    placeholder="e.g. Full UKRI scholarship available for exceptional candidates..."/>
                </div>

                <div className="ep-field">
                  <label className="ep-label">Student Requirements</label>
                  <textarea className="ep-input ep-ta" rows={3}
                    value={form.requirements}
                    onChange={e => handleChange('requirements', e.target.value)}
                    placeholder="e.g. Strong Python skills, ML background, interest in medical AI..."/>
                </div>
              </div>
            </div>
          )}

          {/* ── SAVE BUTTON (bottom) ─────────────────────── */}
          <div className="ep-bottom-save">
            <button className="ep-cancel-flat" onClick={() => navigate('/profile')}>
              Cancel — go back to profile
            </button>
            <button
              className={`ep-save-btn ${saving ? 'saving' : ''} ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>

      <Footer/>
    </div>
  );
}

export default EditProfilePage;