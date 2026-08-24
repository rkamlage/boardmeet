import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trophy, Medal, Star } from 'lucide-react';
import { ACCESSORIES } from './Profile';

export default function Games() {
  const { events, userProfiles, formatUserName } = useStore();
  const [activeTab, setActiveTab] = useState('global');

  // Calculate Leaderboard
  const calculateLeaderboard = () => {
    const scores = {};
    events.forEach(ev => {
      // Base points for attending
      ev.attendees.forEach(userId => {
        if (!scores[userId]) scores[userId] = { points: 0, wins: 0, events: 0 };
        scores[userId].events += 1;
        scores[userId].points += 2; // 2 pts for showing up
      });
      // Points for winning (we need to account for ev.matches now, but we'll add that later. For now ev.winner)
      if (ev.winner) {
        if (!scores[ev.winner.userId]) scores[ev.winner.userId] = { points: 0, wins: 0, events: 0 };
        scores[ev.winner.userId].wins += 1;
        scores[ev.winner.userId].points += 10;
      }
      if (ev.matches) {
        ev.matches.forEach(match => {
          if (!scores[match.winnerId]) scores[match.winnerId] = { points: 0, wins: 0, events: 0 };
          scores[match.winnerId].wins += 1;
          scores[match.winnerId].points += 10;
        });
      }
    });

    return Object.entries(scores)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.points - a.points);
  };

  const leaderboard = calculateLeaderboard();

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trophy className="text-primary" /> Leaderboards
      </h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button 
          className={activeTab === 'global' ? 'btn-primary' : 'btn-secondary'} 
          onClick={() => setActiveTab('global')}
          style={{ flex: 1 }}
        >
          Global
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="card">
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {leaderboard.map((item, index) => {
              const accId = userProfiles?.[item.userId]?.accessory || 'none';
              const accObj = ACCESSORIES.find(a => a.id === accId) || {};

              return (
                <li key={item.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', width: '30px', textAlign: 'center', fontWeight: 'bold', color: index === 0 ? 'var(--primary)' : 'inherit' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    
                    <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--card-bg)', borderRadius: '50%', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                      🧑
                      {accObj.icon && (
                        <div style={{ position: 'absolute', top: accObj.id === 'glasses' || accObj.id === 'sunglasses' ? '15%' : '-20%', fontSize: '1.2rem', zIndex: 10 }}>
                          {accObj.icon}
                        </div>
                      )}
                    </div>

                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{formatUserName(item.userId)}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', display: 'flex', gap: '0.5rem' }}>
                        <span><Medal size={12} /> {item.wins} Siege</span>
                        <span><Star size={12} /> {item.events} Events</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {item.points} <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>pts</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
