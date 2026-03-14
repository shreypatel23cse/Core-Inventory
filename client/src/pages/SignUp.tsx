import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SignUp({ setUser }: { setUser: any }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const resp = await authApi.signup(data);
      localStorage.setItem('token', resp.data.token);
      setUser(resp.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
          <h2 className="text-3xl font-black text-[var(--foreground)] mb-1 tracking-tight">Create Account</h2>
          <p className="text-[var(--muted-foreground)] font-serif italic text-sm">Join the CoreInventory Enterprise</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Full Name</label>
            <input 
              {...register('name', { required: true })} 
              className="w-full px-5 py-3.5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[var(--foreground)] placeholder:[var(--muted-foreground)]/50" 
              placeholder="Your Name" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Email ID</label>
            <input 
              type="email" 
              {...register('email', { required: true })} 
              className="w-full px-5 py-3.5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[var(--foreground)] placeholder:[var(--muted-foreground)]/50" 
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              {...register('password', { required: true })} 
              className="w-full px-5 py-3.5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[var(--foreground)] placeholder:[var(--muted-foreground)]/50" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)] font-medium">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline transition-all">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
