import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, MapPin, Users } from 'lucide-react';

export default function Events() {
  const { currentUser, events, locations } = useStore();
  const userEvents = events.filter(e => e.attendees.includes(currentUser.id) || e.waitlist.includes(currentUser.id));

  // Sort by date
  userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Calendar size={28} className="text-primary" /> My Events
        </h2>
      </div>
      
      {userEvents.length === 0 ? (
        <div className="bg-card border border-slate-200 rounded-2xl p-6 text-center text-muted shadow-sm">
          <p>No upcoming events.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {userEvents.map(ev => {
            const isWaitlisted = ev.waitlist.includes(currentUser.id);
            const locName = locations.find(l => l.id === ev.locationId)?.name || 'Unknown';
            return (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div className="bg-card border border-slate-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all group shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{ev.title}</h3>
                    {isWaitlisted && <span className="bg-slate-100 text-muted px-2 py-1 rounded-full text-xs font-semibold">Waitlist</span>}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <Calendar size={16} className="text-primary" />
                      {new Date(ev.date).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <MapPin size={16} className="text-primary" />
                      {locName}
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <Users size={16} className="text-primary" />
                      {ev.attendees.length} / {ev.maxPlayers} Players
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
