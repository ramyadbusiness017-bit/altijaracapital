"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { loginAdmin } from '@/app/actions/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="p-8 bg-[#07351A] flex flex-col items-center justify-center text-center">
          <ShieldCheck weight="fill" className="w-16 h-16 text-[#0B913B] mb-4" />
          <h1 className="text-2xl font-serif font-bold text-white tracking-wider">Al-Tijara Command Center</h1>
          <p className="text-white/70 text-sm mt-2">Restricted Access. Authorized Personnel Only.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-bold text-center rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
            <input 
              name="username"
              type="text" 
              required
              autoFocus
              placeholder="Enter admin username"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07351A] focus:border-transparent transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07351A] focus:border-transparent transition-all font-medium text-slate-800"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#07351A] hover:bg-[#106E37] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><CircleNotch className="w-5 h-5 animate-spin" /> Authenticating...</> : 'Access System'}
          </button>
        </form>

      </div>
    </div>
  );
}
