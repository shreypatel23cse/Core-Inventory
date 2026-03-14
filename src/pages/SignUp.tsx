import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { motion } from 'motion/react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface SignUpProps {
  onLogin: (profile: UserProfile) => void;
}

export default function SignUp({ onLogin }: SignUpProps) {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    const hasSmall = /[a-z]/.test(pass);
    const hasLarge = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasLength = pass.length >= 8 && pass.length <= 12;
    return hasSmall && hasLarge && hasSpecial && hasLength;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (loginId.length < 6 || loginId.length > 12) {
      setError('Login ID must be between 6-12 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must contain small case, large case, special character and length 8-12.');
      return;
    }

    setLoading(true);

    try {
      const userProfile = await authApi.signup(loginId, email, password, role);
      onLogin(userProfile);
      navigate('/');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-[2rem] border border-[#333] shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-[#222] rounded-2xl border border-[#333] text-white mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Sign up Page</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start space-x-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5 ml-1">Enter Login Id</label>
            <input 
              required
              type="text" 
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-5 py-3 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="6-12 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5 ml-1">Enter Email Id</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5 ml-1">Enter Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5 ml-1">Re-Enter Password</label>
            <input 
              required
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1.5 ml-1">Select Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-5 py-3 bg-[#222] border border-[#333] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 transition-all"
            >
              <option value="staff">Warehouse Staff</option>
              <option value="manager">Inventory Manager</option>
              <option value="viewer">Viewer / Auditor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline font-medium">SIGN IN</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
