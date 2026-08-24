import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const { currentUser, groups, events } = useStore();
  
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));
  const userEvents = events.filter(e => e.attendees.includes(currentUser.id) || e.waitlist.includes(currentUser.id));

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Hi, {currentUser.name}! 👋</h1>
      
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
          <Calendar size={20} className="text-primary" /> Upcoming Events
        </h3>
        
        {userEvents.length === 0 ? (
          <p style={{ color: 'var(--muted-text)' }}>No upcoming events. Check your groups!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userEvents.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-color)' }}>{ev.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                      {new Date(ev.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--muted-text)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
          <Users size={20} className="text-primary" /> Your Groups
        </h3>
        
        {userGroups.length === 0 ? (
          <p style={{ color: 'var(--muted-text)' }}>You are not part of any groups yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--spacing-md)' }}>
            {userGroups.map(g => (
              <Link to={`/groups/${g.id}`} key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-color)' }}>{g.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>{g.members.length} Members</span>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--muted-text)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/groups/new" style={{ display: 'block' }}>
          <button className="btn-primary" style={{ width: '100%' }}>
            + Create a Group
          </button>
        </Link>
      </div>
    </div>
  );
}
