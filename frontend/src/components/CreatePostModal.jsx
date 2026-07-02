// ============================================================
// FILE: src/components/CreatePostModal.jsx
// Shared component — used on every page that has a navbar
// ============================================================

import { useState } from 'react';
import './CreatePostModal.css';

// ── POST TYPES ───────────────────────────────────────────────
const POST_TYPES = [
  { id: 'post', icon: '📄', label: 'Post', supervisorOnly: false },
  { id: 'paper', icon: '🔬', label: 'Paper', supervisorOnly: false },
  { id: 'question', icon: '❓', label: 'Question', supervisorOnly: false },
  { id: 'need', icon: '🆘', label: 'Need Help', supervisorOnly: false },
  { id: 'opportunity', icon: '💼', label: 'Opportunity', supervisorOnly: true },
];

// ── AI SIMULATED RESPONSES ───────────────────────────────────
// 🍰 EXAMPLE: these are fake AI responses that look real.
// When we connect to Claude API later, we replace the
// simulateAI function body with a real fetch() call.
// Everything else stays exactly the same.
const AI_TAG_SUGGESTIONS = {
  post: ['Machine Learning', 'Medical Imaging', 'Deep Learning', 'Python', 'Research'],
  paper: ['CNN', 'Transfer Learning', 'Computer Vision', 'Healthcare AI', 'PyTorch'],
  question: ['Debugging', 'Best Practice', 'Help Needed', 'Python', 'Statistics'],
  need: ['Collaboration', 'Co-author', 'Research Partner', 'Urgent', 'Academic'],
  opportunity: ['PhD Position', 'Funded', 'UK Research', 'Supervisor', 'Application Open'],
};

const AI_DESCRIPTIONS = {
  paper: 'This paper presents a comprehensive study of deep learning architectures for automated classification using state-of-the-art transfer learning techniques. The proposed approach achieves superior performance on established benchmark datasets, demonstrating significant improvements over existing baseline methods across multiple evaluation metrics.',
  opportunity: 'We are seeking a motivated and talented researcher to join our team. The ideal candidate will have a strong background in the relevant field with demonstrable experience in research methodology. This funded position offers excellent opportunities for academic development and publication in top-tier venues.',
};

const AI_REVIEW_FEEDBACK = {
  good: '✅ Your post looks clear and well-structured. The title is descriptive and the content gives enough context for other researchers to engage meaningfully.',
  improve: '⚠️ Consider adding more specific details about your methodology or findings. Adding relevant tags will help the right researchers discover your post.',
};

