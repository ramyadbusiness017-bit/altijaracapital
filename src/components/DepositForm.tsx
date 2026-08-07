"use client";

import { useState } from 'react';
import { DownloadSimple, Spinner } from '@phosphor-icons/react/dist/ssr';
import { submitDeposit } from '@/app/actions/transactions';

export default function DepositForm() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      // We log a pending transaction with 0 amount. Admin verifies blockchain and credits.
      const res = await submitDeposit(0);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDeposit} className="max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium tracking-wide">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 font-medium tracking-wide">
          {success}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading || !!success} 
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#07351A] text-white font-bold rounded-2xl hover:bg-[#052612] shadow-[0_4px_20px_rgba(7,53,26,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner className="w-5 h-5 animate-spin" /> : <DownloadSimple weight="bold" className="w-5 h-5" />}
        {loading ? 'Processing...' : (success ? 'Deposit Logged' : "I've Deposited")}
      </button>
    </form>
  );
}
