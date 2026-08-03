// ============================================================
// FILE: src/pages/ApplicationsPage.jsx
// Track applications sent (student) or received (supervisor)
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './styles/ApplicationsPage.css';

function ApplicationsPage() {
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [respondNote, setRespondNote] = useState('');
  const [responding, setResponding] = useState(false);

  const isSupervisor = user?.role === 'supervisor';

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const endpoint = isSupervisor ? '/applications/received' : '/applications/mine';
        const res = await authFetch(endpoint);
        const data = await res.json();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('Applications fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  async function handleRespond(appId, status) {
    setResponding(true);
    try {
      const res = await authFetch(`/applications/${appId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, supervisorNote: respondNote })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a =>
          a._id === appId ? { ...a, status, supervisorNote: respondNote } : a
        ));
        setSelectedApp(null);
        setRespondNote('');
      }
    } catch (err) {
      console.error('Respond error:', err);
    } finally {
      setResponding(false);
    }
  }

  async function handleWithdraw(appId) {
    try {
      const res = await authFetch(`/applications/${appId}/withdraw`, { method: 'PUT' });
      if (res.ok) {
        setApplications(prev => prev.map(a =>
          a._id === appId ? { ...a, status: 'withdrawn' } : a
        ));
      }
    } catch (err) {
      console.error('Withdraw error:', err);
    }
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#FFD700',
      accepted: '#34d399',
      declined: '#f87171',
      withdrawn: 'rgba(255,255,255,0.3)',
      reviewing: '#5BA4E6'
    };
    return colors[status] || '#FFD700';
  }

  function getStatusLabel(status) {
    const labels = {
      pending: '⏳ Pending',
      accepted: '✅ Accepted',
      declined: '❌ Declined',
      withdrawn: '↩️ Withdrawn',
      reviewing: '🔍 Reviewing'
    };
    return labels[status] || status;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter(a => a.status === activeTab);

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    declined: applications.filter(a => a.status === 'declined').length,
  };

  return (
    <div className="ap-page">
      <Navbar activePage="applications" />

      <div className="ap-body">
        <div className="ap-inner">

          <div className="ap-header">
            <div className="ap-title">
              {isSupervisor ? 'Received Applications' : 'My Applications'}
            </div>
            <div className="ap-subtitle">
              {isSupervisor
                ? `${applications.length} total applications received`
                : `${applications.length} applications submitted`}
            </div>
          </div>

          {/* TABS */}
          <div className="ap-tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'declined', label: 'Declined' },
            ].map(tab => (
              <div
                key={tab.id}
                className={`ap-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="ap-tab-count">{counts[tab.id]}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="ap-loading">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">📋</div>
              <div className="ap-empty-text">
                {activeTab === 'all'
                  ? isSupervisor ? 'No applications received yet' : 'No applications submitted yet'
                  : `No ${activeTab} applications`}
              </div>
              {!isSupervisor && activeTab === 'all' && (
                <button className="ap-empty-btn" onClick={() => navigate('/matches')}>
                  Find Supervisors →
                </button>
              )}
            </div>
          ) : (
            <div className="ap-list">
              {filtered.map(app => {
                const other = isSupervisor ? app.student : app.supervisor;
                return (
                  <div
                    key={app._id}
                    className={`ap-card ${selectedApp?._id === app._id ? 'expanded' : ''}`}
                  >
                    <div className="ap-card-main" onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}>
                      <div className="ap-card-avatar">
                        {other?.username?.charAt(0).toUpperCase() || 'R'}
                      </div>

                      <div className="ap-card-info">
                        <div className="ap-card-name">{other?.username}</div>
                        <div className="ap-card-meta">
                          {other?.university || 'ResearchConnect'} · {other?.department || other?.role}
                        </div>
                        <div className="ap-card-topic">
                          {app.topic ? `Topic: ${app.topic}` : app.why?.substring(0, 80) + '...'}
                        </div>
                      </div>

                      <div className="ap-card-right">
                        <div
                          className="ap-status-badge"
                          style={{ color: getStatusColor(app.status), borderColor: getStatusColor(app.status) + '40', background: getStatusColor(app.status) + '12' }}
                        >
                          {getStatusLabel(app.status)}
                        </div>
                        <div className="ap-card-date">{formatDate(app.createdAt)}</div>
                      </div>
                    </div>

                    {/* EXPANDED DETAIL */}
                    {selectedApp?._id === app._id && (
                      <div className="ap-card-detail">
                        <div className="ap-detail-section">
                          <div className="ap-detail-label">Why they want to work together</div>
                          <div className="ap-detail-text">{app.why}</div>
                        </div>

                        <div className="ap-detail-section">
                          <div className="ap-detail-label">Research background</div>
                          <div className="ap-detail-text">{app.background}</div>
                        </div>

                        {app.topic && (
                          <div className="ap-detail-section">
                            <div className="ap-detail-label">Proposed topic</div>
                            <div className="ap-detail-text">{app.topic}</div>
                          </div>
                        )}

                        {app.funding && (
                          <div className="ap-detail-section">
                            <div className="ap-detail-label">Funding situation</div>
                            <div className="ap-detail-text">{app.funding}</div>
                          </div>
                        )}

                        {app.supervisorNote && (
                          <div className="ap-detail-section">
                            <div className="ap-detail-label">
                              {isSupervisor ? 'Your response' : 'Supervisor response'}
                            </div>
                            <div className="ap-detail-text ap-supervisor-note">{app.supervisorNote}</div>
                          </div>
                        )}

                        {/* SUPERVISOR ACTIONS */}
                        {isSupervisor && app.status === 'pending' && (
                          <div className="ap-actions">
                            <textarea
                              className="ap-respond-input"
                              placeholder="Add a note to your response (optional)..."
                              value={respondNote}
                              onChange={e => setRespondNote(e.target.value)}
                              rows={2}
                            />
                            <div className="ap-action-btns">
                              <button
                                className="ap-accept-btn"
                                onClick={() => handleRespond(app._id, 'accepted')}
                                disabled={responding}
                              >
                                ✅ Accept Application
                              </button>
                              <button
                                className="ap-review-btn"
                                onClick={() => handleRespond(app._id, 'reviewing')}
                                disabled={responding}
                              >
                                🔍 Mark as Reviewing
                              </button>
                              <button
                                className="ap-decline-btn"
                                onClick={() => handleRespond(app._id, 'declined')}
                                disabled={responding}
                              >
                                ❌ Decline
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STUDENT ACTIONS */}
                        {!isSupervisor && app.status === 'pending' && (
                          <div className="ap-actions">
                            <button
                              className="ap-withdraw-btn"
                              onClick={() => handleWithdraw(app._id)}
                            >
                              ↩️ Withdraw Application
                            </button>
                            <button
                              className="ap-msg-btn"
                              onClick={() => navigate('/messages')}
                            >
                              💬 Message Supervisor
                            </button>
                          </div>
                        )}

                        {!isSupervisor && app.status === 'accepted' && (
                          <div className="ap-actions">
                            <button
                              className="ap-msg-btn"
                              onClick={() => navigate('/messages')}
                            >
                              💬 Message Your Supervisor
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ApplicationsPage;