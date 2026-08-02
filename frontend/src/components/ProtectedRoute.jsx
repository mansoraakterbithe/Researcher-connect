// ============================================================
// FILE: src/components/ProtectedRoute.jsx
// Protects pages that require login
//
// ResearchConnect context:
// If someone tries to go to /home or /profile without
// being logged in, this redirects them to /auth.
// Like a security guard at the door of every page.
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  // While checking localStorage — show nothing
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      }}>
        Loading ResearchConnect...
      </div>
    );
  }

  // Not logged in — redirect to auth page
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in — show the page
  return children;
}

export default ProtectedRoute;