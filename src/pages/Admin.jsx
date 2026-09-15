import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Users, Calendar, Gamepad2, ArrowLeft, Trash2, ExternalLink, Eye } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import Onboarding from '../components/Onboarding';

export default function Admin() {
  const { currentUser, userProfiles, groups, events, gamesCatalog } = useStore();
  const [showOnboardingPreview, setShowOnboardingPreview] = useState(false);

  // Check if admin
  if (currentUser?.email !== 'renekamlage@googlemail.com') {
    return <Navigate to="/" replace />;
  }
  
  if (showOnboardingPreview) {
    return (
      <div className="relative">
        <button onClick={() => setShowOnboardingPreview(false)} className="absolute top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
          Zurück zum Admin Dashboard
        </button>
        <div className="opacity-90 pointer-events-none">
          <Onboarding onComplete={() => {}} />
        </div>
      </div>
    );
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

      <div className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm mb-8">
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

      <div className="bg-card rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" /> Alle Benutzer
        </h2>
        <ul className="space-y-3">
          {Object.entries(userProfiles).map(([id, profile]) => (
            <li key={id} className="p-3 bg-background rounded-xl border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="font-bold text-text block">{profile.name || 'Ohne Namen'}</strong>
                  <span className="text-xs text-muted font-medium">{profile.email || 'Keine Email'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-start gap-2">
          <Trash2 size={16} className="shrink-0 mt-0.5" />
          <p>
            Nutzer können aus Sicherheitsgründen nur direkt im <strong>Supabase Dashboard</strong> unter "Authentication" gelöscht werden, damit auch deren Google-Login / Passwort komplett entfernt wird.
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-3">
        <button 
          onClick={() => setShowOnboardingPreview(true)}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
        >
          <Eye size={18} />
          Onboarding-Screen ansehen
        </button>
        <a 
          href="https://supabase.com/dashboard" 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-background border border-slate-300 hover:bg-slate-50 text-text font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
        >
          <ExternalLink size={18} />
          Zu Supabase (Nutzer löschen)
        </a>
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
