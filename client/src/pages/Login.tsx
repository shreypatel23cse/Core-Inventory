import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Github, Chrome, ShieldCheck } from 'lucide-react';

export default function Login({ setUser }: { setUser: any }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Animation states
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await authApi.login(data);
      localStorage.setItem('token', resp.data.token);
      setUser(resp.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Panel: Form */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 transition-all duration-1000 transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
        
        <div className="max-w-md w-full mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">CoreInventory</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Secure Login</h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest leading-relaxed">
              Global Warehouse Management & <br/> Real-time Operations Console.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-8 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  {...register('email', { required: true })} 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder="admin@coreinventory.com" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication Secret</label>
                <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">Recover Access?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password', { required: true })} 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
               <span className={`transition-all duration-300 ${isLoading ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>Authorize Session</span>
               {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
               
               {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
                 </div>
               )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-10 flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-slate-100" />
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Digital ID Passport</span>
             <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Chrome size={18} />
                <span className="text-xs uppercase tracking-widest">Google SSO</span>
             </button>
             <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Github size={18} />
                <span className="text-xs uppercase tracking-widest">GitHub ID</span>
             </button>
          </div>

          <p className="mt-12 text-center text-sm font-bold text-slate-400">
            System account missing? <Link to="/signup" className="text-indigo-600 font-black hover:underline ml-1">Request Node Access</Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-auto py-10 flex justify-between items-center border-t border-slate-50 hidden lg:flex">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Core OS v2.4.0</p>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Encrypted / ISO-27001</p>
        </div>
      </div>

      {/* Right Panel: Dynamic Brand/Visual */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute inset-0 z-0">
            <img 
               src="/login_dashboard_graphic.png" 
               className={`w-full h-full object-cover opacity-60 transition-all duration-[3000ms] transform ${mounted ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`} 
               alt="Digital Logistics Illustration" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-transparent" />
         </div>

         {/* Content Overlays */}
         <div className="absolute inset-x-0 bottom-0 p-20 z-10">
            <div className={`transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
               <div className="flex items-center gap-4 mb-6">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">System Status: Online</div>
                  <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                     All Warehouses Syncing
                  </div>
               </div>
               <h3 className="text-5xl font-black text-white tracking-widest mb-4">OPTIMIZE EVERY<br/>MOVEMENT.</h3>
               <p className="text-white/50 font-bold text-sm max-w-sm leading-relaxed">
                  High-performance inventory management designed for modern logistics. Track, transfer, and fulfill with millisecond precision.
               </p>
               
               <div className="mt-12 flex items-center gap-8">
                  <div className="text-white">
                     <p className="text-4xl font-black tracking-tighter leading-none">99.9%</p>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Up-time SLA</p>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10" />
                  <div className="text-white">
                     <p className="text-4xl font-black tracking-tighter leading-none">1.2M+</p>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Daily Items</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Animated Grid Pattern */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>
    </div>
  );
}
