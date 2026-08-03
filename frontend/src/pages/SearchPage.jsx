// ============================================================
// FILE: src/pages/SearchPage.jsx
// Search for researchers, posts, opportunities
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './styles/SearchPage.css';

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { authFetch } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ users: [], posts: [], totalUsers: 0, totalPosts: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searched, setSearched] = useState(false);

  // Search when URL query param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  async function doSearch(q) {
    if (!q?.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await authFetch(`/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults({
        users: data.users || [],
        posts: data.posts || [],
        totalUsers: data.totalUsers || 0,
        totalPosts: data.totalPosts || 0
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    doSearch(query);
  }

  function getRoleColor(role) {
    if (role === 'supervisor') return '#FFD700';
    if (role === 'student') return '#34d399';
    return '#5BA4E6';
  }

  return (
    <div className="sp">
      <Navbar activePage="search" />

      <div className="sp-body">
        <div className="sp-inner">

          {/* SEARCH BAR */}
          <form className="sp-search-wrap" onSubmit={handleSearch}>
            <div className="sp-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="sp-search-input"
                placeholder="Search researchers, papers, topics, universities..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button type="button" className="sp-clear-btn" onClick={() => { setQuery(''); setResults({ users: [], posts: [], totalUsers: 0, totalPosts: 0 }); setSearched(false); }}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="sp-search-btn">Search</button>
          </form>

          {/* FILTER TABS */}
          {searched && (
            <div className="sp-tabs">
              {[
                { id: 'all', label: 'All Results', count: results.totalUsers + results.totalPosts },
                { id: 'people', label: 'People', count: results.totalUsers },
                { id: 'posts', label: 'Posts', count: results.totalPosts },
              ].map(tab => (
                <div
                  key={tab.id}
                  className={`sp-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="sp-tab-count">{tab.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* RESULTS */}
          {loading ? (
            <div className="sp-loading">
              <div className="sp-loading-spinner"/>
              Searching...
            </div>
          ) : !searched ? (
            <div className="sp-empty-state">
              <div className="sp-empty-icon">🔍</div>
              <div className="sp-empty-title">Search ResearchConnect</div>
              <div className="sp-empty-sub">Find researchers, supervisors, papers and opportunities</div>
              <div className="sp-suggestions">
                <div className="sp-suggestions-label">Try searching for:</div>
                {['Medical Imaging', 'PhD Supervisor', 'Deep Learning', 'UCL', 'Computer Vision'].map(s => (
                  <span key={s} className="sp-suggestion-chip" onClick={() => { setQuery(s); setSearchParams({ q: s }); doSearch(s); }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : results.users.length === 0 && results.posts.length === 0 ? (
            <div className="sp-no-results">
              <div className="sp-empty-icon">😕</div>
              <div className="sp-empty-title">No results for "{query}"</div>
              <div className="sp-empty-sub">Try different keywords or check the spelling</div>
            </div>
          ) : (
            <div className="sp-results">

              {/* PEOPLE RESULTS */}
              {(activeTab === 'all' || activeTab === 'people') && results.users.length > 0 && (
                <div className="sp-section">
                  <div className="sp-section-title">
                    People
                    <span className="sp-section-count">{results.totalUsers}</span>
                  </div>
                  {results.users.map(user => (
                    <div key={user._id} className="sp-user-card" onClick={() => navigate(`/profile/${user._id}`)}>
                      <div className="sp-user-avatar">
                        {user.username?.charAt(0).toUpperCase() || 'R'}
                      </div>
                      <div className="sp-user-info">
                        <div className="sp-user-name">
                          {user.username}
                          {user.isVerified && <span className="sp-verified">✓</span>}
                          <span className="sp-role-badge" style={{ color: getRoleColor(user.role), borderColor: getRoleColor(user.role) + '40', background: getRoleColor(user.role) + '12' }}>
                            {user.role}
                          </span>
                          {user.matchScore > 0 && (
                            <span className="sp-match">⚡ {user.matchScore}% match</span>
                          )}
                        </div>
                        <div className="sp-user-meta">
                          {user.university || 'ResearchConnect'} {user.department ? `· ${user.department}` : ''}
                        </div>
                        {user.researchInterests?.length > 0 && (
                          <div className="sp-user-tags">
                            {user.researchInterests.slice(0, 4).map(interest => (
                              <span key={interest} className="sp-tag">{interest}</span>
                            ))}
                          </div>
                        )}
                        {user.bio && (
                          <div className="sp-user-bio">{user.bio.substring(0, 120)}{user.bio.length > 120 ? '...' : ''}</div>
                        )}
                      </div>
                      <button className="sp-view-btn" onClick={e => { e.stopPropagation(); navigate(`/profile/${user._id}`); }}>
                        View Profile →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* POSTS RESULTS */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div className="sp-section">
                  <div className="sp-section-title">
                    Posts & Papers
                    <span className="sp-section-count">{results.totalPosts}</span>
                  </div>
                  {results.posts.map(post => (
                    <div key={post._id} className="sp-post-card">
                      <div className="sp-post-type">{post.type}</div>
                      <div className="sp-post-title">{post.title}</div>
                      <div className="sp-post-meta">
                        {post.author?.username} · {post.author?.university || 'ResearchConnect'} ·{' '}
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {post.content && (
                        <div className="sp-post-excerpt">
                          {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                        </div>
                      )}
                      {post.tags?.length > 0 && (
                        <div className="sp-post-tags">
                          {post.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="sp-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SearchPage;