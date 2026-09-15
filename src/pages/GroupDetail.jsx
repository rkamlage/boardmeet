import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Calendar as CalendarIcon, Users, ChevronLeft, Plus, Crown } from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const { groups, events, currentUser, deleteGroup } = useStore();
  const navigate = useNavigate();
  
  const group = groups.find(g => g.id === id);
  if (!group) return <div className="text-center text-muted p-8">Group not found</div>;

  const groupEvents = events.filter(e => e.groupId === group.id);
  const isAdmin = group.adminId === currentUser.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button className="p-2 bg-card hover:bg-slate-100 rounded-full transition-colors shadow-sm border border-slate-200" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-text" />
        </button>
        <h2 className="text-2xl font-bold flex-1 text-center truncate px-4">{group.name}</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <CalendarIcon size={20} className="text-primary" /> Group Events
          </h3>
          {isAdmin && (
            <Link to={`/groups/${group.id}/events/new`}>
              <button className="bg-primary hover:bg-indigo-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1 text-sm">
                <Plus size={16} /> Event
              </button>
            </Link>
          )}
        </div>
        
        {groupEvents.length === 0 ? (
          <p className="text-muted text-sm">No events scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {groupEvents.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id}>
                <div className="bg-background border border-slate-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all flex justify-between items-center group">
                  <div>
                    <strong className="block text-text group-hover:text-primary transition-colors">{ev.title}</strong>
                    <div className="text-sm text-muted mt-1">
                      {new Date(ev.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="bg-slate-100 text-muted px-2 py-1 rounded-full text-xs font-semibold">{ev.attendees.length}/{ev.maxPlayers}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
          <Users size={20} className="text-primary" /> Members ({group.members.length})
        </h3>
        
        <button 
          onClick={() => {
            import('../utils/share').then(({ shareToWhatsApp }) => {
              const inviteLink = `${window.location.origin}/groups/${group.id}/join`;
              const text = `Hey! Ich habe unsere Brettspiel-Runde jetzt in BoardMeet angelegt. Klick hier, um der Gruppe beizutreten: ${inviteLink}`;
              shareToWhatsApp(text, inviteLink);
            });
          }}
          className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          In WhatsApp einladen
        </button>

        <ul className="divide-y divide-slate-100">
          {group.members.map(m => (
            <li key={m} className="py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                {m === currentUser.id ? 'Y' : m[0].toUpperCase()}
              </div>
              <span className="flex-1 font-medium">{m === currentUser.id ? 'You' : m}</span>
              {m === group.adminId && <Crown size={18} className="text-yellow-500 drop-shadow-sm" />}
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <button 
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this group?')) {
              try {
                await deleteGroup(group.id);
                navigate('/groups');
              } catch (e) {
                alert('Error deleting group: ' + e.message);
              }
            }
          }}
          className="w-full bg-red-50 text-red-600 border border-red-200 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
        >
          Delete Group
        </button>
      )}
    </div>
  );
}
