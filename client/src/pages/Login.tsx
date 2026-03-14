import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login({ setUser }: { setUser: any }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const resp = await authApi.login(data);
      localStorage.setItem('token', resp.data.token);
      setUser(resp.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-10 md:p-12 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
             <img src="/assets/logo.png" alt="CoreInventory Logo" className="w-24 h-24 object-contain dark:invert relative z-10 p-2" />
          </div>
          <h2 className="text-3xl font-black text-[var(--foreground)] mb-1 tracking-tight">Welcome Back</h2>
          <p className="text-[var(--muted-foreground)] font-serif italic text-sm">CoreInventory Enterprise</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 mb-6 bg-red-500/10 text-red-500 rounded-2xl text-sm font-medium border border-red-500/20 flex items-center gap-2"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Login ID / Email</label>
            <input 
              type="email" 
              {...register('email', { required: true })} 
              className="w-full px-5 py-3.5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[var(--foreground)] placeholder:[var(--muted-foreground)]/50" 
              placeholder="name@company.com" 
              defaultValue="shreypatel4307@gmail.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Password</label>
            </div>
            <input 
              type="password" 
              {...register('password', { required: true })} 
              className="w-full px-5 py-3.5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[var(--foreground)] placeholder:[var(--muted-foreground)]/50" 
              placeholder="••••••••" 
              defaultValue="shrey@1008"
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link to="/forgot-password" opacity-60 hover:opacity-100 transition-opacity className="text-xs text-[var(--muted-foreground)] font-bold">Forgot Password?</Link>
          <div className="pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--muted-foreground)] font-medium">
              New to CoreInventory? <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
