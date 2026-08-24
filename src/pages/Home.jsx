import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const { currentUser, groups, events } = useStore();
  
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));
  const userEvents = events.filter(e => e.attendees.includes(currentUser.id) || e.waitlist.includes(currentUser.id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Hi, {currentUser.name}! 👋</h1>
      
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
    </div>
  );
}
