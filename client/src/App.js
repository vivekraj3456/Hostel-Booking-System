import React, { createContext, useContext, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import AddRoom from './pages/AddRoom';
import History from './pages/History';
import Home from './pages/Home';

const API_BASE = process.env.REACT_APP_API_BASE || '';

const ApiContext = createContext(null);

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}

export function Spinner() {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}

function ApiProvider({ children }) {
  const apiRequest = useCallback(async (path, options = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          data && typeof data === 'object' && data.error
            ? data.error
            : `Request failed (${response.status})`
        );
      }
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  }, []);

  return <ApiContext.Provider value={{ apiRequest, API_BASE }}>{children}</ApiContext.Provider>;
}

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark', !isDark);
  };

  return (
    <ErrorBoundary>
      <ApiProvider>
        <Router>
{/* // Update src/App.js: Restructure the header for two rows
// ... (existing imports and code) */}

{/* // In the return of App(): */}
<header className="navbar">
  <div className="navbar-top">
    <NavLink to="/" className="nav-brand">
      Hostel Booking
    </NavLink>
    {/* <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
      {isDark ? <MdLightMode /> : <MdDarkMode />}
    </button> */}
  </div>
  <nav className="nav-links">
    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
      Home
    </NavLink>
    <NavLink
      to="/rooms"
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      Rooms
    </NavLink>
    <NavLink
      to="/bookings"
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      Bookings
    </NavLink>
    <NavLink
      to="/add-room"
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      Add Room
    </NavLink>
    <NavLink
      to="/history"
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      History
    </NavLink>
  </nav>
  <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
      {isDark ? <MdLightMode /> : <MdDarkMode />}
    </button>
</header>
          <main className="main-content">
{/* <nav className="nav-links">
  <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
    Home
  </NavLink>
  <NavLink
    to="/rooms"
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    Rooms
  </NavLink>
  <NavLink
    to="/bookings"
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    Bookings
  </NavLink>
  <NavLink
    to="/add-room"
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    Add Room
  </NavLink>
  <NavLink
    to="/history"
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    History
  </NavLink>
</nav> */}

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/rooms" element={<Rooms />} />
  <Route path="/bookings" element={<Bookings />} />
  <Route path="/add-room" element={<AddRoom />} />
  <Route path="/history" element={<History />} />
</Routes>
            {/* <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/add-room" element={<AddRoom />} />
            <Route path="/history" element={<History />} />
          </Routes> */}
          </main>
          <ToastContainer />
        </Router>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;