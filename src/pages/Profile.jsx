import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Trophy, Shield, Star, LogOut, Activity, Gamepad2, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';

export const ACCESSORIES = [
  { id: 'none', icon: '', name: 'Kein Accessoire', cost: 0 },
  { id: 'glasses', icon: '👓', name: 'Nerd Brille', cost: 10 },
  { id: 'sunglasses', icon: '🕶️', name: 'Coole Sonnenbrille', cost: 20 },
  { id: 'hat', icon: '🎩', name: 'Zylinder', cost: 30 },
  { id: 'crown', icon: '👑', name: 'Königskrone', cost: 50 },
  { id: 'medal', icon: '🏅', name: 'Goldmedaille', cost: 100 },
];

export default function Profile() {
  const { currentUser, logout, events, userProfiles, updateUserProfile } = useStore();
  const profile = userProfiles[currentUser?.id] || {};
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [editAvatarBase, setEditAvatarBase] = useState('🧑');

  const openEditModal = () => {
    const p = userProfiles?.[currentUser.id] || {};
    setEditNameValue(p.name || currentUser.name || '');
    setEditAvatarBase(p.avatar_base || '🧑');
    setShowEditModal(true);
  };

  const saveProfile = () => {
    if (editNameValue.trim()) {
      updateUserProfile(currentUser.id, { name: editNameValue.trim(), avatar_base: editAvatarBase });
      setShowEditModal(false);
    }
  };
  
  if (!currentUser) return null;

  const selectedAccessory = profile.accessory || 'none';

  const handleSelect = (id) => {
    updateUserProfile(currentUser.id, { accessory: id });
  };

  // Calculate user points and advanced stats
  let totalPoints = 0;
  let totalWins = 0;
  let totalEvents = 0;
  let totalMatchesPlayed = 0;
  
  const gameStats = {}; // { gameId: { played: 0, wins: 0, name: '' } }

  events.forEach(ev => {
    const isAttending = ev.attendees.includes(currentUser.id);
    if (isAttending) {
      totalEvents++;
    }
    
    // Legacy winner logic
    if (ev.winner && ev.winner.userId === currentUser.id) {
      totalWins++;
      totalPoints += 10;
    }
    
    if (ev.matches) {
      ev.matches.forEach(match => {
        // If the user attended the event, we assume they participated in the match
        if (isAttending) {
          totalMatchesPlayed++;
          
          const g = ev.games.find(g => g.id === match.gameId);
          if (!gameStats[match.gameId]) {
            gameStats[match.gameId] = { played: 0, wins: 0, name: g ? g.name : 'Unbekanntes Spiel' };
          }
          gameStats[match.gameId].played++;
        }
        
        if (match.winnerId === currentUser.id) {
          totalWins++;
          totalPoints += 10;
          if (gameStats[match.gameId]) {
            gameStats[match.gameId].wins++;
          }
        }
      });
    }
  });

  // Base points for attending
  totalPoints += (totalEvents * 2);
  
  const winRate = totalMatchesPlayed > 0 ? Math.round((totalWins / totalMatchesPlayed) * 100) : 0;
  
  // Find favorite game (most played, fallback to most won)
  let favoriteGame = { name: '-', played: 0, wins: 0 };
  Object.values(gameStats).forEach(stat => {
    if (stat.played > favoriteGame.played || (stat.played === favoriteGame.played && stat.wins > favoriteGame.wins)) {
      favoriteGame = stat;
    }
  });

  const activeAccessory = ACCESSORIES.find(a => a.id === selectedAccessory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <User size={28} className="text-primary" /> Mein Profil
        </h2>
        <button className="bg-card border border-slate-200 hover:bg-slate-100 text-muted hover:text-primary font-medium py-1.5 px-3 rounded-xl shadow-sm transition-colors flex items-center gap-1 text-sm" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl flex flex-col items-center p-8 shadow-sm">
        {/* Avatar Display */}
        <Avatar userId={currentUser.id} className="w-28 h-28 text-6xl mb-4" accessoryClassName="text-5xl top-[-20%]" />

        <div className="flex items-center gap-2 mt-2">
          <h3 className="text-2xl font-extrabold text-text m-0">{profile.name || currentUser.name}</h3>
          <button 
            onClick={openEditModal}
            className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
          >
            Profil bearbeiten
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full">
          <div className="text-center bg-indigo-50 px-4 py-4 rounded-xl border border-indigo-100 shadow-sm">
            <div className="text-2xl font-black text-primary">{totalPoints}</div>
            <div className="text-xs text-indigo-700 flex items-center justify-center gap-1 mt-1 font-bold"><Star size={14} /> Punkte</div>
          </div>
          <div className="text-center bg-yellow-50 px-4 py-4 rounded-xl border border-yellow-100 shadow-sm">
            <div className="text-2xl font-black text-yellow-600">{totalWins}</div>
            <div className="text-xs text-yellow-700 flex items-center justify-center gap-1 mt-1 font-bold"><Trophy size={14} /> Siege</div>
          </div>
          <div className="text-center bg-green-50 px-4 py-4 rounded-xl border border-green-100 shadow-sm">
            <div className="text-2xl font-black text-green-600">{winRate}%</div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1 mt-1 font-bold"><PieChart size={14} /> Siegquote</div>
          </div>
          <div className="text-center bg-slate-50 px-4 py-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-2xl font-black text-text">{totalMatchesPlayed}</div>
            <div className="text-xs text-muted flex items-center justify-center gap-1 mt-1 font-bold"><Activity size={14} /> Matches</div>
          </div>
        </div>
        
        {totalMatchesPlayed > 0 && (
          <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 text-primary">
              <Gamepad2 size={24} />
            </div>
            <div>
              <div className="text-xs text-muted font-bold uppercase tracking-wider">Lieblingsspiel</div>
              <div className="text-lg font-black text-text">{favoriteGame.name}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                {favoriteGame.played}x gespielt • {favoriteGame.wins} Siege
              </div>
            </div>
          </div>
        )}
      </div>

      {currentUser?.email === 'renekamlage@googlemail.com' && (
        <div>
          <Link to="/admin" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Admin Dashboard
          </Link>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Profil bearbeiten</h2>
            
            <label className="block text-sm font-bold text-text mb-2">Dein Name</label>
            <input 
              type="text" 
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl bg-card text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-6 font-bold"
              placeholder="Wie heißt du?"
            />

            <label className="block text-sm font-bold text-text mb-2">Avatar Basis</label>
            <div className="grid grid-cols-4 gap-2 mb-8 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {['🧑', '👩', '👨', '🧔‍♂️', '👱‍♀️', '👴', '👵', '🤖', '👽', '👻', '🐶', '🐱'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setEditAvatarBase(emoji)}
                  className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                    editAvatarBase === emoji 
                      ? 'border-primary bg-indigo-50 shadow-sm scale-110' 
                      : 'border-slate-200 bg-card hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Abbrechen
              </button>
              <button 
                onClick={saveProfile}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="flex items-center gap-2 text-xl font-bold mt-8 mb-4">
        <Star size={20} className="text-primary" /> Garderobe & Freischaltungen
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {ACCESSORIES.map(acc => {
          const isUnlocked = totalPoints >= acc.cost;
          const isSelected = selectedAccessory === acc.id;
          
          return (
            <div 
              key={acc.id}
              onClick={() => isUnlocked && handleSelect(acc.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center
                ${isSelected 
                  ? 'border-primary bg-indigo-50 shadow-sm' 
                  : isUnlocked 
                    ? 'border-slate-200 bg-card hover:border-indigo-200 hover:bg-slate-50 cursor-pointer' 
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed grayscale'
                }
              `}
            >
              <div className="text-4xl mb-2 min-h-[48px] drop-shadow-sm">{acc.icon}</div>
              <strong className={`block text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>{acc.name}</strong>
              <div className="text-xs text-muted mt-1 font-medium">
                {acc.cost === 0 ? 'Kostenlos' : `${acc.cost} Pts`}
              </div>
              
              {!isUnlocked && (
                <div className="text-[10px] text-red-500 font-bold mt-2">
                  Noch {acc.cost - totalPoints} Pts fehlen
                </div>
              )}
              {isSelected && (
                <div className="text-[10px] bg-primary text-white font-bold mt-2 px-2 py-1 rounded-full">
                  Ausgewählt
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
