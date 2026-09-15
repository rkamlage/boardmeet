import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Users, LogIn } from 'lucide-react';

export default function JoinGroup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, joinGroup, currentUser, isAuthLoading } = useStore();
  const [loading, setLoading] = useState(false);

  const group = groups.find(g => g.id === id);

  useEffect(() => {
    // If they are already a member, redirect to group page
    if (group && currentUser && group.members.includes(currentUser.id)) {
      navigate(`/groups/${id}`);
    }
  }, [group, currentUser, navigate, id]);

  if (isAuthLoading) return <div className="p-8 text-center text-muted">Loading...</div>;

  if (!group) return <div className="p-8 text-center text-muted">Group not found. Invalid link.</div>;

  const handleJoin = async () => {
    if (!currentUser) {
      // Direct them to profile (login) page, maybe save redirect url in localStorage?
      // For simplicity, just send them to login.
      navigate('/profile');
      return;
    }
    
    setLoading(true);
    try {
      await joinGroup(group.id);
      navigate(`/groups/${group.id}`);
    } catch (e) {
      alert('Error joining group: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-card border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
      <div className="w-16 h-16 bg-indigo-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Join {group.name}</h2>
      <p className="text-muted mb-8">You've been invited to join this BoardMeet group!</p>
      
      {!currentUser ? (
        <button 
          onClick={handleJoin}
          className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
        >
          <LogIn size={20} /> Login or Sign Up to Join
        </button>
      ) : (
        <button 
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-600 transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Group'}
        </button>
      )}
    </div>
  );
}
