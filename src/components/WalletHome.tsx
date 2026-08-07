"use client";

import { useState, useEffect } from 'react';
import { 
  Wallet,
  Lightning,
  CheckCircle,
  TrendUp
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface WalletHomeProps {
  firstName: string;
  userId: string;
  initialCapital: number;
  initialEarnings: number;
  walletBalance: number;
  ethBalance: number;
  lastYieldCalculation: string | null;
  investmentStartDate: string | null;
  transactions: any[];
  notifications: any[];
  earningsPermitted: boolean;
  capitalPermitted: boolean;
}

export default function WalletHome({ 
  firstName, 
  initialCapital, 
  initialEarnings,
  walletBalance,
  ethBalance,
  lastYieldCalculation,
  investmentStartDate,
  notifications
}: WalletHomeProps) {
  const router = useRouter();
  const [realtimeEarnings, setRealtimeEarnings] = useState<number>(initialEarnings);
  const [daysElapsed, setDaysElapsed] = useState<number>(0);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('--h --m');
  const [earningsToday, setEarningsToday] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(3000);

  useEffect(() => {
    if (initialCapital <= 0 || !lastYieldCalculation || !investmentStartDate) return;
    const SECONDS_IN_WEEK = 604800;
    
    const updateStats = () => {
      const SECONDS_IN_MONTH = 30 * 86400;

      const start = new Date(investmentStartDate).getTime();
      const now = Date.now();
      const totalElapsedSecs = Math.max(0, (now - start) / 1000);

      const activeElapsedSecs = Math.min(totalElapsedSecs, SECONDS_IN_MONTH);
      const days = Math.floor(activeElapsedSecs / 86400);
      setDaysElapsed(days);

      const lastCalc = new Date(lastYieldCalculation).getTime();
      const lastCalcElapsedSinceStart = Math.min(Math.max(0, (lastCalc - start) / 1000), SECONDS_IN_MONTH);
      const deltaSecs = activeElapsedSecs - lastCalcElapsedSinceStart;
      
      if (deltaSecs > 0) {
        setRealtimeEarnings(initialEarnings + (initialCapital * 0.30 * (deltaSecs / SECONDS_IN_WEEK)));
      } else {
        setRealtimeEarnings(initialEarnings);
      }

      if (days >= 30) {
        setEarningsToday(0);
        setTimeUntilNext('Matured');
      } else {
        setEarningsToday(initialCapital * (0.30 / 7));

        let nextPayoutDay = Math.ceil(totalElapsedSecs / 86400 / 7) * 7;
        if (nextPayoutDay === 0) nextPayoutDay = 7;
        if (nextPayoutDay > 30) nextPayoutDay = 30;
        
        const secondsUntilNext = (nextPayoutDay * 86400) - totalElapsedSecs;
        if (secondsUntilNext > 0) {
          const h = Math.floor(secondsUntilNext / 3600);
          const m = Math.floor((secondsUntilNext % 3600) / 60);
          setTimeUntilNext(`${h}h ${m}m`);
        }
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 100);
    return () => clearInterval(interval);
  }, [initialCapital, initialEarnings, lastYieldCalculation, investmentStartDate]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await res.json();
        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd);
        }
      } catch (e) {
        console.error("Failed to fetch eth price:", e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const cycleProgress = initialCapital > 0 ? Math.min((daysElapsed / 30) * 100, 100) : 0;
  const isMatured = daysElapsed >= 30;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto flex flex-col pt-6 pb-32 px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 min-h-screen"
    >
      <motion.div variants={fadeInItem} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
        
        {/* Primary Stat Card */}
        <div className="lg:col-span-1 w-full h-full bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30 transition-all hover:-translate-y-1 group min-h-[180px]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none group-hover:bg-[#D4AF37]/20 transition-all"></div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#D4AF37]" weight="duotone" /> Total Portfolio
            </h3>
            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md break-all">
              {formatCurrency(initialCapital + realtimeEarnings + walletBalance + (ethBalance * ethPrice))}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-6 relative z-10">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest">Across all assets</span>
            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37] animate-pulse"></div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-5 w-full h-full">
          {/* Invested Capital */}
          <div className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1 h-full">
            <div className="relative z-10">
              <h3 className="text-[10px] sm:text-xs font-bold text-[#8B949E] mb-1 sm:mb-2 uppercase tracking-widest">Invested Capital</h3>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-all">{formatCurrency(initialCapital)}</h2>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-6 relative z-10">
              <div className={`px-2 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${initialCapital > 0 ? (isMatured ? 'bg-white/10 text-white' : 'bg-[#22C55E]/10 text-[#22C55E]') : 'bg-white/5 text-[#8B949E]'}`}>
                {initialCapital > 0 ? (isMatured ? 'Matured' : 'Active') : 'No Active'}
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden hover:border-[#22C55E]/30 transition-all hover:-translate-y-1 group h-full">
            <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <h3 className="text-[10px] sm:text-xs font-bold text-[#8B949E] mb-1 sm:mb-2 uppercase tracking-widest">Total Earnings</h3>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#22C55E] tracking-tight drop-shadow-md break-all">{formatCurrency(realtimeEarnings)}</h2>
            </div>
            <div className="flex items-center justify-between mt-4 sm:mt-6 relative z-10">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline-block text-[9px] sm:text-xs font-bold text-[#8B949E]">ALL TIME</span>
                <span className="text-[9px] font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-widest">Synced</span>
              </div>
            </div>
          </div>

          {/* Earnings Today (Spans 2 cols) */}
          <div className="col-span-2 bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center relative hover:border-white/20 transition-all hover:-translate-y-1 h-full">
            <div>
              <h3 className="text-[10px] sm:text-xs font-bold text-[#8B949E] mb-1 sm:mb-2 uppercase tracking-widest">Earnings Today</h3>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-all">+{formatCurrency(earningsToday)}</h2>
            </div>
            <div className="flex items-center mt-2 sm:mt-0 lg:mt-6 gap-1.5 sm:gap-2">
              <TrendUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#22C55E]" weight="bold" />
              <span className="text-[11px] sm:text-xs font-bold text-[#22C55E]">4.28%</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8B949E] uppercase tracking-widest">daily drip</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInItem} className="w-full bg-[#0D1117]/60 backdrop-blur-3xl border border-[#D4AF37]/20 rounded-[1.5rem] md:rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#D4AF37]/5 rounded-[100%] blur-[100px] pointer-events-none"></div>

        <div className="flex-1 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-6">
            <div className={`w-2 h-2 rounded-full ${initialCapital > 0 ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest">
              {initialCapital > 0 ? 'Active Yield Engine' : 'Awaiting Capital'}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
            {initialCapital > 0 ? 'Generating Returns' : 'Start Earning Today'}
          </h2>
          <p className="text-[13px] md:text-sm font-medium text-[#8B949E] max-w-md mb-6 mx-auto lg:mx-0 leading-relaxed">
            {initialCapital > 0 
              ? 'Your deployed capital is actively working in the algorithmic pool. Earnings are automatically distributed every 7 days.' 
              : 'Deploy capital into the high-yield algorithmic pool to start earning consistent, automated returns.'}
          </p>

          <div className="grid grid-cols-2 gap-4 md:gap-8 border-t border-white/5 pt-8">
            <div>
              <p className="text-[11px] font-bold text-[#8B949E] uppercase tracking-widest mb-1">Investment Date</p>
              <p className="text-base md:text-lg font-extrabold text-white">
                {investmentStartDate ? new Date(investmentStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#8B949E] uppercase tracking-widest mb-1">Next Payout</p>
              <p className="text-base md:text-lg font-extrabold text-[#D4AF37]">{timeUntilNext}</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mt-4 lg:mt-0">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="currentColor"
              className="text-white/5"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="currentColor"
              className="text-[#D4AF37] transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}%`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - (cycleProgress / 100))}%`}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none mix-blend-screen">
              {isMatured ? (
                <CheckCircle className="w-32 h-32 md:w-48 md:h-48 text-[#D4AF37]" weight="fill" />
              ) : (
                <Lightning className="w-32 h-32 md:w-48 md:h-48 text-[#D4AF37]" weight="duotone" />
              )}
            </div>
            <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md z-10 mt-2">
              {daysElapsed}
            </span>
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest mt-1 z-10">Days / 30</span>
          </div>
        </div>

      </motion.div>

    </motion.div>
  );
}
