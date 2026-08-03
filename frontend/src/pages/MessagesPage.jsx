// ============================================================
// FILE: src/pages/MessagesPage.jsx
// Direct messaging between researchers
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './styles/MessagesPage.css';

function MessagesPage() {
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await authFetch('/messages');
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error('Conversations fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!activeConversation) return;
    const fetchMessages = async () => {
      try {
        const otherId = activeConversation.lastMessage.sender._id === user?.id
          ? activeConversation.lastMessage.recipient._id
          : activeConversation.lastMessage.sender._id;
        const res = await authFetch(`/messages/${otherId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Messages fetch error:', err);
      }
    };
    fetchMessages();
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    setSending(true);

    try {
      const otherId = activeConversation.lastMessage.sender._id === user?.id
        ? activeConversation.lastMessage.recipient._id
        : activeConversation.lastMessage.sender._id;

      const res = await authFetch(`/messages/${otherId}`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage.trim() })
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  }

  function getOtherUser(conv) {
    if (!conv?.lastMessage) return null;
    return conv.lastMessage.sender._id === user?.id
      ? conv.lastMessage.recipient
      : conv.lastMessage.sender;
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  const activeOther = activeConversation ? getOtherUser(activeConversation) : null;

  return (
    <div className="mp">
      <Navbar activePage="messages" />

      <div className="mp-body">

        {/* ── CONVERSATIONS LIST ────────────────────────── */}
        <aside className="mp-sidebar">
          <div className="mp-sidebar-head">
            <div className="mp-sidebar-title">Messages</div>
            <div className="mp-sidebar-count">{conversations.length}</div>
          </div>

          <div className="mp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search conversations..."/>
          </div>

          {loading ? (
            <div className="mp-empty">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-icon">💬</div>
              <div className="mp-empty-text">No messages yet</div>
              <div className="mp-empty-sub">Start a conversation from someone's profile</div>
            </div>
          ) : (
            <div className="mp-conv-list">
              {conversations.map(conv => {
                const other = getOtherUser(conv);
                if (!other) return null;
                return (
                  <div
                    key={conv._id}
                    className={`mp-conv-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <div className="mp-conv-avatar">
                      {other.username?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    <div className="mp-conv-info">
                      <div className="mp-conv-name">
                        {other.username}
                        {conv.unreadCount > 0 && (
                          <span className="mp-conv-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      <div className="mp-conv-preview">
                        {conv.lastMessage?.content?.substring(0, 50)}
                        {conv.lastMessage?.content?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                    <div className="mp-conv-time">
                      {formatTime(conv.lastMessage?.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* ── MESSAGE THREAD ────────────────────────────── */}
        <main className="mp-main">
          {!activeConversation ? (
            <div className="mp-no-conv">
              <div className="mp-no-conv-icon">💬</div>
              <div className="mp-no-conv-title">Select a conversation</div>
              <div className="mp-no-conv-sub">
                Choose a conversation from the left or start one from a researcher's profile
              </div>
            </div>
          ) : (
            <>
              {/* THREAD HEADER */}
              <div className="mp-thread-head">
                <div className="mp-thread-avatar">
                  {activeOther?.username?.charAt(0).toUpperCase() || 'R'}
                </div>
                <div className="mp-thread-info">
                  <div className="mp-thread-name">{activeOther?.username}</div>
                  <div className="mp-thread-role">
                    {activeOther?.role} · {activeOther?.university || 'ResearchConnect'}
                  </div>
                </div>
                <button
                  className="mp-view-profile-btn"
                  onClick={() => navigate(`/profile/${activeOther?._id}`)}
                >
                  View Profile →
                </button>
              </div>

              {/* MESSAGES */}
              <div className="mp-messages">
                {messages.length === 0 ? (
                  <div className="mp-messages-empty">
                    Start the conversation with {activeOther?.username}
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender._id === user?.id || msg.sender === user?.id;
                    return (
                      <div key={msg._id} className={`mp-msg ${isMe ? 'mine' : 'theirs'}`}>
                        {!isMe && (
                          <div className="mp-msg-avatar">
                            {activeOther?.username?.charAt(0).toUpperCase() || 'R'}
                          </div>
                        )}
                        <div className="mp-msg-bubble">
                          {msg.type === 'document' ? (
                            <div className="mp-msg-doc">
                              <span>📎</span>
                              <a href={msg.document?.url} target="_blank" rel="noreferrer">
                                {msg.document?.name || msg.document?.filename}
                              </a>
                            </div>
                          ) : (
                            msg.content
                          )}
                          <div className="mp-msg-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* MESSAGE INPUT */}
              <form className="mp-input-wrap" onSubmit={sendMessage}>
                <input
                  className="mp-input"
                  placeholder={`Message ${activeOther?.username}...`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button className="mp-send-btn" type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? '...' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MessagesPage;