'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell,
  ShieldCheck,
  Coins,
  Check,
  Info,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  ArrowRight,
  CircleNotch,
  Briefcase,
  LockKey,
  X,
  CheckCircle,
  FileText,
  ChartLineUp
} from '@phosphor-icons/react/dist/ssr';
import { withdrawEarnings, reinvestCapital, withdrawCapital, deployCapital } from '@/app/actions/wallet';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface InvestmentsHomeProps {
  userId: string;
  capitalBalance: number;
  earningsBalance: number;
  investmentStartDate: string | null;
  lastYieldCalculation: string | null;
  earningsPermitted: boolean;
  capitalPermitted: boolean;
  walletBalance: number;
  transactions: any[];
}

export default function InvestmentsHome({
  userId,
  capitalBalance,
  earningsBalance,
  investmentStartDate,
  lastYieldCalculation,
  earningsPermitted,
  capitalPermitted,
  walletBalance,
  transactions
}: InvestmentsHomeProps) {
  const router = useRouter();
  const [realtimeEarnings, setRealtimeEarnings] = useState<number>(earningsBalance);
  const [daysCompleted, setDaysCompleted] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const investmentTiers = [100, 150, 1000, 1500, 10000, 15000, 100000, 150000, 1000000, 15000000];

  const handleDeployCapital = async () => {
    setErrorMsg('');
    const amountToDeploy = selectedTier || parseFloat(customAmount || '0');
    
    if (amountToDeploy <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    
    if (amountToDeploy > walletBalance) {
      setErrorMsg('Insufficient wallet balance. Please deposit funds first.');
      return;
    }

    try {
      setIsDeploying(true);
      await deployCapital(amountToDeploy);
      setShowDeployModal(false);
      setSelectedTier(null);
      setCustomAmount('');
      toast.success('Capital deployed successfully');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to deploy capital');
      toast.error(error.message || 'Failed to deploy capital');
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    if (capitalBalance <= 0 || !investmentStartDate) return;

    const SECONDS_IN_WEEK = 604800;
    const startObj = new Date(investmentStartDate).getTime();
    
    const calculateState = () => {
      const now = Date.now();
      
      const elapsedTotalDays = (now - startObj) / (1000 * 60 * 60 * 24);
      setDaysCompleted(Math.min(Math.max(elapsedTotalDays, 0), 30));

      const lastCalc = lastYieldCalculation ? new Date(lastYieldCalculation).getTime() : startObj;
      const elapsedSinceLastCalc = (now - lastCalc) / 1000;
      if (elapsedSinceLastCalc > 0) {
        setRealtimeEarnings(earningsBalance + (capitalBalance * 0.30 * (elapsedSinceLastCalc / SECONDS_IN_WEEK)));
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000);
    return () => clearInterval(interval);
  }, [capitalBalance, earningsBalance, investmentStartDate, lastYieldCalculation]);

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);
      await withdrawEarnings();
      toast.success('Earnings withdrawn to wallet');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw earnings');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawCapitalAction = async () => {
    try {
      setIsProcessing(true);
      await withdrawCapital();
      toast.success('Capital withdrawn to wallet');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw capital');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReinvest = async () => {
    try {
      setIsProcessing(true);
      await reinvestCapital();
      toast.success('Earnings reinvested successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reinvest capital');
    } finally {
      setIsProcessing(false);
    }
  };

  const isAutoWindowOpen = () => {
    if (!investmentStartDate) return false;
    const startObj = new Date(investmentStartDate).getTime();
    const lastCalc = lastYieldCalculation ? new Date(lastYieldCalculation).getTime() : startObj;
    
    const milestones = [7, 14, 21, 28];
    const currentDay = daysCompleted;
    
    for (let milestone of milestones) {
      if (currentDay >= milestone) {
        const milestoneDate = startObj + (milestone * 24 * 60 * 60 * 1000);
        if (lastCalc < milestoneDate) {
          return true;
        }
      }
    }
    return false;
  };

  const isWithdrawalAllowed = earningsPermitted || isAutoWindowOpen();
  const hasActiveInvestment = capitalBalance > 0 && investmentStartDate;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Awaiting Deposit';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
  };

  const percentage = Math.min((daysCompleted / 30) * 100, 100);
  
  const dailyYieldRate = 4.285;
  const todaysEarnings = hasActiveInvestment ? capitalBalance * (dailyYieldRate / 100) : 0; 
  
  const startDateMs = investmentStartDate ? new Date(investmentStartDate).getTime() : null;
  const day7Date = startDateMs ? startDateMs + (7 * 24 * 60 * 60 * 1000) : null;
  const day14Date = startDateMs ? startDateMs + (14 * 24 * 60 * 60 * 1000) : null;
  const day21Date = startDateMs ? startDateMs + (21 * 24 * 60 * 60 * 1000) : null;
  const day28Date = startDateMs ? startDateMs + (28 * 24 * 60 * 60 * 1000) : null;

  const getTimelineNodeState = (targetDay: number) => {
    if (!hasActiveInvestment) return 'locked';
    if (daysCompleted >= targetDay) return 'completed';
    if (daysCompleted >= targetDay - 7) return 'active';
    return 'pending';
  };

  const renderNode = (day: number, label: string, dateMs: number | null) => {
    const state = getTimelineNodeState(day);
    return (
      <div className="relative z-10 flex flex-col items-center w-full group">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 border-4
          ${state === 'completed' ? 'bg-[#0D1117] border-[#22C55E] text-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
            state === 'active' ? 'bg-[#0D1117] border-[#22C55E] text-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse' : 
            state === 'locked' ? 'bg-[#0D1117] border-[#1A1F26] text-white/10' :
            'bg-[#0D1117] border-[#1A1F26] text-[#8B949E]'}`}
        >
          <span className="text-xs md:text-sm font-extrabold">{day / 7}</span>
        </div>
        <div className="text-center mt-4">
          <p className={`text-[10px] md:text-sm font-bold transition-colors ${state === 'completed' || state === 'active' ? 'text-white' : 'text-[#8B949E] group-hover:text-white/70'}`}>{label}</p>
          <p className="text-[9px] md:text-xs text-[#8B949E] mt-1 font-medium">{formatDate(dateMs)}</p>
        </div>
      </div>
    );
  };

  const chartData = [
    { value: 10 }, { value: 20 }, { value: 15 }, { value: 35 }, { value: 25 }, { value: 50 }, { value: 40 }, { value: 65 }, { value: 80 }
  ];

  if (hasActiveInvestment && (daysCompleted >= 30 || capitalPermitted)) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-6 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0D1117]/80 backdrop-blur-xl border border-[#22C55E]/30 rounded-[1.5rem] sm:rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden mt-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="w-24 h-24 bg-[#22C55E]/10 rounded-full flex items-center justify-center border border-[#22C55E]/40 mb-6 relative z-10 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <Check className="w-12 h-12 text-[#22C55E] font-bold" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 relative z-10 drop-shadow-lg">
            Investment Cycle Complete
          </h2>
          <p className="text-[#8B949E] font-medium text-lg max-w-2xl mb-8 relative z-10">
            Congratulations. Your investment cycle has reached maturity. Your principal capital of <span className="text-white font-bold">{formatCurrency(capitalBalance)}</span> is now unlocked and available.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md relative z-10">
            {capitalPermitted ? (
              <button 
                disabled={isProcessing}
                onClick={handleWithdrawCapitalAction}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                Withdraw Capital
              </button>
            ) : (
              <button 
                disabled
                className="flex-1 py-4 bg-white/5 border border-white/10 text-[#8B949E] font-extrabold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LockKey className="w-5 h-5" /> Locked
              </button>
            )}
            <button 
              disabled={isProcessing}
              onClick={handleReinvest}
              className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black font-extrabold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2 active:scale-95"
            >
              {isProcessing ? <CircleNotch className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" weight="fill" />} Reinvest Capital
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-6 min-h-screen"
    >
      
      {/* Top Header - Invest More Button */}
      <div className="flex justify-end relative z-10">
        <button 
          onClick={() => setShowDeployModal(true)}
          className="bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black font-extrabold rounded-xl px-6 py-2.5 transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] active:scale-95 text-sm group"
        >
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" weight="bold" /> Invest More
        </button>
      </div>

      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Investment */}
          <motion.div 
            variants={fadeInItem}
            className="bg-[#0D1117]/90 backdrop-blur-xl border border-[#1A1F26] hover:border-[#2A313C] transition-colors duration-300 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[220px]"
          >
            {/* Subtle glow behind the card content */}
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Bar Chart Background on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 pointer-events-none pr-4 pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <Bar dataKey="value" fill="url(#goldGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_5px_#D4AF37]" /> Active Investment
              </h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md truncate">
                  {formatCurrency(capitalBalance)}
                </h2>
                {hasActiveInvestment && <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-[#22C55E] drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" weight="fill" />}
              </div>
              {hasActiveInvestment ? (
                <>
                  <p className="text-[#22C55E] text-sm font-bold mt-2 tracking-wide">Generating Returns</p>
                  <div className="mt-4 bg-[#1A1F26]/80 backdrop-blur-md border border-white/5 rounded-full px-4 py-1.5 w-fit shadow-inner">
                    <p className="text-[#8B949E] text-xs font-medium">Day <span className="text-white font-bold">{Math.floor(daysCompleted)}</span> of 30</p>
                  </div>
                </>
              ) : (
                 <p className="text-[#8B949E] text-sm font-medium mt-4">Awaiting Capital Deployment</p>
              )}
            </div>
          </motion.div>
          
          {/* Earnings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={fadeInItem} className="bg-[#0D1117]/90 backdrop-blur-xl border border-[#1A1F26] hover:border-[#2A313C] transition-colors duration-300 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <ShieldCheck className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-1">Today's Earnings</p>
                <p className="text-xl sm:text-2xl font-extrabold text-[#22C55E] drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]">+{formatCurrency(todaysEarnings)}</p>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInItem} className="bg-[#0D1117]/90 backdrop-blur-xl border border-[#1A1F26] hover:border-[#2A313C] transition-colors duration-300 rounded-2xl p-6 flex items-center gap-4 shadow-xl justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  <Coins className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-1">Total Earnings</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md">{formatCurrency(realtimeEarnings)}</p>
                </div>
              </div>
              
              <button 
                onClick={handleWithdraw}
                disabled={isProcessing || !isWithdrawalAllowed || realtimeEarnings <= 0}
                title={isWithdrawalAllowed ? "Withdraw Earnings" : "Earnings locked until payout window"}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                  isWithdrawalAllowed && realtimeEarnings > 0
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.2)] active:scale-95'
                    : 'bg-white/5 border border-white/5 text-[#8B949E] cursor-not-allowed opacity-70'
                }`}
              >
                {isProcessing ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : isWithdrawalAllowed ? (
                  <>Withdraw <ArrowDownLeft className="w-4 h-4" weight="bold" /></>
                ) : (
                  <><LockKey className="w-4 h-4" weight="bold" /> Locked</>
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right Column (Span 4) - Cycle Ring */}
        <motion.div variants={fadeInItem} className="lg:col-span-4 bg-[#0D1117]/90 backdrop-blur-xl border border-[#1A1F26] hover:border-[#2A313C] transition-colors duration-300 rounded-2xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden min-h-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-[40px] pointer-events-none" />

          <h3 className="text-sm font-bold text-white mb-8 relative z-10 tracking-wide">30-Day Investment Cycle</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center z-10 mb-8">
            {/* SVG Circle Progress */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="44" className="text-[#1A1F26]" strokeWidth="4" fill="none" stroke="currentColor" />
              <circle 
                cx="50" cy="50" r="44" 
                className="text-[#22C55E] transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" 
                strokeWidth="6" fill="none" stroke="currentColor" 
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * percentage) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10 bg-[#0D1117]/50 rounded-full w-[80px] h-[80px] backdrop-blur-sm border border-white/5 shadow-inner">
              <span className="text-3xl font-extrabold text-white leading-none drop-shadow-md">{Math.floor(daysCompleted)}<span className="text-[#8B949E] text-sm font-bold ml-0.5">/30</span></span>
              <span className="text-[9px] text-[#8B949E] uppercase tracking-widest mt-1.5 font-bold">Days</span>
            </div>
          </div>
          
          <p className={`text-sm font-bold mt-auto relative z-10 tracking-wide ${hasActiveInvestment ? 'text-[#22C55E] drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'text-[#8B949E]'}`}>
            {percentage.toFixed(0)}% Complete
          </p>
        </motion.div>

      </div>

      {/* Timeline (4-Week Cyclical) */}
      <motion.div 
        variants={fadeInItem}
        className="bg-[#0D1117]/90 backdrop-blur-xl border border-[#1A1F26] hover:border-[#2A313C] transition-colors duration-300 rounded-2xl p-5 sm:p-6 md:p-10 shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="mb-8 md:mb-12">
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white mb-1 tracking-wide">Investment Timeline</h3>
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[#8B949E]">Track your 30-day lifecycle and payout windows</p>
        </div>
        
        <div className="w-full relative flex justify-between items-start mt-4 px-2 md:px-0">
          {/* Connecting Line background */}
          <div className="absolute top-5 md:top-6 left-8 right-8 h-1 bg-[#1A1F26] z-0 rounded-full hidden sm:block shadow-inner"></div>
          
          {/* Active Connecting Line with gradient and glow */}
          <div 
            className="absolute top-5 md:top-6 left-8 h-1 z-0 transition-all duration-1000 rounded-full hidden sm:block bg-gradient-to-r from-[#22C55E] to-[#10B981] shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            style={{ width: `calc(${Math.min((daysCompleted / 28) * 100, 100)}% - 64px)` }}
          ></div>

          {/* Nodes */}
          {renderNode(7, "Day 7 Payout", day7Date)}
          {renderNode(14, "Day 14 Payout", day14Date)}
          {renderNode(21, "Day 21 Payout", day21Date)}
          {renderNode(28, "Day 28 Payout", day28Date)}
        </div>
      </motion.div>

      {/* Deploy Capital Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070A0D]/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0D1117] border border-[#1C2128] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="p-8 border-b border-[#1C2128] flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide">Select Investment Tier</h3>
                <p className="text-[11px] font-bold text-[#8B949E] uppercase tracking-widest mt-2">Choose an amount to deploy into the yield engine.</p>
              </div>
              <button 
                onClick={() => setShowDeployModal(false)} 
                disabled={isDeploying} 
                className="p-2.5 text-[#8B949E] hover:text-white rounded-full hover:bg-white/5 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar relative z-10">
              {errorMsg && (
                <div className="p-4 mb-6 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-3">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {investmentTiers.map(tier => (
                  <button
                    key={tier}
                    onClick={() => {
                      setSelectedTier(tier);
                      setCustomAmount('');
                    }}
                    className={`py-3.5 rounded-xl border-2 font-mono font-bold text-sm transition-all duration-300 active:scale-95 ${
                      selectedTier === tier 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                        : 'border-[#1C2128] bg-white/5 text-[#8B949E] hover:border-white/20 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    ${tier.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[#1C2128]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#0D1117] text-[10px] font-extrabold text-[#8B949E] uppercase tracking-widest border border-[#1C2128] rounded-full py-1.5 shadow-sm">
                    Or Custom Amount
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative group">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-mono text-lg transition-colors duration-300 ${customAmount ? 'text-[#D4AF37]' : 'text-[#8B949E]'}`}>$</span>
                  <input
                    type="number"
                    min="0"
                    value={customAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < 0) return; // Prevent negative values
                      setCustomAmount(e.target.value);
                      setSelectedTier(null);
                    }}
                    placeholder="Enter custom amount"
                    className={`w-full pl-10 pr-5 py-4 rounded-xl border-2 font-mono text-lg transition-all duration-300 focus:outline-none bg-[#070A0D] shadow-inner ${
                      customAmount ? 'border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-[#1C2128] text-white focus:border-white/30 group-hover:border-white/20'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#161B22]/60 backdrop-blur-md border-t border-[#1C2128] flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-1.5">Available Wallet Balance</span>
                <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-sm">{formatCurrency(walletBalance)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-auto gap-4">
                <button 
                  onClick={handleDeployCapital}
                  disabled={(!selectedTier && !customAmount) || isDeploying || ((selectedTier || parseFloat(customAmount || '0')) > walletBalance) || ((selectedTier || parseFloat(customAmount || '0')) <= 0)}
                  className={`w-full sm:w-auto px-10 py-4 font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-wider ${
                    ((selectedTier || parseFloat(customAmount || '0')) > walletBalance)
                      ? 'bg-white/5 border border-white/10 text-[#8B949E] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isDeploying ? (
                    <><CircleNotch className="w-5 h-5 animate-spin" weight="bold" /> Deploying...</>
                  ) : ((selectedTier || parseFloat(customAmount || '0')) > walletBalance) ? (
                    <><LockKey className="w-5 h-5" weight="bold" /> Insufficient</>
                  ) : (
                    <><ArrowUpRight className="w-5 h-5" weight="bold" /> Deploy Capital</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
