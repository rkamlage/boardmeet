import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const { currentUser, groups, events, userProfiles } = useStore();
  
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));
  const userEvents = events.filter(e => e.attendees.includes(currentUser.id) || e.waitlist.includes(currentUser.id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Hi, {userProfiles[currentUser.id]?.name || currentUser.name}! 👋</h1>
      
      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
          <Calendar size={20} className="text-primary" /> Upcoming Events
        </h3>
        
        {userEvents.length === 0 ? (
          <p className="text-muted text-sm">No upcoming events. Check your groups!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {userEvents.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div className="flex justify-between items-center p-4 bg-background rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all group">
                  <div>
                    <strong className="block text-text group-hover:text-primary transition-colors">{ev.title}</strong>
                    <span className="text-sm text-muted">
                      {new Date(ev.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <ArrowRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
          <Users size={20} className="text-primary" /> Your Groups
        </h3>
        
        {userGroups.length === 0 ? (
          <p className="text-muted text-sm mb-4">You are not part of any groups yet.</p>
        ) : (
          <div className="flex flex-col gap-3 mb-5">
            {userGroups.map(g => (
              <Link to={`/groups/${g.id}`} key={g.id}>
                <div className="flex justify-between items-center p-4 bg-background rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all group">
                  <div>
                    <strong className="block text-text group-hover:text-primary transition-colors">{g.name}</strong>
                    <span className="text-sm text-muted">{g.members.length} Members</span>
                  </div>
                  <ArrowRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/groups/new" className="block">
          <button className="w-full bg-primary hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2">
            <Plus size={18} /> Create a Group
          </button>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 shadow-sm text-white">
        <h3 className="text-lg font-bold mb-2">Lade Freunde zu BoardMeet ein!</h3>
        <p className="text-sm text-green-50 mb-4 opacity-90">Teile die App mit deinen Freunden, damit ihr gemeinsam Spieleabende planen könnt.</p>
        <button 
          onClick={() => {
            import('../utils/share').then(({ shareToWhatsApp }) => {
              const appLink = window.location.origin;
              const text = `Hey! Ich organisiere meine Brettspielabende jetzt mit BoardMeet. Meld dich auch mal an, dann können wir leichter planen: ${appLink}`;
              shareToWhatsApp(text, appLink);
            });
          }}
          className="w-full bg-white text-green-600 font-extrabold py-3 px-4 rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all flex justify-center items-center gap-2"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          App über WhatsApp empfehlen
        </button>
      </div>
    </div>
  );
}
