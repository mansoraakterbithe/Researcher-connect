// ============================================================
// FILE: src/pages/ConnectionsPage.jsx
// Follow/unfollow researchers, see your network
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './styles/ConnectionsPage.css';

function ConnectionsPage() {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [connRes, sugRes] = await Promise.all([
          authFetch('/connections'),
          authFetch('/connections/suggestions')
        ]);
        const connData = await connRes.json();
        const sugData = await sugRes.json();

        setFollowing(connData.following || []);
        setFollowers(connData.followers || []);
        setSuggestions(sugData.suggestions || []);

        // Track who we already follow
        const ids = new Set((connData.following || []).map(u => u._id));
        setFollowingIds(ids);
      } catch (err) {
        console.error('Connections fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  async function handleFollow(userId) {
    try {
      const res = await authFetch(`/connections/request/${userId}`, { method: 'POST' });
      if (res.ok) {
        setFollowingIds(prev => new Set([...prev, userId]));
        // Move from suggestions to following
        const followed = suggestions.find(s => s._id === userId);
        if (followed) {
          setSuggestions(prev => prev.filter(s => s._id !== userId));
          setFollowing(prev => [...prev, followed]);
        }
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  }

  async function handleUnfollow(userId) {
    try {
      const res = await authFetch(`/connections/unfollow/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setFollowing(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  }

  function ResearcherCard({ researcher, isFollowing, onFollow, onUnfollow }) {
    return (
      <div className="cp-card">
        <div className="cp-card-avatar" onClick={() => navigate(`/profile/${researcher._id}`)}>
          {researcher.username?.charAt(0).toUpperCase() || 'R'}
        </div>
        <div className="cp-card-info">
          <div className="cp-card-name" onClick={() => navigate(`/profile/${researcher._id}`)}>
            {researcher.username}
            {researcher.isVerified && <span className="cp-verified">✓</span>}
          </div>
          <div className="cp-card-role">
            {researcher.role} · {researcher.university || 'ResearchConnect'}
          </div>
          {researcher.researchInterests?.length > 0 && (
            <div className="cp-card-tags">
              {researcher.researchInterests.slice(0, 3).map(interest => (
                <span key={interest} className="cp-tag">{interest}</span>
              ))}
            </div>
          )}
        </div>
        <div className="cp-card-actions">
          {isFollowing ? (
            <button className="cp-unfollow-btn" onClick={() => onUnfollow(researcher._id)}>
              Unfollow
            </button>
          ) : (
            <button className="cp-follow-btn" onClick={() => onFollow(researcher._id)}>
              + Follow
            </button>
          )}
          <button className="cp-msg-btn" onClick={() => navigate('/messages')}>
            💬
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp">
      <Navbar activePage="connections" />

      <div className="cp-body">
        <div className="cp-inner">

          <div className="cp-header">
            <div className="cp-title">My Network</div>
            <div className="cp-subtitle">
              {following.length} following · {followers.length} followers
            </div>
          </div>

          {/* TABS */}
          <div className="cp-tabs">
            {[
              { id: 'suggestions', label: 'Suggested', count: suggestions.length },
              { id: 'following', label: 'Following', count: following.length },
              { id: 'followers', label: 'Followers', count: followers.length },
            ].map(tab => (
              <div
                key={tab.id}
                className={`cp-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="cp-tab-count">{tab.count}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="cp-loading">Loading connections...</div>
          ) : (
            <div className="cp-list">

              {/* SUGGESTIONS */}
              {activeTab === 'suggestions' && (
                suggestions.length === 0 ? (
                  <div className="cp-empty">
                    <div className="cp-empty-icon">🔬</div>
                    <div className="cp-empty-text">No suggestions right now</div>
                    <div className="cp-empty-sub">Add research interests to your profile to get better suggestions</div>
                    <button className="cp-empty-btn" onClick={() => navigate('/profile/edit')}>
                      Update Profile →
                    </button>
                  </div>
                ) : suggestions.map(r => (
                  <ResearcherCard
                    key={r._id}
                    researcher={r}
                    isFollowing={followingIds.has(r._id)}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}

              {/* FOLLOWING */}
              {activeTab === 'following' && (
                following.length === 0 ? (
                  <div className="cp-empty">
                    <div className="cp-empty-icon">👥</div>
                    <div className="cp-empty-text">You are not following anyone yet</div>
                    <div className="cp-empty-sub">Follow researchers to see their posts in your feed</div>
                    <button className="cp-empty-btn" onClick={() => setActiveTab('suggestions')}>
                      See Suggestions →
                    </button>
                  </div>
                ) : following.map(r => (
                  <ResearcherCard
                    key={r._id}
                    researcher={r}
                    isFollowing={true}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}

              {/* FOLLOWERS */}
              {activeTab === 'followers' && (
                followers.length === 0 ? (
                  <div className="cp-empty">
                    <div className="cp-empty-icon">👤</div>
                    <div className="cp-empty-text">No followers yet</div>
                    <div className="cp-empty-sub">Complete your profile to attract followers</div>
                    <button className="cp-empty-btn" onClick={() => navigate('/profile/edit')}>
                      Complete Profile →
                    </button>
                  </div>
                ) : followers.map(r => (
                  <ResearcherCard
                    key={r._id}
                    researcher={r}
                    isFollowing={followingIds.has(r._id)}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))
              )}

            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ConnectionsPage;