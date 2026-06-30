// ============================================================
// FILE: src/App.jsx
// WHY: This is the traffic controller for your whole app.
// 🍰 EXAMPLE: think of this like a receptionist at a building.
// Someone walks in and says "I want signup" — the receptionist
// (App.jsx) checks the URL and directs them to the right room
// (the right page component).
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
// 🍰 EXAMPLE: BrowserRouter = the whole building
// Routes = the directory board listing all rooms
// Route = one single room listing: "Room 101 = Sign Up"

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
// 🍰 EXAMPLE: we are importing 3 page components.
// AuthPage and HomePage don't exist yet — we build them next.
// Importing them now is fine, React just won't run until
// we actually create those files.

function App() {
  return (
    <BrowserRouter>
      {/* 🍰 EXAMPLE: BrowserRouter wraps EVERYTHING — it watches
          the URL in the browser address bar and tells its
          children which page to show based on what it sees */}

      <Routes>
        {/* 🍰 EXAMPLE: Routes is the list of all possible pages.
            React checks this list top to bottom looking for
            a match with the current URL */}

        <Route path="/" element={<LandingPage />} />
        {/* 🍰 EXAMPLE: path="/" means "the homepage address"
            e.g. researchconnect.com/ shows LandingPage */}

        <Route path="/auth" element={<AuthPage />} />
        {/* 🍰 EXAMPLE: path="/auth" means when the URL is
            researchconnect.com/auth, show AuthPage instead.
            This is where Sign Up AND Login will both live,
            with a toggle between them */}

        <Route path="/home" element={<HomePage />} />
        {/* 🍰 EXAMPLE: path="/home" = the feed page after login,
            this is what "Explore Projects" button leads to */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;