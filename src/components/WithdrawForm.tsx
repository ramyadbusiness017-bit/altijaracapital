"use client";

import { useState } from 'react';
import { UploadSimple, Spinner, Info } from '@phosphor-icons/react/dist/ssr';
import { submitWithdrawal } from '@/app/actions/transactions';

export default function WithdrawForm({ availableCapital, availableEarnings }: { availableCapital: number, availableEarnings: number }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'withdrawal_earnings' | 'withdrawal_capital'>('withdrawal_earnings');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const maxAmount = type === 'withdrawal_earnings' ? availableEarnings : availableCapital;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!amount || isNaN(Number(amount))) return;

    try {
      setLoading(true);
      const res = await submitWithdrawal(type, Number(amount));
      setSuccess(res.message);
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleWithdraw}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <Info weight="fill" className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium tracking-wide">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 text-green-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <Info weight="fill" className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
          <p className="text-sm font-medium tracking-wide">{success}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => { setType('withdrawal_earnings'); setAmount(''); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            type === 'withdrawal_earnings' 
              ? 'bg-[#07351A]/5 border-[#07351A] ring-2 ring-[#07351A]/10' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Withdraw Earnings</p>
          <p className="text-lg font-bold text-[#07351A]">${availableEarnings.toFixed(2)}</p>
        </button>

        <button
          type="button"
          onClick={() => { setType('withdrawal_capital'); setAmount(''); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            type === 'withdrawal_capital' 
              ? 'bg-[#07351A]/5 border-[#07351A] ring-2 ring-[#07351A]/10' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Withdraw Capital</p>
          <p className="text-lg font-bold text-[#07351A]">${availableCapital.toFixed(2)}</p>
        </button>
      </div>

      <div className="mb-6 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          max={maxAmount}
          className="w-full pl-8 pr-20 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 outline-none focus:border-[#07351A] transition-all"
          placeholder="0.00"
          required
        />
        <button 
          type="button"
          onClick={() => setAmount(maxAmount.toString())}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#07351A] bg-[#07351A]/10 px-2 py-1 rounded-md hover:bg-[#07351A]/20 transition-colors"
        >
          MAX
        </button>
      </div>

      {type === 'withdrawal_earnings' && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm">
          <Info className="w-5 h-5 shrink-0 text-slate-400" />
          <p>
            Earnings are unlocked every <strong>7 days</strong>. Withdrawing earnings requires a live Ethereum network gas fee.
          </p>
        </div>
      )}

      {type === 'withdrawal_capital' && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm">
          <Info className="w-5 h-5 shrink-0 text-slate-400" />
          <p>
            Capital is strictly locked for <strong>30 days</strong> from investment. Early withdrawals are prohibited.
          </p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#07351A] text-white font-bold rounded-2xl hover:bg-[#052612] shadow-[0_4px_20px_rgba(7,53,26,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner className="w-5 h-5 animate-spin" /> : <UploadSimple weight="bold" className="w-5 h-5" />}
        {loading ? 'Processing...' : 'Confirm Withdrawal'}
      </button>
    </form>
  );
}
