import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Calendar as CalendarIcon, Users, ChevronLeft, Plus, Crown } from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const { groups, events, currentUser } = useStore();
  const navigate = useNavigate();
  
  const group = groups.find(g => g.id === id);
  if (!group) return <div className="container"><p>Group not found</p></div>;

  const groupEvents = events.filter(e => e.groupId === group.id);
  const isAdmin = group.adminId === currentUser.id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.4rem', borderRadius: '50%' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{group.name}</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <CalendarIcon size={20} className="text-primary" /> Group Events
          </h3>
          {isAdmin && (
            <Link to={`/groups/${group.id}/events/new`}>
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Event
              </button>
            </Link>
          )}
        </div>
        
        {groupEvents.length === 0 ? (
          <p style={{ color: 'var(--muted-text)' }}>No events scheduled.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {groupEvents.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div className="card clickable" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-color)' }}>{ev.title}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '0.25rem' }}>
                      {new Date(ev.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="badge">{ev.attendees.length}/{ev.maxPlayers}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
          <Users size={20} className="text-primary" /> Members ({group.members.length})
        </h3>
        <ul style={{ listStyle: 'none' }}>
          {group.members.map(m => (
            <li key={m} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {m === currentUser.id ? 'Y' : m[0].toUpperCase()}
              </div>
              <span style={{ flex: 1 }}>{m === currentUser.id ? 'You' : m}</span>
              {m === group.adminId && <Crown size={16} style={{ color: '#eab308' }} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
