import { useState } from 'react';
import { authApi } from '../services/api';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type FlowStep = 'EMAIL' | 'OTP' | 'RESET';

export default function ForgotPassword() {
  const [step, setStep] = useState<FlowStep>('EMAIL');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setMessage('');
    try {
      await authApi.forgotPassword(email);
      setMessage('OTP has been sent to your email.');
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { data } = await authApi.verifyOtp(email, otp);
      setResetToken(data.resetToken);
      setStep('RESET');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true); setError(null);
    try {
      await authApi.resetPassword({ newPassword, resetToken });
      alert('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <KeyRound size={32} />
          </div>
        </div>
        
        {step === 'EMAIL' && (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Forgot Password</h1>
            <p className="text-slate-400 mb-8 font-medium">CoreInventory Management System</p>
            
            {message && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm flex items-center justify-center space-x-2"><CheckCircle2 size={18} /><span>{message}</span></div>}
            {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center justify-center space-x-2"><AlertCircle size={18} /><span>{error}</span></div>}

            <form onSubmit={handleRequestOtp} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="your@email.com" />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'PROCESSING...' : 'REQUEST OTP'}
              </button>
              <Link to="/login" className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                <ArrowLeft size={16} /><span>Back to Login</span>
              </Link>
            </form>
          </>
        )}

        {step === 'OTP' && (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Verify OTP</h1>
            <p className="text-slate-400 mb-8 font-medium">Enter code sent to {email}</p>
            
            {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center justify-center space-x-2"><AlertCircle size={18} /><span>{error}</span></div>}

            <form onSubmit={handleVerifyOtp} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">6-Digit Code</label>
                <input required type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-center text-3xl font-bold tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="000000" />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
              </button>
              <button onClick={() => setStep('EMAIL')} type="button" className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                <ArrowLeft size={16} /><span>Change Email</span>
              </button>
            </form>
          </>
        )}

        {step === 'RESET' && (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">New Password</h1>
            <p className="text-slate-400 mb-8 font-medium">Securing access for {email}</p>
            
            {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center justify-center space-x-2"><AlertCircle size={18} /><span>{error}</span></div>}

            <form onSubmit={handleResetPassword} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">New Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Confirm Password</label>
                <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••" />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'RESETTING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
