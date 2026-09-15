import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trophy, Star, Medal } from 'lucide-react';
import Avatar from '../components/Avatar';
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
      // Points for winning
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
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Trophy className="text-primary" size={28} /> Leaderboards
      </h2>

      <div className="flex gap-2 mb-4">
        <button 
          className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeTab === 'global' ? 'bg-primary text-white shadow-md' : 'bg-card border border-slate-200 text-text hover:bg-slate-50'}`}
          onClick={() => setActiveTab('global')}
        >
          Global
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
          <ul className="flex flex-col gap-4">
            {leaderboard.map((item, index) => {
              const accId = userProfiles?.[item.userId]?.accessory || 'none';
              const accObj = ACCESSORIES.find(a => a.id === accId) || {};

              return (
                <li key={item.userId} className="flex items-center justify-between p-4 bg-background rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl w-8 text-center font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-300'}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    
                    <Avatar userId={item.userId} className="w-12 h-12 text-2xl bg-card" accessoryClassName="text-xl top-[-20%]" />

                    <div>
                      <strong className="text-lg font-bold text-text">{formatUserName(item.userId)}</strong>
                      <div className="text-xs text-muted flex gap-3 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Medal size={14} /> {item.wins} Siege</span>
                        <span className="flex items-center gap-1"><Star size={14} /> {item.events} Events</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-primary flex items-baseline gap-1">
                    {item.points} <span className="text-xs font-medium text-muted">pts</span>
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
