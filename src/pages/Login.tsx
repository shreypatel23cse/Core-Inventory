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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] p-12 rounded-[2.5rem] border border-[#333] shadow-2xl text-center"
      >
        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 bg-[#222] rounded-3xl flex items-center justify-center text-white border border-[#333] shadow-lg">
            <LogIn size={40} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Login Page</h1>
        <p className="text-stone-500 mb-10 font-serif italic">CoreInventory Enterprise</p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-sm flex items-center justify-center space-x-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2 ml-1">Login Id</label>
            <input 
              required
              type="text" 
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-6 py-4 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="Enter your ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2 ml-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        
        <div className="mt-10 flex flex-col space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Link to="/forgot-password" title="Forget Password page" className="text-stone-400 hover:text-white transition-colors">Forget Password ?</Link>
            <span className="text-stone-700">|</span>
            <Link to="/signup" className="text-white hover:underline font-medium">Sign Up</Link>
          </div>
          
          <div className="pt-8 border-t border-[#222]">
            <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em] font-mono">Secure Access Terminal</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
