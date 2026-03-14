import { useState } from 'react';
import { authApi } from '../services/api';
import { LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userProfile = await authApi.login(loginId, password);
      onLogin(userProfile);
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid Login Id or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-10 md:p-12 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <LogIn size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-[var(--muted-foreground)] mb-10 font-serif italic text-sm">CoreInventory Enterprise System</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-center justify-center space-x-2"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-2 ml-1">Login Id</label>
            <input 
              required
              type="text" 
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-6 py-4 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all placeholder:text-[var(--muted-foreground)]/50"
              placeholder="Enter your ID"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all placeholder:text-[var(--muted-foreground)]/50"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        
        <div className="mt-10 flex flex-col space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Link to="/forgot-password" opacity-60 hover:opacity-100 transition-opacity className="text-[var(--muted-foreground)]">Forgot Password?</Link>
            <span className="text-[var(--border)]">|</span>
            <Link to="/signup" className="text-primary hover:underline font-semibold font-medium">Create Account</Link>
          </div>
          
          <div className="pt-8 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted-foreground)] opacity-40 uppercase tracking-[0.2em] font-mono">Secure Access Terminal</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
