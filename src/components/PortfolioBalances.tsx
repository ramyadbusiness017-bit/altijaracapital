"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Lock, Unlock, Zap } from 'lucide-react';

interface PortfolioBalancesProps {
  initialCapital: number;
  initialEarnings: number;
  lastYieldCalculation: string | null;
  investmentStartDate: string | null;
}

export default function PortfolioBalances({ 
  initialCapital, 
  initialEarnings, 
  lastYieldCalculation,
  investmentStartDate
}: PortfolioBalancesProps) {
  // Real-time Earnings state
  const [realtimeEarnings, setRealtimeEarnings] = useState<number>(initialEarnings);

  // The 30% weekly yield logic (real-time high frequency ticker)
  useEffect(() => {
    if (initialCapital <= 0 || !lastYieldCalculation) return;

    const SECONDS_IN_WEEK = 604800; // 7 * 24 * 60 * 60

    const calculateCurrentYield = () => {
      const lastCalcTime = new Date(lastYieldCalculation).getTime();
      const now = Date.now();
      const elapsedSeconds = (now - lastCalcTime) / 1000;

      if (elapsedSeconds < 0) return initialEarnings;
      const yieldEarned = initialCapital * 0.30 * (elapsedSeconds / SECONDS_IN_WEEK);
      return initialEarnings + yieldEarned;
    };

    setRealtimeEarnings(calculateCurrentYield());

    const interval = setInterval(() => {
      setRealtimeEarnings(calculateCurrentYield());
    }, 1000);

    return () => clearInterval(interval);
  }, [initialCapital, initialEarnings, lastYieldCalculation]);

  const formatTicker = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val);
  };

  const formatStandard = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      {/* Active Capital Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#07351A] border border-slate-100">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Active Capital</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
            30-Day Lock
          </span>
        </div>
        
        <div className="mb-8">
          <p className="text-4xl font-bold text-[#07351A] tracking-tight">
            {formatStandard(initialCapital)}
          </p>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Minimum required: $100.00
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/deposit" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#07351A] text-white text-sm font-bold rounded-xl hover:bg-[#052612] transition-colors">
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/dashboard/withdraw" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Real-time Earnings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#07351A]/5 rounded-xl flex items-center justify-center text-[#07351A] border border-[#07351A]/10">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Available Earnings</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-[#07351A]/5 text-[#07351A] rounded-lg">
            7-Day Unlock
          </span>
        </div>
        
        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-mono font-bold text-[#07351A] tracking-tight">
              {formatTicker(realtimeEarnings)}
            </p>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Generating 30% weekly yield in real-time
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/withdraw" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            <Unlock className="w-4 h-4" /> Withdraw Earnings
          </Link>
        </div>
      </div>

    </div>
  );
}
