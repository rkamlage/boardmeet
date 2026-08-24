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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} className="text-primary" /> Mein Profil
        </h2>
        <button className="btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
        
        {/* Avatar Display */}
        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '50%', fontSize: '4rem', boxShadow: 'var(--shadow-md)', marginBottom: '1rem' }}>
          🧑
          {/* Overlay Accessory */}
          {activeAccessory && activeAccessory.icon && (
            <div style={{ position: 'absolute', top: activeAccessory.id === 'glasses' || activeAccessory.id === 'sunglasses' ? '15%' : '-20%', fontSize: '3rem', zIndex: 10 }}>
              {activeAccessory.icon}
            </div>
          )}
        </div>

        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{currentUser.name}</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totalPoints}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}><Star size={12} /> Punkte</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalWins}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}><Trophy size={12} /> Siege</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalEvents}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}><Shield size={12} /> Events</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={18} className="text-primary" /> Garderobe & Freischaltungen
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {ACCESSORIES.map(acc => {
          const isUnlocked = totalPoints >= acc.cost;
          const isSelected = selectedAccessory === acc.id;
          
          return (
            <div 
              key={acc.id} 
              className={`card ${isUnlocked ? 'clickable' : ''}`}
              style={{ 
                margin: 0, 
                padding: '1rem', 
                textAlign: 'center',
                opacity: isUnlocked ? 1 : 0.5,
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                position: 'relative'
              }}
              onClick={() => isUnlocked && handleSelect(acc.id)}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{acc.icon || '👕'}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{acc.name}</div>
              {!isUnlocked && (
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  Benötigt {acc.cost} Pkt
                </div>
              )}
              {isSelected && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
