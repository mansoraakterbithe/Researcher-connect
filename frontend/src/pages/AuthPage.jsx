// ============================================================
// FILE: src/pages/AuthPage.jsx
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/AuthPage.css";

// UK universities list for autocomplete
// 🍰 EXAMPLE: stored outside the component so it's not
// recreated every time the component re-renders
const UK_UNIVERSITIES = [
  "University of Bristol",
  "University of Oxford",
  "University of Cambridge",
  "University College London",
  "Imperial College London",
  "University of Edinburgh",
  "King's College London",
  "University of Manchester",
  "University of Warwick",
  "UWE Bristol",
  "University of Bath",
  "University of Exeter",
  "University of Birmingham",
  "University of Leeds",
  "University of Sheffield",
  "University of Nottingham",
  "University of Southampton",
  "University of Glasgow",
  "Durham University",
  "University of St Andrews",
];

function AuthPage() {
  const navigate = useNavigate();

  // ── WHICH FORM ARE WE SHOWING ─────────────────────────────
  const [mode, setMode] = useState("signup");

  // ── ROLE: student or supervisor ───────────────────────────
  const [role, setRole] = useState("student");
  // 🍰 EXAMPLE: starts as 'student'. When user clicks the
  // Supervisor card, setRole('supervisor') updates this,
  // and the form immediately adjusts — hiding skills field,
  // showing the .ac.uk note, changing email placeholder.

  // ── SKILL TAGS ────────────────────────────────────────────
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  // 🍰 EXAMPLE: skills is an array ["Python", "R", "SPSS"].
  // skillInput is what's currently being typed.
  // They're separate because one is committed (the tag exists)
  // and one is in-progress (still being typed).

  // ── FORM DATA ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    university: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── HANDLE TYPING ─────────────────────────────────────────
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // ── ADD A SKILL TAG ───────────────────────────────────────
  function handleSkillKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim().replace(",", "");
      // 🍰 EXAMPLE: trim() removes spaces, replace(',','') removes
      // any comma the user typed — we accept both Enter and comma
      // as "add this skill" triggers
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        // 🍰 EXAMPLE: [...skills, val] creates a NEW array with
        // all existing skills PLUS the new one. We never modify
        // the existing array directly — React needs a new array
        // to know something changed and re-render.
      }
      setSkillInput("");
    }
  }

  // ── REMOVE A SKILL TAG ────────────────────────────────────
  function removeSkill(skillToRemove) {
    setSkills(skills.filter((s) => s !== skillToRemove));
    // 🍰 EXAMPLE: filter() returns a new array containing ONLY
    // items where the condition is true. Here: keep all skills
    // that are NOT the one we're removing. One line, no loops.
  }

  // ── SUBMIT FORM ───────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // .ac.uk validation for supervisors
    if (role === "supervisor" && !formData.email.endsWith(".ac.uk")) {
      setError("Supervisors must use an institutional .ac.uk email address");
      setLoading(false);
      return;
      // 🍰 EXAMPLE: .endsWith() checks if a string ends with
      // specific characters — like checking if a word ends with
      // "ing". If not .ac.uk, we stop here with an error message
      // before even touching the backend.
    }

    try {
      const endpoint =
        mode === "signup"
          ? "http://localhost:5000/api/auth/signup"
          : "http://localhost:5000/api/auth/login";

      const body =
        mode === "signup"
          ? {
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role,
              university: formData.university,
              skills,
            }
          : {
              email: formData.email,
              password: formData.password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // 🍰 EXAMPLE: we also save the user object so any page
      // can read the user's name, role, and id without asking
      // the backend again. JSON.stringify converts the object
      // to text so localStorage can store it (it only stores text)

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ap">
      <div className="ap-card">
        {/* LOGO */}
        <div className="ap-logo">
          <svg viewBox="0 0 48 48" width="40" height="40">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(255,210,0,0.3)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx="24" cy="24" r="15" fill="url(#authLogoGrad)" />
            <defs>
              <linearGradient
                id="authLogoGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1B3A6B" />
                <stop offset="100%" stopColor="#2C5AA0" />
              </linearGradient>
            </defs>
            <path d="M24 16 L34 20 L24 24 L14 20 Z" fill="#FFD700" />
            <path
              d="M18 22 L18 27 Q24 30 30 27 L30 22"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1.5"
            />
            <line
              x1="34"
              y1="20"
              x2="34"
              y2="26"
              stroke="#FFD700"
              strokeWidth="1.2"
            />
            <circle cx="34" cy="27" r="1.3" fill="#FFD700" />
            <circle cx="40" cy="14" r="2.5" fill="#FFD700" />
            <circle cx="8" cy="32" r="2" fill="#5BA4E6" />
          </svg>
          <div className="ap-logo-text">
            Resea<span>Rc</span>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="ap-toggle">
          <div
            className={`ap-toggle-slider ${mode === "login" ? "login" : ""}`}
          ></div>
          <div
            className={`ap-toggle-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </div>
          <div
            className={`ap-toggle-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </div>
        </div>

        {error && <div className="ap-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── SIGNUP FIELDS ─────────────────────────────── */}
          {mode === "signup" && (
            <>
              <div className="ap-title">Create Your Account</div>
              <div className="ap-sub">Join the UK research community</div>

              {/* ROLE SELECTOR */}
              <div className="ap-field">
                <label className="ap-label">I am a...</label>
                <div className="ap-role-wrap">
                  <div
                    className={`ap-role-btn ${role === "student" ? "selected" : ""}`}
                    onClick={() => setRole("student")}
                  >
                    <div className="ap-role-icon">🎓</div>
                    <div className="ap-role-label">Student</div>
                    <div className="ap-role-desc">
                      Looking for opportunities
                    </div>
                  </div>
                  <div
                    className={`ap-role-btn ${role === "supervisor" ? "selected" : ""}`}
                    onClick={() => setRole("supervisor")}
                  >
                    <div className="ap-role-icon">🔬</div>
                    <div className="ap-role-label">Supervisor</div>
                    <div className="ap-role-desc">Posting opportunities</div>
                  </div>
                </div>
              </div>

              {/* SUPERVISOR NOTE */}
              {role === "supervisor" && (
                <div className="ap-supervisor-note">
                  ℹ️ Use your institutional <strong>.ac.uk</strong> email to get
                  a verified supervisor badge visible to all students.
                </div>
              )}

              {/* USERNAME */}
              <div className="ap-field">
                <label className="ap-label">Username</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="username"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* EMAIL */}
              <div className="ap-field">
                <label className="ap-label">Email</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="email"
                    type="email"
                    placeholder={
                      role === "supervisor"
                        ? "you@university.ac.uk"
                        : "you@email.com"
                    }
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 6 10-6" />
                  </svg>
                </div>
              </div>

              {/* UNIVERSITY */}
              <div className="ap-field">
                <label className="ap-label">University</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="university"
                    placeholder="e.g. University of Bristol"
                    list="ukUnis"
                    value={formData.university}
                    onChange={handleChange}
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" />
                  </svg>
                  <datalist id="ukUnis">
                    {UK_UNIVERSITIES.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* SKILLS — students only */}
              {role === "student" && (
                <div className="ap-field">
                  <label className="ap-label">
                    Your Skills
                    <span className="ap-label-hint"> — press Enter to add</span>
                  </label>
                  <div className="ap-skills-wrap">
                    <div className="ap-skills-tags">
                      {skills.map((s) => (
                        <div key={s} className="ap-skill-tag">
                          {s}
                          <span
                            className="ap-skill-x"
                            onClick={() => removeSkill(s)}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                    <input
                      className="ap-skills-input"
                      placeholder="e.g. Python, R, SPSS, Machine Learning..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                    />
                  </div>
                  <div className="ap-skills-hint">
                    These power your smart research matches
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div className="ap-field">
                <label className="ap-label">Password</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="password"
                    type="password"
                    placeholder="min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* ── LOGIN FIELDS ─────────────────────────────── */}
          {mode === "login" && (
            <>
              <div className="ap-title">Welcome Back</div>
              <div className="ap-sub">
                Login to continue your research journey
              </div>

              <div className="ap-field">
                <label className="ap-label">Email</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 6 10-6" />
                  </svg>
                </div>
              </div>

              <div className="ap-field">
                <label className="ap-label">Password</label>
                <div className="ap-input-wrap">
                  <input
                    className="ap-input"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <svg
                    className="ap-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>

              <div className="ap-forgot-wrap">
                <span className="ap-forgot">Forgot Password?</span>
              </div>
            </>
          )}

          <button className="ap-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="ap-divider">or continue with</div>
        <div className="ap-socials">
          <div className="ap-soc-btn">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </div>
          <div className="ap-soc-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </div>
        </div>

        <div className="ap-switch">
          {mode === "signup" ? (
            <span>
              Already have an account?{" "}
              <span className="ap-link" onClick={() => setMode("login")}>
                Login Now
              </span>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <span className="ap-link" onClick={() => setMode("signup")}>
                Sign Up
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
