import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login({ setUser }: { setUser: any }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const resp = await authApi.login(data);
      localStorage.setItem('token', resp.data.token);
      setUser(resp.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500 mb-8 font-medium">CoreInventory Management System</p>
        
        {error && <div className="p-4 mb-6 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium border border-rose-100">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Email Address</label>
            <input type="email" {...register('email', { required: true })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="name@company.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Password</label>
            <input type="password" {...register('password', { required: true })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 transform active:scale-[0.98]">
            Sign In to Dashboard
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium">
          Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
