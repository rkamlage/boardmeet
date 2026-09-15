import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, Trophy, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Layout() {
  const { logout } = useStore();
  const location = useLocation();

  const getNavColor = (path) => {
    if (path === '/' && location.pathname === '/') return 'text-primary';
    if (path !== '/' && location.pathname.startsWith(path)) return 'text-primary';
    return 'text-muted';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* Top Desktop/Mobile Nav */}
      <nav className="flex justify-between items-center p-4 bg-card border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <Link to="/" className="font-extrabold text-2xl text-primary tracking-tight">🎲 BoardMeet</Link>
        <div className="hidden sm:flex items-center space-x-6">
          <Link to="/" className={`font-semibold ${getNavColor('/')} hover:text-primary transition-colors`}>Home</Link>
          <Link to="/groups" className={`font-semibold ${getNavColor('/groups')} hover:text-primary transition-colors`}>Groups</Link>
          <Link to="/events" className={`font-semibold ${getNavColor('/events')} hover:text-primary transition-colors`}>Events</Link>
          <Link to="/games" className={`font-semibold ${getNavColor('/games')} hover:text-primary transition-colors`}>Ranking</Link>
          <Link to="/profile" className={`font-semibold ${getNavColor('/profile')} hover:text-primary transition-colors`}>Profile</Link>
        </div>
        <div className="flex space-x-2">
          <button onClick={logout} className="p-2 text-muted hover:text-primary hover:bg-slate-100 rounded-xl transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto flex-grow p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-slate-200 flex justify-around p-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:hidden">
        <Link to="/" className={`flex flex-col items-center ${getNavColor('/')} hover:text-primary transition-colors`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link to="/groups" className={`flex flex-col items-center ${getNavColor('/groups')} hover:text-primary transition-colors`}>
          <Users size={24} />
          <span className="text-[10px] mt-1 font-medium">Groups</span>
        </Link>
        <Link to="/events" className={`flex flex-col items-center ${getNavColor('/events')} hover:text-primary transition-colors`}>
          <Calendar size={24} />
          <span className="text-[10px] mt-1 font-medium">Events</span>
        </Link>
        <Link to="/games" className={`flex flex-col items-center ${getNavColor('/games')} hover:text-primary transition-colors`}>
          <Trophy size={24} />
          <span className="text-[10px] mt-1 font-medium">Ranking</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${getNavColor('/profile')} hover:text-primary transition-colors`}>
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
