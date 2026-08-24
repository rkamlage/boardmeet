import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function NewGroup() {
  const [name, setName] = useState('');
  const { createGroup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroup(name);
    navigate('/groups');
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Create New Group</h2>
      <form onSubmit={handleSubmit} className="card">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Group Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field" 
          placeholder="e.g. Weekend Gamers"
          required
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'var(--spacing-md)' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</button>
          <button type="submit" className="btn-primary" style={{ flex: 2 }}>Create</button>
        </div>
      </form>
    </div>
  );
}
