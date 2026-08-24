import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, Trophy, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Layout() {
  const { logout } = useStore();
  const location = useLocation();

  const getNavColor = (path) => {
    if (path === '/' && location.pathname === '/') return 'var(--primary)';
    if (path !== '/' && location.pathname.startsWith(path)) return 'var(--primary)';
    return 'var(--muted-text)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <nav className="nav-bar">
        <Link to="/" className="nav-title">🎲 BoardMeet</Link>
        <div className="nav-links">
          <button onClick={logout} style={{ fontSize: '0.85rem', color: 'var(--muted-text)', padding: '0.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-color)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="container" style={{ flexGrow: 1, width: '100%', paddingBottom: '80px' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.75rem',
        zIndex: 10,
        boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.05)'
      }}>
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: getNavColor('/') }}>
          <Home size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Home</span>
        </Link>
        <Link to="/groups" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: getNavColor('/groups') }}>
          <Users size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Groups</span>
        </Link>
        <Link to="/events" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: getNavColor('/events') }}>
          <Calendar size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Events</span>
        </Link>
        <Link to="/games" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: getNavColor('/games') }}>
          <Trophy size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Leaderboards</span>
        </Link>
        <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: getNavColor('/profile') }}>
          <User size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
