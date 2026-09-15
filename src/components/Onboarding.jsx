import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const { currentUser, updateUserProfile } = useStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await updateUserProfile(currentUser.id, { name: name.trim() });
      localStorage.setItem('boardmeet_onboarded_' + currentUser.id, 'true');
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-text mb-2 tracking-tight">Willkommen bei BoardMeet! 🎲</h1>
        <p className="text-muted text-center mb-8 font-medium">Wie möchtest du von deinen Mitspielern genannt werden?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wide">Dein Rufname</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Alex"
              className="w-full p-4 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary transition-all font-bold text-lg"
              required
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !name.trim()}
            className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-sm transition-all text-lg disabled:opacity-50"
          >
            {loading ? 'Speichern...' : 'Los geht\'s!'}
          </button>
        </form>
      </div>
    </div>
  );
}
