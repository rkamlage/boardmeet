import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Dices } from 'lucide-react';

export default function Login() {
  const { login, signup } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
        alert('Account created! You might need to confirm your email.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="bg-card border border-slate-200 w-full max-w-md text-center p-12 rounded-3xl shadow-sm">
        <div className="inline-flex items-center justify-center bg-primary text-white p-4 rounded-full mb-6 shadow-md shadow-primary/20">
          <Dices size={40} />
        </div>
        <h2 className="mb-2 text-3xl font-extrabold text-text tracking-tight">BoardMeet</h2>
        <p className="text-muted mb-8 font-medium">Organize your game nights effortlessly.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email"
            className="w-full p-4 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            className="w-full p-4 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-sm shadow-primary/20 hover:shadow-md transition-all text-lg" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <p className="mt-8 text-muted text-sm font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary hover:text-indigo-600 font-bold transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
