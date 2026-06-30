// ============================================================
// FILE: src/App.jsx
// WHY: This is the root component — every React app has ONE
// top-level component that everything else lives inside.
// 🍰 EXAMPLE: think of this as the front door of your house.
// Every visitor (every page) walks through this door first.
// ============================================================

import LandingPage from './pages/LandingPage';
// 🍰 EXAMPLE: this brings in the LandingPage blueprint we
// built earlier, so App can display it

function App() {
  return <LandingPage />;
  // 🍰 EXAMPLE: App's only job right now is to show LandingPage.
  // Later, when you add more pages (Sign Up, Login, Home Feed),
  // this file will decide WHICH page to show based on the URL.
}

export default App;
// 🍰 EXAMPLE: this is the missing piece that caused your error.
// "export default" makes App available to main.jsx, which is
// what actually mounts your whole app into the browser page.