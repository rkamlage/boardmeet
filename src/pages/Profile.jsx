import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Trophy, Shield, Star, LogOut } from 'lucide-react';

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
  
  if (!currentUser) return null;

  const profile = userProfiles[currentUser.id] || {};
  const selectedAccessory = profile.accessory || 'none';

  const handleSelect = (id) => {
    updateUserProfile(currentUser.id, { accessory: id });
  };

  // Calculate user points
  let totalPoints = 0;
  let totalWins = 0;
  let totalEvents = 0;

  events.forEach(ev => {
    if (ev.attendees.includes(currentUser.id)) {
      totalEvents++;
    }
    if (ev.winner && ev.winner.userId === currentUser.id) {
      totalWins++;
      totalPoints += 10;
    }
    if (ev.matches) {
      ev.matches.forEach(match => {
        if (match.winnerId === currentUser.id) {
          totalWins++;
          totalPoints += 10;
        }
      });
    }
  });

  // Base points for attending
  totalPoints += (totalEvents * 2);

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
        <div className="relative w-28 h-28 flex justify-center items-center bg-background rounded-full text-6xl shadow-md border border-slate-100 mb-4">
          🧑
          {/* Overlay Accessory */}
          {activeAccessory && activeAccessory.icon && (
            <div className={`absolute text-5xl z-10 drop-shadow-sm ${activeAccessory.id === 'glasses' || activeAccessory.id === 'sunglasses' ? 'top-[28%]' : 'top-[-20%]'}`}>
              {activeAccessory.icon}
            </div>
          )}
        </div>

        <h3 className="text-2xl font-extrabold text-text m-0">{currentUser.name}</h3>
        
        <div className="flex gap-6 mt-6 w-full justify-center">
          <div className="text-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-xs text-muted flex items-center gap-1 mt-1 font-medium"><Star size={12} /> Punkte</div>
          </div>
          <div className="text-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <div className="text-2xl font-bold text-text">{totalWins}</div>
            <div className="text-xs text-muted flex items-center gap-1 mt-1 font-medium"><Trophy size={12} /> Siege</div>
          </div>
          <div className="text-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <div className="text-2xl font-bold text-text">{totalEvents}</div>
            <div className="text-xs text-muted flex items-center gap-1 mt-1 font-medium"><Shield size={12} /> Events</div>
          </div>
        </div>
      </div>

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
