import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight } from 'lucide-react';

export default function Groups() {
  const { currentUser, groups } = useStore();
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Users size={28} className="text-primary" /> My Groups
        </h2>
        <Link to="/groups/new">
          <button className="bg-primary hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <Plus size={18} /> New
          </button>
        </Link>
      </div>
      
      {userGroups.length === 0 ? (
        <div className="bg-card border border-slate-200 rounded-2xl p-6 text-center text-muted">
          <p>No groups found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {userGroups.map(g => (
            <Link to={`/groups/${g.id}`} key={g.id}>
              <div className="bg-card border border-slate-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all flex justify-between items-center group">
                <div>
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{g.name}</h3>
                  <p className="text-sm text-muted mt-1">
                    {g.members.length} {g.members.length === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <ArrowRight size={20} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
