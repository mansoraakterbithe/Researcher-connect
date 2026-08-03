import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import MessagesPage from './pages/MessagesPage';
import ConnectionsPage from './pages/ConnectionsPage';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — anyone can access */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth page — redirect to home if already logged in */}
        <Route
          path="/auth"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <AuthPage />}
        />

        {/* Protected routes — must be logged in */}
        <Route path="/home" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute><EditProfilePage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/messages" element={
        <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/messages/:userId" element={
        <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/connections" element={
        <ProtectedRoute><ConnectionsPage /></ProtectedRoute>
        } />
        {/* Catch all — redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;