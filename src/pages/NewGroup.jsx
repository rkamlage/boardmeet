import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function NewGroup() {
  const [name, setName] = useState('');
  const { createGroup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createGroup(name);
    navigate('/groups');
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Create New Group</h2>
      <form onSubmit={handleSubmit} className="bg-card border border-slate-200 rounded-2xl p-6 shadow-sm">
        <label className="block mb-2 font-bold text-text">Group Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-6" 
          placeholder="e.g. Weekend Gamers"
          required
        />
        <div className="flex gap-3">
          <button type="button" className="flex-1 bg-background border border-slate-300 text-text font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="flex-[2] bg-primary hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all">Create</button>
        </div>
      </form>
    </div>
  );
}
