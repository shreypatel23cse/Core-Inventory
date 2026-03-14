import { useState } from 'react';
import { authApi } from '../services/api';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] p-10 rounded-[2.5rem] border border-[#333] shadow-2xl text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-[#222] rounded-2xl flex items-center justify-center text-white border border-[#333]">
            <KeyRound size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Forget Password</h1>
        <p className="text-stone-500 mb-8 font-serif italic">Enter your email to reset your access.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-center justify-center space-x-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-900/20 border border-emerald-900/50 rounded-2xl text-emerald-400 text-sm flex flex-col items-center space-y-3">
              <CheckCircle2 size={32} />
              <p className="font-medium">Reset link sent! Check your inbox.</p>
            </div>
            <Link 
              to="/login" 
              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2 ml-1">Email Address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>

            <Link 
              to="/login" 
              className="w-full flex items-center justify-center space-x-2 text-stone-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
