import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Calendar, MapPin, Edit3, Users } from 'lucide-react';

export default function NewEvent() {
  const { id: urlGroupId } = useParams();
  const { createEvent, locations, addLocation, groups } = useStore();
  const navigate = useNavigate();

  const [selectedGroupId, setSelectedGroupId] = useState(urlGroupId || (groups?.[0]?.id || ''));

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    locationId: 'custom' // We'll set this below properly
  });

  const [customLocation, setCustomLocation] = useState({ name: '', maxPlayers: 4 });
  const [recurrence, setRecurrence] = useState('none');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert('Bitte eine Gruppe auswählen');
      return;
    }
    
    let locId = formData.locationId;
    let maxPlayers = 4;

    if (locId === 'custom') {
      const newLoc = await addLocation(customLocation.name, parseInt(customLocation.maxPlayers, 10));
      locId = newLoc.id;
      maxPlayers = newLoc.max_players; // DB uses max_players
    } else {
      const selectedLocation = locations.find(l => l.id === locId);
      maxPlayers = selectedLocation ? selectedLocation.maxPlayers : 4;
    }
    
    // Base Event Date
    const baseDate = new Date(formData.date);
    
    // Determine how many events to create
    let count = 1;
    let daysToAdd = 0;
    
    if (recurrence === 'weekly') { count = 4; daysToAdd = 7; }
    if (recurrence === 'biweekly') { count = 4; daysToAdd = 14; }
    if (recurrence === 'monthly') { count = 4; daysToAdd = 28; }
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + (i * daysToAdd));
      
      promises.push(createEvent({
        groupId: selectedGroupId,
        title: count > 1 ? `${formData.title} (#${i + 1})` : formData.title,
        date: eventDate.toISOString().slice(0, 16),
        locationId: locId,
        maxPlayers: maxPlayers
      }));
    }

    await Promise.all(promises);
    navigate(`/groups/${selectedGroupId}`);
  };

  const currentGroupMembers = groups.find(g => g.id === selectedGroupId)?.members || [];
  const groupLocations = locations.filter(l => !l.createdBy || currentGroupMembers.includes(l.createdBy));

  // Ensure locationId is valid when switching groups
  React.useEffect(() => {
    if (formData.locationId !== 'custom' && !groupLocations.some(l => l.id === formData.locationId)) {
      setFormData(prev => ({ ...prev, locationId: groupLocations.length > 0 ? groupLocations[0].id : 'custom' }));
    }
  }, [selectedGroupId, groupLocations.length]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center">Create Event</h2>
      
      <form onSubmit={handleSubmit} className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {!urlGroupId && (
          <>
            <label className="flex items-center gap-2 mb-2 font-bold text-text">
              <Users size={18} className="text-primary"/> Gruppe
            </label>
            <select 
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-4" 
              required
            >
              {groups?.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </>
        )}

        <label className="flex items-center gap-2 mb-2 font-bold text-text">
          <Edit3 size={18} className="text-primary"/> Event Title
        </label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-4" 
          placeholder="e.g. Epic Saturday Night"
          required
        />

        <label className="flex items-center gap-2 mb-2 font-bold text-text">
          <Calendar size={18} className="text-primary" /> Date & Time
        </label>
        <input 
          type="datetime-local" 
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-4" 
          required
        />

        <label className="flex items-center gap-2 mb-2 font-bold text-text">
          <MapPin size={18} className="text-primary"/> Location
        </label>
        <select 
          name="locationId"
          value={formData.locationId}
          onChange={handleChange}
          className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-4"
        >
          {groupLocations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name} (Max {loc.maxPlayers})</option>
          ))}
          <option value="custom">+ Neuer Ort (Custom)</option>
        </select>

        {formData.locationId === 'custom' && (
          <div className="mt-2 p-4 bg-background border border-slate-200 rounded-xl mb-4">
            <label className="block mb-2 text-sm font-bold text-text">Ort Name</label>
            <input 
              type="text"
              value={customLocation.name}
              onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 mb-3"
              placeholder="z.B. Im Garten"
              required
            />
            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-text">
              <Users size={16} /> Max Spieler
            </label>
            <input 
              type="number"
              value={customLocation.maxPlayers}
              onChange={(e) => setCustomLocation({ ...customLocation, maxPlayers: e.target.value })}
              min="2" max="20"
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>
        )}

        <label className="flex items-center gap-2 mb-2 font-bold text-text">
          <Calendar size={18} className="text-primary"/> Wiederholung
        </label>
        <select 
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-6"
        >
          <option value="none">Einmaliges Event</option>
          <option value="weekly">Wöchentlich (nächste 4 Wochen)</option>
          <option value="biweekly">Alle 2 Wochen (nächste 4 Termine)</option>
          <option value="monthly">Monatlich (nächste 4 Termine)</option>
        </select>

        <div className="flex gap-3">
          <button type="button" className="flex-1 bg-background border border-slate-300 text-text font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="flex-[2] bg-primary hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all">Create Event</button>
        </div>
      </form>
    </div>
  );
}