function CreatePostModal({ onClose, userRole = 'student' }) {
  const isSupervisor = userRole === 'supervisor';

  // ── STATE ──────────────────────────────────────────────────
  const [activeType, setActiveType] = useState('post');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [aiLoading, setAiLoading] = useState('');
  const [aiSuggestedTags, setAiSuggestedTags] = useState([]);
  const [aiDescription, setAiDescription] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    abstract: '',
    venue: '',
    year: '',
    link: '',
    question: '',
    context: '',
    needTitle: '',
    needDetails: '',
    urgency: 'low',
    oppTitle: '',
    oppDescription: '',
    oppRequirements: '',
    oppDuration: '',
    oppLocation: '',
    oppDeadline: '',
    oppFunding: '',
  });

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear AI review when user edits
    if (aiReview) setAiReview('');
  }

  // ── TAG MANAGEMENT ─────────────────────────────────────────
  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput.trim().replace(',', ''));
    }
  }

  function addTag(val) {
    if (val && !tags.includes(val)) {
      setTags(prev => [...prev, val]);
    }
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function addSuggestedTag(tag) {
    if (!tags.includes(tag)) setTags(prev => [...prev, tag]);
    setAiSuggestedTags(prev => prev.filter(t => t !== tag));
  }

  // ── AI FEATURES ────────────────────────────────────────────
  // 🍰 EXAMPLE: simulateAI is like a fake phone call.
  // It rings (loading state), waits 1.5 seconds, then
  // "answers" with a pre-written response.
  // Later: replace the setTimeout with a real fetch() to
  // your backend which calls Claude API.
  async function simulateAI(feature) {
    setAiLoading(feature);
    // Simulated delay — replace with real API call later:
    // const res = await fetch('/api/ai/suggest-tags', { body: JSON.stringify({ content }) })
    // const data = await res.json()
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (feature === 'tags') {
      setAiSuggestedTags(AI_TAG_SUGGESTIONS[activeType] || []);
    }
    if (feature === 'description') {
      setAiDescription(AI_DESCRIPTIONS[activeType] || AI_DESCRIPTIONS.paper);
    }
    if (feature === 'review') {
      const hasContent = formData.title || formData.content || formData.question;
      setAiReview(hasContent ? AI_REVIEW_FEEDBACK.good : AI_REVIEW_FEEDBACK.improve);
    }

    setAiLoading('');
  }

  function useAIDescription() {
    if (activeType === 'paper') handleChange('abstract', aiDescription);
    if (activeType === 'opportunity') handleChange('oppDescription', aiDescription);
    setAiDescription('');
  }

  // ── SUBMIT ─────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    // Later: send formData + tags to your backend API
    // await fetch('/api/posts', { method: 'POST', body: JSON.stringify({ ...formData, tags, type: activeType }) })
    setSubmitted(true);
  }

  // ── CLOSE ON OVERLAY CLICK ─────────────────────────────────
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (submitted) {
    return (
      <div className="cpm-overlay" onClick={handleOverlayClick}>
        <div className="cpm-modal">
          <div className="cpm-success">
            <div className="cpm-success-icon">🎉</div>
            <div className="cpm-success-title">Posted Successfully!</div>
            <div className="cpm-success-sub">
              Your {activeType === 'post' ? 'post' : activeType === 'paper' ? 'paper' : activeType === 'question' ? 'question' : activeType === 'need' ? 'help request' : 'opportunity'} is now live on the feed.
              The AI matching engine will notify relevant researchers automatically.
            </div>
            <button className="cpm-success-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cpm-overlay" onClick={handleOverlayClick}>
      <div className="cpm-modal" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="cpm-head">
          <div className="cpm-title">Create Post</div>
          <button className="cpm-x" onClick={onClose}>✕</button>
        </div>

        {/* ── POST TYPE SELECTOR ───────────────────────────── */}
        <div className="cpm-types">
          {POST_TYPES.map(type => (
            <div
              key={type.id}
              className={`cpm-type-btn ${activeType === type.id ? 'active' : ''} ${type.supervisorOnly && !isSupervisor ? 'locked' : ''}`}
              onClick={() => {
                if (type.supervisorOnly && !isSupervisor) return;
                setActiveType(type.id);
                setAiSuggestedTags([]);
                setAiDescription('');
                setAiReview('');
              }}
              title={type.supervisorOnly && !isSupervisor ? 'Only verified supervisors can post opportunities' : ''}
            >
              <div className="cpm-type-icon">{type.icon}</div>
              <div className="cpm-type-label">{type.label}</div>
              {type.supervisorOnly && !isSupervisor && (
                <div className="cpm-type-lock">Supervisors only</div>
              )}
            </div>
          ))}
        </div>

        <div className="cpm-divider"/>

        {/* ── FORM ────────────────────────────────────────── */}
        <form className="cpm-form" onSubmit={handleSubmit}>

          {/* ── POST FORM ───────────────────────────────── */}
          {activeType === 'post' && (
            <>
              <div className="cpm-field">
                <label className="cpm-label">
                  Title
                  <span className="cpm-char">{formData.title.length}/100</span>
                </label>
                <input className="cpm-input" maxLength={100}
                  placeholder="What's your research update?"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  required/>
              </div>
              <div className="cpm-field">
                <label className="cpm-label">
                  Content
                  <span className="cpm-char">{formData.content.length}/1000</span>
                </label>
                <textarea className="cpm-input cpm-ta" rows={5} maxLength={1000}
                  placeholder="Share your thoughts, findings, or updates with the research community..."
                  value={formData.content}
                  onChange={e => handleChange('content', e.target.value)}
                  required/>
              </div>
            </>
          )}

          {/* ── PAPER FORM ──────────────────────────────── */}
          {activeType === 'paper' && (
            <>
              <div className="cpm-field">
                <label className="cpm-label">Paper Title *</label>
                <input className="cpm-input"
                  placeholder="e.g. Deep Learning for Skin Disease Classification"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  required/>
              </div>

              <div className="cpm-field">
                <label className="cpm-label">
                  Abstract
                  <button type="button" className="cpm-ai-inline-btn"
                    onClick={() => simulateAI('description')}
                    disabled={!formData.title || aiLoading === 'description'}>
                    {aiLoading === 'description' ? '⏳ Generating...' : '✨ AI Generate from Title'}
                  </button>
                </label>
                {aiDescription && (
                  <div className="cpm-ai-box">
                    <div className="cpm-ai-box-head">
                      <span className="cpm-ai-label">✨ AI Generated</span>
                      <button type="button" className="cpm-ai-use" onClick={useAIDescription}>Use This →</button>
                    </div>
                    <div className="cpm-ai-text">{aiDescription}</div>
                  </div>
                )}
                <textarea className="cpm-input cpm-ta" rows={4}
                  placeholder="Brief summary of your paper..."
                  value={formData.abstract}
                  onChange={e => handleChange('abstract', e.target.value)}/>
              </div>

              <div className="cpm-row">
                <div className="cpm-field">
                  <label className="cpm-label">Journal / Conference</label>
                  <input className="cpm-input"
                    placeholder="e.g. IEEE ICCIT 2024"
                    value={formData.venue}
                    onChange={e => handleChange('venue', e.target.value)}/>
                </div>
                <div className="cpm-field">
                  <label className="cpm-label">Year</label>
                  <input className="cpm-input" type="number" placeholder="2024"
                    value={formData.year}
                    onChange={e => handleChange('year', e.target.value)}/>
                </div>
              </div>

              <div className="cpm-field">
                <label className="cpm-label">Paper Link (DOI or URL)</label>
                <input className="cpm-input"
                  placeholder="https://doi.org/..."
                  value={formData.link}
                  onChange={e => handleChange('link', e.target.value)}/>
              </div>
            </>
          )}

          {/* ── QUESTION FORM ───────────────────────────── */}
          {activeType === 'question' && (
            <>
              <div className="cpm-field">
                <label className="cpm-label">Your Question *</label>
                <input className="cpm-input"
                  placeholder="e.g. How do I handle class imbalance in medical imaging?"
                  value={formData.question}
                  onChange={e => handleChange('question', e.target.value)}
                  required/>
              </div>
              <div className="cpm-field">
                <label className="cpm-label">Context / Background</label>
                <textarea className="cpm-input cpm-ta" rows={4}
                  placeholder="What have you already tried? What is your dataset, model, current results?"
                  value={formData.context}
                  onChange={e => handleChange('context', e.target.value)}/>
              </div>
            </>
          )}

          {/* ── NEED HELP FORM ──────────────────────────── */}
          {activeType === 'need' && (
            <>
              <div className="cpm-field">
                <label className="cpm-label">What do you need help with? *</label>
                <input className="cpm-input"
                  placeholder="e.g. Looking for a co-author for my MICCAI submission"
                  value={formData.needTitle}
                  onChange={e => handleChange('needTitle', e.target.value)}
                  required/>
              </div>
              <div className="cpm-field">
                <label className="cpm-label">Details</label>
                <textarea className="cpm-input cpm-ta" rows={3}
                  placeholder="Describe exactly what kind of help you need..."
                  value={formData.needDetails}
                  onChange={e => handleChange('needDetails', e.target.value)}/>
              </div>
              <div className="cpm-field">
                <label className="cpm-label">Urgency</label>
                <div className="cpm-urgency-row">
                  {['low', 'medium', 'high'].map(u => (
                    <button key={u} type="button"
                      className={`cpm-urgency-btn ${u} ${formData.urgency === u ? 'active' : ''}`}
                      onClick={() => handleChange('urgency', u)}>
                      {u === 'low' ? '🟢 Low' : u === 'medium' ? '🟡 Medium' : '🔴 Urgent'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── OPPORTUNITY FORM ────────────────────────── */}
          {activeType === 'opportunity' && !isSupervisor && (
            <div className="cpm-lock-state">
              <div className="cpm-lock-icon">🔒</div>
              <div className="cpm-lock-title">Supervisor Only Feature</div>
              <div className="cpm-lock-sub">Only verified supervisors with an institutional .ac.uk email address can post research opportunities. This protects students from fake listings.</div>
              <div className="cpm-lock-badge">Get verified → update your email to your .ac.uk address in Settings</div>
            </div>
          )}

          {activeType === 'opportunity' && isSupervisor && (
            <>
              <div className="cpm-field">
                <label className="cpm-label">Opportunity Title *</label>
                <input className="cpm-input"
                  placeholder="e.g. PhD Research Assistant — Medical AI Lab"
                  value={formData.oppTitle}
                  onChange={e => handleChange('oppTitle', e.target.value)}
                  required/>
              </div>

              <div className="cpm-field">
                <label className="cpm-label">
                  Description
                  <button type="button" className="cpm-ai-inline-btn"
                    onClick={() => simulateAI('description')}
                    disabled={!formData.oppTitle || aiLoading === 'description'}>
                    {aiLoading === 'description' ? '⏳ Generating...' : '✨ AI Generate Description'}
                  </button>
                </label>
                {aiDescription && (
                  <div className="cpm-ai-box">
                    <div className="cpm-ai-box-head">
                      <span className="cpm-ai-label">✨ AI Generated</span>
                      <button type="button" className="cpm-ai-use" onClick={useAIDescription}>Use This →</button>
                    </div>
                    <div className="cpm-ai-text">{aiDescription}</div>
                  </div>
                )}
                <textarea className="cpm-input cpm-ta" rows={4}
                  placeholder="Describe the research opportunity, project, and what the student will do..."
                  value={formData.oppDescription}
                  onChange={e => handleChange('oppDescription', e.target.value)}/>
              </div>

              <div className="cpm-field">
                <label className="cpm-label">Requirements</label>
                <textarea className="cpm-input cpm-ta" rows={3}
                  placeholder="Skills, background, and qualifications needed..."
                  value={formData.oppRequirements}
                  onChange={e => handleChange('oppRequirements', e.target.value)}/>
              </div>

              <div className="cpm-row">
                <div className="cpm-field">
                  <label className="cpm-label">Duration</label>
                  <input className="cpm-input" placeholder="e.g. 12 months"
                    value={formData.oppDuration}
                    onChange={e => handleChange('oppDuration', e.target.value)}/>
                </div>
                <div className="cpm-field">
                  <label className="cpm-label">Location</label>
                  <input className="cpm-input" placeholder="e.g. London, UK / Remote"
                    value={formData.oppLocation}
                    onChange={e => handleChange('oppLocation', e.target.value)}/>
                </div>
              </div>

              <div className="cpm-row">
                <div className="cpm-field">
                  <label className="cpm-label">Application Deadline</label>
                  <input className="cpm-input" type="date"
                    value={formData.oppDeadline}
                    onChange={e => handleChange('oppDeadline', e.target.value)}/>
                </div>
                <div className="cpm-field">
                  <label className="cpm-label">Funding</label>
                  <select className="cpm-input cpm-select"
                    value={formData.oppFunding}
                    onChange={e => handleChange('oppFunding', e.target.value)}>
                    <option value="">Select funding type</option>
                    <option value="fully-funded">Fully Funded</option>
                    <option value="partial">Partially Funded</option>
                    <option value="self-funded">Self-Funded</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── SHARED: TAGS + AI FEATURES ──────────────── */}
          {activeType !== 'opportunity' && (
            <>
              {/* AI TAG SUGGESTIONS */}
              <div className="cpm-ai-row">
                <button type="button" className="cpm-ai-btn"
                  onClick={() => simulateAI('tags')}
                  disabled={aiLoading === 'tags'}>
                  {aiLoading === 'tags'
                    ? <><span className="cpm-ai-spin">⏳</span> AI thinking...</>
                    : <><span>✨</span> AI: Suggest Tags</>}
                </button>
                <button type="button" className="cpm-ai-btn"
                  onClick={() => simulateAI('review')}
                  disabled={aiLoading === 'review'}>
                  {aiLoading === 'review'
                    ? <><span className="cpm-ai-spin">⏳</span> Reviewing...</>
                    : <><span>🔍</span> AI: Review Before Posting</>}
                </button>
              </div>

              {/* AI SUGGESTED TAGS */}
              {aiSuggestedTags.length > 0 && (
                <div className="cpm-ai-tags">
                  <span className="cpm-ai-tags-label">✨ AI suggested — click to add:</span>
                  {aiSuggestedTags.map(tag => (
                    <span key={tag} className="cpm-suggested-tag" onClick={() => addSuggestedTag(tag)}>
                      + {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI REVIEW RESULT */}
              {aiReview && (
                <div className={`cpm-review-box ${aiReview.startsWith('✅') ? 'good' : 'warn'}`}>
                  {aiReview}
                </div>
              )}

              {/* TAGS INPUT */}
              <div className="cpm-field">
                <label className="cpm-label">Tags</label>
                <div className="cpm-tags-wrap">
                  <div className="cpm-tags-list">
                    {tags.map(tag => (
                      <div key={tag} className="cpm-tag-pill">
                        {tag}
                        <span className="cpm-tag-x" onClick={() => removeTag(tag)}>×</span>
                      </div>
                    ))}
                  </div>
                  <input className="cpm-tags-input"
                    placeholder="Type a tag and press Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}/>
                </div>
                <div className="cpm-tags-hint">Press Enter or comma to add · Tags help researchers find your post</div>
              </div>
            </>
          )}

          {/* ── FOOTER ──────────────────────────────────── */}
          <div className="cpm-footer">
            <div className="cpm-footer-left">
              <div className="cpm-icon-btn" title="Add Image">🖼️</div>
              <div className="cpm-icon-btn" title="Add Link">🔗</div>
              <div className="cpm-icon-btn" title="Attach File">📎</div>
            </div>
            <div className="cpm-footer-right">
              <button type="button" className="cpm-draft-btn">Save Draft</button>
              <button type="submit" className="cpm-post-btn">
                {activeType === 'opportunity' && !isSupervisor ? '🔒 Locked' : 'Post →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;