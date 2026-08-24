import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GameSearch from '../components/BggSearch';
import { Calendar as CalendarIcon, MapPin, Users, Download, ChevronLeft, UserPlus, ShoppingBag, Gamepad2, Trophy, ExternalLink } from 'lucide-react';
import { ACCESSORIES } from './Profile';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, locations, currentUser, joinEvent, leaveEvent, addGuest, voteGame, addBringListItem, recordMatch, userProfiles } = useStore();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showBringListInput, setShowBringListInput] = useState(false);
  const [bringItem, setBringItem] = useState('');
  
  const event = events.find(e => e.id === id);
  if (!event) return <div className="container"><p>Event not found</p></div>;

  const locationObj = locations.find(l => l.id === event.locationId) || { name: 'Unknown' };

  const isAttending = event.attendees.includes(currentUser.id);
  const isWaitlisted = event.waitlist.includes(currentUser.id);
  const isFull = event.attendees.length >= event.maxPlayers;

  const handleRSVP = () => {
    if (isAttending || isWaitlisted) {
      leaveEvent(event.id);
    } else {
      joinEvent(event.id);
    }
  };

  const handleAddBringItem = (e) => {
    e.preventDefault();
    if (bringItem.trim()) {
      addBringListItem(event.id, bringItem, currentUser.id);
      setBringItem('');
      setShowBringListInput(false);
    }
  };

  const formatName = (userId) => {
    if (userId === currentUser.id) return 'You';
    if (userId.includes('_guest_')) {
      const parent = userId.split('_guest_')[0];
      return `${parent === currentUser.id ? 'Your' : parent + "'s"} Guest`;
    }
    return userId;
  };

  const exportICS = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // assume 3 hours long
    
    const fmt = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BoardMeet//EN
BEGIN:VEVENT
UID:${event.id}@boardmeet.app
DTSTAMP:${fmt(new Date())}
DTSTART:${fmt(startDate)}
DTEND:${fmt(endDate)}
SUMMARY:${event.title}
LOCATION:${locationObj.name}
DESCRIPTION:Boardgame night via BoardMeet
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${event.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.4rem', borderRadius: '50%' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{event.title}</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
              <CalendarIcon size={20} className="text-primary" />
            </div>
            <div>
              <strong style={{ display: 'block' }}>Date</strong>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <strong style={{ display: 'block' }}>Location</strong>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>{locationObj.name}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <strong style={{ display: 'block' }}>Capacity</strong>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>{event.attendees.length} / {event.maxPlayers} Players {isFull && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Full</span>}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={(isAttending || isWaitlisted) ? "btn-secondary" : "btn-primary"} 
            onClick={handleRSVP}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {isAttending ? 'Leave Event' : (isWaitlisted ? 'Leave Waitlist' : (isFull ? 'Join Waitlist' : 'Join Event'))}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(isAttending || isWaitlisted) && (
              <button className="btn-secondary" onClick={() => addGuest(event.id)} style={{ flex: 1 }}>
                <UserPlus size={16} /> Guest
              </button>
            )}
            <button className="btn-secondary" onClick={exportICS} style={{ flex: 1 }}>
              <Download size={16} /> Export ICS
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
          <Users size={20} /> Attendees
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {event.attendees.map(m => {
            const accId = userProfiles?.[m]?.accessory || 'none';
            const accObj = ACCESSORIES.find(a => a.id === accId) || {};
            
            return (
              <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '50%', fontSize: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                  🧑
                  {accObj.icon && (
                    <div style={{ position: 'absolute', top: accObj.id === 'glasses' || accObj.id === 'sunglasses' ? '15%' : '-20%', fontSize: '1.4rem', zIndex: 10 }}>
                      {accObj.icon}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 'bold' }}>{formatName(m)}</span>
              </div>
            );
          })}
        </div>
        
        {event.waitlist.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h4 style={{ color: 'var(--muted-text)', marginBottom: '0.5rem' }}>Waitlist</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {event.waitlist.map((m, idx) => {
                const accId = userProfiles?.[m]?.accessory || 'none';
                const accObj = ACCESSORIES.find(a => a.id === accId) || {};
                
                return (
                  <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '50%', fontSize: '1.5rem' }}>
                      🧑
                      {accObj.icon && (
                        <div style={{ position: 'absolute', top: accObj.id === 'glasses' || accObj.id === 'sunglasses' ? '15%' : '-20%', fontSize: '1.2rem', zIndex: 10 }}>
                          {accObj.icon}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>{idx + 1}. {formatName(m)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Gamepad2 size={20} /> Games
          </h3>
          <button className="btn-secondary" onClick={() => setShowSearch(!showSearch)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
            {showSearch ? 'Close' : '+ Add Game'}
          </button>
        </div>
        
        {showSearch && <GameSearch eventId={event.id} />}

        {event.games.length === 0 ? (
          <p style={{ color: 'var(--muted-text)' }}>No games added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {event.games.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-color)' }}>{g.name}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span className="badge badge-primary">{g.votes.length} votes</span>
                    <a href={`https://boardgamegeek.com/boardgame/${g.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Rules <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <button 
                    className={g.votes.includes(currentUser.id) ? "btn-primary" : "btn-secondary"} 
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => voteGame(event.id, g.id)}
                  >
                    {g.votes.includes(currentUser.id) ? 'Voted' : 'Vote'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '0.2rem', borderColor: '#eab308', color: '#eab308' }}
                    onClick={() => recordMatch(event.id, g.id, currentUser.id)}
                  >
                    Ich habe gewonnen! 🏆
                  </button>

                  {/* Matches List */}
                  {event.matches && event.matches.filter(m => m.gameId === g.id).length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.1)', padding: '0.3rem', borderRadius: '4px' }}>
                      <strong>Siege:</strong>
                      <ul style={{ margin: 0, paddingLeft: '1rem', color: '#eab308' }}>
                        {event.matches.filter(m => m.gameId === g.id).map(m => (
                          <li key={m.id}>{formatName(m.winnerId)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ShoppingBag size={20} /> Bring List
          </h3>
          <button className="btn-secondary" onClick={() => setShowBringListInput(!showBringListInput)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
            {showBringListInput ? 'Close' : '+ Add Item'}
          </button>
        </div>
        
        {showBringListInput && (
          <form onSubmit={handleAddBringItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--spacing-md)' }}>
            <input 
              type="text" 
              value={bringItem} 
              onChange={(e) => setBringItem(e.target.value)} 
              placeholder="e.g. 2 bags of chips"
              className="input-field"
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button type="submit" className="btn-primary">Add</button>
          </form>
        )}

        {event.bringList.length === 0 ? (
          <p style={{ color: 'var(--muted-text)' }}>Nothing requested yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {event.bringList.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <strong>{item.item}</strong>
                <span className="badge">{formatName(item.assignee)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
