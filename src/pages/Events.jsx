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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} className="text-primary" /> My Events
        </h2>
      </div>
      
      {userEvents.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--muted-text)', textAlign: 'center' }}>No upcoming events.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userEvents.map(ev => {
            const isWaitlisted = ev.waitlist.includes(currentUser.id);
            const locName = locations.find(l => l.id === ev.locationId)?.name || 'Unknown';
            return (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div className="card clickable" style={{ margin: 0, padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{ev.title}</h3>
                    {isWaitlisted && <span className="badge">Waitlist</span>}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                      <Calendar size={16} />
                      {new Date(ev.date).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                      <MapPin size={16} />
                      {locName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                      <Users size={16} />
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
