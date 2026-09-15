import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GameSearch from '../components/BggSearch';
import { Calendar as CalendarIcon, MapPin, Users, Download, ChevronLeft, UserPlus, ShoppingBag, Gamepad2, Trophy, ExternalLink } from 'lucide-react';
import { ACCESSORIES } from './Profile';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, locations, currentUser, joinEvent, leaveEvent, addGuest, voteGame, addBringListItem, recordMatch, userProfiles, deleteEvent } = useStore();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showBringListInput, setShowBringListInput] = useState(false);
  const [bringItem, setBringItem] = useState('');
  
  const event = events.find(e => e.id === id);
  if (!event) return <div className="text-center text-muted p-8">Event not found</div>;

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
    if (userId === currentUser.id) return `Du (${currentUser.name || userProfiles?.[userId]?.name || 'Ohne Namen'})`;
    if (userId.includes('_guest_')) {
      const parent = userId.split('_guest_')[0];
      return `${parent === currentUser.id ? 'Dein' : (userProfiles?.[parent]?.name || parent) + 's'} Gast`;
    }
    return userProfiles?.[userId]?.name || userId;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button className="p-2 bg-card hover:bg-slate-100 rounded-full transition-colors shadow-sm border border-slate-200" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-text" />
        </button>
        <h2 className="text-2xl font-bold flex-1 text-center truncate px-4">{event.title}</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-background p-3 rounded-xl border border-slate-100 shadow-sm">
              <CalendarIcon size={24} className="text-primary" />
            </div>
            <div>
              <strong className="block text-text font-bold">Date</strong>
              <span className="text-muted text-sm">{new Date(event.date).toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-background p-3 rounded-xl border border-slate-100 shadow-sm">
              <MapPin size={24} className="text-primary" />
            </div>
            <div>
              <strong className="block text-text font-bold">Location</strong>
              <span className="text-muted text-sm">{locationObj.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-background p-3 rounded-xl border border-slate-100 shadow-sm">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <strong className="block text-text font-bold">Capacity</strong>
              <span className="text-muted text-sm">{event.attendees.length} / {event.maxPlayers} Players {isFull && <span className="ml-2 bg-indigo-100 text-primary px-2 py-0.5 rounded-full text-xs font-bold border border-indigo-200">Full</span>}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-all shadow-sm ${
              (isAttending || isWaitlisted) 
                ? 'bg-background border border-slate-300 text-text hover:bg-slate-50' 
                : 'bg-primary text-white hover:bg-indigo-600 hover:shadow-md'
            }`}
            onClick={handleRSVP}
          >
            {isAttending ? 'Leave Event' : (isWaitlisted ? 'Leave Waitlist' : (isFull ? 'Join Waitlist' : 'Join Event'))}
          </button>

          <div className="flex gap-3">
            {(isAttending || isWaitlisted) && (
              <button className="flex-1 bg-background border border-slate-200 text-text font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm" onClick={() => addGuest(event.id)}>
                <UserPlus size={18} /> Guest
              </button>
            )}
            <button onClick={exportICS} className="flex-1 bg-card border border-slate-200 text-text font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} /> Kalender
            </button>
            <button 
              onClick={() => {
                import('../utils/share').then(({ shareToWhatsApp }) => {
                  const eventLink = `${window.location.origin}/events/${event.id}`;
                  const formattedDate = new Date(event.date).toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
                  const text = `🎲 Nächster Spieleabend: "${event.title}" am ${formattedDate}!\nTrag dich hier ein: ${eventLink}`;
                  shareToWhatsApp(text, eventLink);
                });
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> 
              Teilen
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-5">
          <Users size={20} className="text-primary" /> Attendees
        </h3>
        <div className="flex flex-wrap gap-6">
          {event.attendees.map(m => {
            const accId = userProfiles?.[m]?.accessory || 'none';
            const accObj = ACCESSORIES.find(a => a.id === accId) || {};
            
            return (
              <div key={m} className="flex flex-col items-center">
                <div className="relative w-14 h-14 flex justify-center items-center bg-background rounded-full text-3xl shadow-sm border border-slate-100">
                  🧑
                  {accObj.icon && (
                    <div className={`absolute text-2xl z-10 drop-shadow-sm ${accObj.id === 'glasses' || accObj.id === 'sunglasses' ? 'top-[15%]' : 'top-[-20%]'}`}>
                      {accObj.icon}
                    </div>
                  )}
                </div>
                <span className="text-xs mt-2 font-bold text-text truncate max-w-[80px] text-center">{formatName(m)}</span>
              </div>
            );
          })}
        </div>
        
        {event.waitlist.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-muted font-bold text-sm mb-4">Waitlist</h4>
            <div className="flex flex-wrap gap-5">
              {event.waitlist.map((m, idx) => {
                const accId = userProfiles?.[m]?.accessory || 'none';
                const accObj = ACCESSORIES.find(a => a.id === accId) || {};
                
                return (
                  <div key={m} className="flex flex-col items-center opacity-60">
                    <div className="relative w-12 h-12 flex justify-center items-center bg-background rounded-full text-2xl border border-slate-100">
                      🧑
                      {accObj.icon && (
                        <div className={`absolute text-xl z-10 drop-shadow-sm ${accObj.id === 'glasses' || accObj.id === 'sunglasses' ? 'top-[15%]' : 'top-[-20%]'}`}>
                          {accObj.icon}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] mt-1 font-medium text-text truncate max-w-[70px] text-center">{idx + 1}. {formatName(m)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Gamepad2 size={20} className="text-primary" /> Games
          </h3>
          <button className="bg-background border border-slate-200 text-text font-medium py-1 px-3 rounded-lg flex items-center justify-center text-sm hover:bg-slate-50 transition-colors" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? 'Close' : '+ Add Game'}
          </button>
        </div>
        
        {showSearch && <div className="mb-6"><GameSearch eventId={event.id} /></div>}

        {event.games.length === 0 ? (
          <p className="text-muted text-sm">No games added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {event.games.map(g => (
              <div key={g.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-background rounded-xl border border-slate-200">
                <div>
                  <strong className="block text-text font-bold mb-1">{g.name}</strong>
                  <div className="flex gap-3 items-center">
                    <span className="bg-indigo-50 text-primary border border-indigo-100 px-2 py-0.5 rounded-full text-xs font-bold">{g.votes.length} votes</span>
                    {g.description?.startsWith('Link: ') ? (
                      <a href={g.description.split('Link: ')[1]} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                        Info <ExternalLink size={12} />
                      </a>
                    ) : (
                      <a href={`https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(g.name)}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                        Info <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button 
                    className={`py-1.5 px-3 rounded-lg font-semibold text-sm transition-all shadow-sm ${g.votes.includes(currentUser.id) ? 'bg-primary text-white hover:bg-indigo-600' : 'bg-card border border-slate-200 text-text hover:bg-slate-50'}`}
                    onClick={() => voteGame(event.id, g.id)}
                  >
                    {g.votes.includes(currentUser.id) ? 'Voted' : 'Vote'}
                  </button>
                  <button 
                    className="py-1.5 px-3 rounded-lg font-semibold text-xs transition-all bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100 shadow-sm"
                    onClick={() => recordMatch(event.id, g.id, currentUser.id)}
                  >
                    Ich habe gewonnen! 🏆
                  </button>

                  {/* Matches List */}
                  {event.matches && event.matches.filter(m => m.gameId === g.id).length > 0 && (
                    <div className="mt-1 text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                      <strong className="block mb-1 text-slate-500">Siege:</strong>
                      <ul className="text-yellow-600 font-bold space-y-0.5 ml-1">
                        {event.matches.filter(m => m.gameId === g.id).map(m => (
                          <li key={m.id} className="flex items-center gap-1">🥇 {formatName(m.winnerId)}</li>
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

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag size={20} className="text-primary" /> Bring List
          </h3>
          <div className="flex gap-2">
            {event.bringList.length > 0 && (
              <button 
                className="bg-green-50 text-green-600 border border-green-200 font-medium py-1 px-3 rounded-lg flex items-center justify-center text-sm hover:bg-green-100 transition-colors"
                onClick={() => {
                  import('../utils/share').then(({ shareToWhatsApp }) => {
                    const missingItems = event.bringList.filter(i => !i.assignee).map(i => '- ' + i.item).join('\n');
                    const text = `⚠️ Reminder für unseren Spieleabend!\n\nEs fehlen noch Sachen auf der Mitbring-Liste:\n${missingItems || 'Leider gar nichts mehr, aber bringt gute Laune mit!'}\n\nTrag dich schnell hier in der App ein: ${window.location.origin}/events/${event.id}`;
                    shareToWhatsApp(text);
                  });
                }}
              >
                Erinnern
              </button>
            )}
            <button className="bg-background border border-slate-200 text-text font-medium py-1 px-3 rounded-lg flex items-center justify-center text-sm hover:bg-slate-50 transition-colors" onClick={() => setShowBringListInput(!showBringListInput)}>
              {showBringListInput ? 'Close' : '+ Add Item'}
            </button>
          </div>
        </div>
        
        {showBringListInput && (
          <form onSubmit={handleAddBringItem} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={bringItem} 
              onChange={(e) => setBringItem(e.target.value)} 
              placeholder="e.g. 2 bags of chips"
              className="flex-1 p-2 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button type="submit" className="bg-primary hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all">Add</button>
          </form>
        )}

        {event.bringList.length === 0 ? (
          <p className="text-muted text-sm">Nothing requested yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {event.bringList.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-background rounded-xl border border-slate-200">
                <strong className="text-text font-medium">{item.item}</strong>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">{formatName(item.assignee)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {event.createdBy === currentUser.id && (
        <button 
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this event?')) {
              try {
                await deleteEvent(event.id);
                navigate(`/groups/${event.groupId}`);
              } catch (e) {
                alert('Error deleting event: ' + e.message);
              }
            }
          }}
          className="w-full bg-red-50 text-red-600 border border-red-200 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
        >
          Delete Event
        </button>
      )}
    </div>
  );
}
