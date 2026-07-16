import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

// Inside <Routes>:
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;