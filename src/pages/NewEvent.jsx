import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Calendar, MapPin, Edit3, Users } from 'lucide-react';

export default function NewEvent() {
  const { groupId } = useParams();
  const { createEvent, locations, addLocation } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    locationId: locations[0]?.id || 'custom'
  });

  const [customLocation, setCustomLocation] = useState({ name: '', maxPlayers: 4 });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [recurrence, setRecurrence] = useState('none');

  const handleSubmit = (e) => {
    e.preventDefault();
    let locId = formData.locationId;
    let maxPlayers = 4;

    if (locId === 'custom') {
      const newLoc = addLocation(customLocation.name, parseInt(customLocation.maxPlayers, 10));
      locId = newLoc.id;
      maxPlayers = newLoc.maxPlayers;
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
    if (recurrence === 'monthly') { count = 4; daysToAdd = 28; } // approx monthly for same weekday
    
    for (let i = 0; i < count; i++) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + (i * daysToAdd));
      
      createEvent({
        groupId,
        title: count > 1 ? `${formData.title} (#${i + 1})` : formData.title,
        date: eventDate.toISOString().slice(0, 16),
        locationId: locId,
        maxPlayers: maxPlayers
      });
    }

    navigate(`/groups/${groupId}`);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>Create Event</h2>
      
      <form onSubmit={handleSubmit} className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          <Edit3 size={18} className="text-primary"/> Event Title
        </label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field" 
          placeholder="e.g. Epic Saturday Night"
          required
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          <Calendar size={18} className="text-primary" /> Date & Time
        </label>
        <input 
          type="datetime-local" 
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input-field" 
          required
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          <MapPin size={18} className="text-primary"/> Location
        </label>
        <select 
          name="locationId"
          value={formData.locationId}
          onChange={handleChange}
          className="input-field"
        >
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name} (Max {loc.maxPlayers})</option>
          ))}
          <option value="custom">+ Neuer Ort (Custom)</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem', fontWeight: 'bold' }}>
          <Calendar size={18} className="text-primary"/> Wiederholung
        </label>
        <select 
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="input-field"
        >
          <option value="none">Einmaliges Event</option>
          <option value="weekly">Wöchentlich (nächste 4 Wochen)</option>
          <option value="biweekly">Alle 2 Wochen (nächste 4 Termine)</option>
          <option value="monthly">Monatlich (nächste 4 Termine)</option>
        </select>

        {formData.locationId === 'custom' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Ort Name
            </label>
            <input 
              type="text"
              className="input-field"
              value={customLocation.name}
              onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
              placeholder="z.B. Im Garten"
              required
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <Users size={16} /> Max Spieler
            </label>
            <input 
              type="number"
              className="input-field"
              value={customLocation.maxPlayers}
              onChange={(e) => setCustomLocation({ ...customLocation, maxPlayers: e.target.value })}
              min="2" max="20"
              required
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</button>
          <button type="submit" className="btn-primary" style={{ flex: 2 }}>Create Event</button>
        </div>
      </form>
    </div>
  );
}
