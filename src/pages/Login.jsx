import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Dices } from 'lucide-react';

export default function Login() {
  const { login, signup, loginWithGoogle } = useStore();
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

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={async () => {
            try {
              setLoading(true);
              await loginWithGoogle();
            } catch (err) {
              setError(err.message);
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex justify-center items-center gap-3"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Google
        </button>
        
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
