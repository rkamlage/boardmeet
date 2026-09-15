import React from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Users, Calendar, Gamepad2, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Admin() {
  const { currentUser, userProfiles, groups, events, gamesCatalog } = useStore();

  // Check if admin
  if (currentUser?.email !== 'renekamlage@googlemail.com') {
    return <Navigate to="/" replace />;
  }

  // Calculate some stats
  const totalUsers = Object.keys(userProfiles).length;
  const totalGroups = groups.length;
  const totalEvents = events.length;
  
  // Games added to catalog vs played in events
  const totalGamesInCatalog = gamesCatalog.length;
  
  // Let's find the most popular games across all events
  const gameCounts = {};
  events.forEach(e => {
    e.games.forEach(g => {
      gameCounts[g.name] = (gameCounts[g.name] || 0) + 1;
    });
  });
  
  const topGames = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-card rounded-full border border-slate-200 text-text hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <BarChart size={24} className="text-primary" /> Admin Dashboard
          </h1>
          <p className="text-sm text-muted font-medium">System Statistics & Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mb-3">
            <Users size={24} />
          </div>
          <div className="text-3xl font-black text-text">{totalUsers}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wide mt-1">Total Users</div>
        </div>
        
        <div className="bg-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl mb-3">
            <Users size={24} />
          </div>
          <div className="text-3xl font-black text-text">{totalGroups}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wide mt-1">Groups</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl mb-3">
            <Calendar size={24} />
          </div>
          <div className="text-3xl font-black text-text">{totalEvents}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wide mt-1">Events Created</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-xl mb-3">
            <Gamepad2 size={24} />
          </div>
          <div className="text-3xl font-black text-text">{totalGamesInCatalog}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wide mt-1">Games in DB</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Gamepad2 size={18} className="text-primary" /> Most Played Games
        </h2>
        {topGames.length > 0 ? (
          <ul className="space-y-3">
            {topGames.map(([name, count], idx) => (
              <li key={name} className="flex justify-between items-center p-3 bg-background rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-muted font-bold w-4 text-center">{idx + 1}.</span>
                  <span className="font-bold text-text">{name}</span>
                </div>
                <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-sm">
                  {count} {count === 1 ? 'Event' : 'Events'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted text-center py-4">Not enough data yet.</p>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-muted uppercase tracking-widest">System Status</p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          All Systems Operational
        </div>
      </div>
    </div>
  );
}
