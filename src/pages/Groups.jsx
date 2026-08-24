import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight } from 'lucide-react';

export default function Groups() {
  const { currentUser, groups } = useStore();
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} className="text-primary" /> My Groups
        </h2>
        <Link to="/groups/new">
          <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <Plus size={18} /> New
          </button>
        </Link>
      </div>
      
      {userGroups.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--muted-text)', textAlign: 'center' }}>No groups found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userGroups.map(g => (
            <Link to={`/groups/${g.id}`} key={g.id}>
              <div className="card clickable" style={{ margin: 0, padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{g.name}</h3>
                  <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {g.members.length} {g.members.length === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <ArrowRight size={20} style={{ color: 'var(--muted-text)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
