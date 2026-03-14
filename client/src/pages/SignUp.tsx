import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Chrome, Github } from 'lucide-react';
import Loader from '../components/Loader';

export default function SignUp({ setUser }: { setUser: any }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await authApi.signup(data);
      // Success - show specialized loader
      setShowLoader(true);

      setTimeout(() => {
        localStorage.setItem('token', resp.data.token);
        setUser(resp.data.user);
        navigate('/');
      }, 5000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Account Registration Failed');
      setIsLoading(false);
    }
  };

  if (showLoader) return <Loader />;

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Visual Panel (Left on SignUp) */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img 
               src="/login_dashboard_graphic.png" 
               className={`w-full h-full object-cover opacity-60 grayscale transition-all duration-[3000ms] transform ${mounted ? 'scale-100 rotate-0' : 'scale-110 -rotate-1'}`} 
               alt="Digital Logistics Illustration" 
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-950 via-slate-900/60 to-transparent" />
         </div>

         {/* Content Overlays */}
         <div className="absolute inset-x-0 bottom-0 p-20 z-10">
            <div className={`transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
               <h3 className="text-5xl font-black text-white tracking-widest mb-4">SCALE YOUR<br/>LOGISTICS.</h3>
               <p className="text-white/50 font-bold text-sm max-w-sm leading-relaxed mb-12">
                  Enterprise-grade infrastructure for inventory control. Trusted by thousands of warehouse managers worldwide.
               </p>
               
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-white/80">01</div>
                     <p className="text-white font-bold text-sm">Real-time Stock Ledger Tracking</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-white/80">02</div>
                     <p className="text-white font-bold text-sm">Multi-Warehouse Coordination</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-white/80">03</div>
                     <p className="text-white font-bold text-sm">Automated Operational Workflow</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Form Panel (Right on SignUp) */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 transition-all duration-1000 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
        
        <div className="max-w-md w-full mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-10">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">CoreInventory</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Create Account</h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic">Join the next generation of inventory control.</p>
          </div>

          {error && (
            <div className="p-4 mb-8 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  {...register('name', { required: true })} 
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 shadow-sm"
                  placeholder="Manager Full Name" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  {...register('email', { required: true })} 
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 shadow-sm"
                  placeholder="admin@enterprise.com" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Configuration</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  {...register('password', { required: true })} 
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 shadow-sm"
                  placeholder="Set Secure Password" 
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
               {isLoading ? 'Deploying Node...' : 'Initialize Enterprise Account'}
               {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Social */}
          <div className="mt-8 grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Chrome size={18} />
                <span className="text-[10px] uppercase font-black">Google Identity</span>
             </button>
             <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Github size={18} />
                <span className="text-[10px] uppercase font-black">GitHub ID</span>
             </button>
          </div>

          <p className="mt-10 text-center text-sm font-bold text-slate-400">
            Already registered? <Link to="/login" className="text-indigo-600 font-black hover:underline transform hover:scale-105 transition-all inline-block ml-1">Return to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
