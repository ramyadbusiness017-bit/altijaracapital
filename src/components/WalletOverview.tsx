"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell,
  DownloadSimple, 
  UploadSimple, 
  ArrowsLeftRight,
  Eye,
  EyeSlash,
  X,
  Copy,
  CheckCircle,
  CircleNotch,
  TrendUp,
  TrendDown,
  CaretDown,
  Wallet,
  Warning,
  Info,
  LockKey,
  FileText,
  Bag,
  Gift,
  Briefcase,
  ArrowDownLeft,
  ArrowUpRight,
  ChartLineUp,
  Star
} from '@phosphor-icons/react/dist/ssr';
import { requestWithdrawal, notifyDeposit } from '@/app/actions/wallet';
import Link from 'next/link';

interface WalletOverviewProps {
  firstName: string;
  userId: string;
  walletBalance: number;
  ethBalance: number;
  walletAddress: string | null;
  transactions: any[];
  initialEthPrice: number;
  initialEthChange: number;
  initialUsdtPrice: number;
  blockGasFees?: boolean;
}

export default function WalletOverview({ 
  firstName, 
  userId,
  walletBalance,
  ethBalance,
  walletAddress,
  transactions,
  initialEthPrice,
  initialEthChange,
  initialUsdtPrice,
  blockGasFees = false
}: WalletOverviewProps) {
  
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Send state
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showBalance, setShowBalance] = useState(true);
  
  // Real-time prices from backend
  const [ethPrice, setEthPrice] = useState(initialEthPrice);
  const [ethChange, setEthChange] = useState(initialEthChange);
  const [usdtPrice, setUsdtPrice] = useState(initialUsdtPrice);

  // Deposit state
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositToken, setDepositToken] = useState<'USDT' | 'ETH'>('USDT');

  const userWalletAddress = walletAddress || "Generating Wallet Address...";
  const qrCodeUrl = walletAddress ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${walletAddress}&bgcolor=0D1117&color=ffffff` : null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdrawalRequest = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const amount = parseFloat(sendAmount);
      if (amount <= 0) {
        throw new Error("Invalid amount");
      }
      
      const balanceToCheck = selectedToken === 'USDT' ? walletBalance : ethBalance;
      if (amount > balanceToCheck && selectedToken !== 'ETH') {
        throw new Error("Insufficient balance");
      }
      
      await requestWithdrawal(amount, sendAddress, selectedToken as 'USDT' | 'ETH');
      setSuccessMsg('Transaction submitted to network. Awaiting confirmation.');
      setTimeout(() => {
        setShowSendModal(false);
        setSuccessMsg('');
        setSendAmount('');
        setSendAddress('');
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to request withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    try {
      setIsDepositing(true);
      setErrorMsg('');
      await notifyDeposit(parseFloat(depositAmount), depositToken);
      setSuccessMsg('Deposit logic initiated.');
      setTimeout(() => {
        setShowReceiveModal(false);
        setSuccessMsg('');
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to log deposit');
    } finally {
      setIsDepositing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const usdtValue = walletBalance * usdtPrice;
  const ethValue = ethBalance * ethPrice;
  const totalBalanceUsd = usdtValue + ethValue;
  
  const totalChangeValue = ethValue * (ethChange / 100);
  const blendedChangePercent = totalBalanceUsd > 0 ? (totalChangeValue / totalBalanceUsd) * 100 : 0;
  const isPositive = blendedChangePercent >= 0;



  // Gas and validation logic
  const estimatedGasEth = 0.0025; // Standard Ethereum network fee estimation
  const parsedSendAmount = parseFloat(sendAmount || '0');
  
  let isSendInsufficient = false;
  let validationError = '';

  if (parsedSendAmount > 0) {
    if (blockGasFees) {
      isSendInsufficient = true;
      validationError = 'insufficient eth for gas fees';
    } else if (selectedToken === 'USDT') {
      if (ethBalance < estimatedGasEth) {
        isSendInsufficient = true;
        validationError = 'insufficient eth for gas fees';
      } else if (parsedSendAmount > walletBalance) {
        isSendInsufficient = true;
        validationError = 'Insufficient USDT balance';
      }
    } else if (selectedToken === 'ETH') {
      if (parsedSendAmount + estimatedGasEth > ethBalance) {
        isSendInsufficient = true;
        validationError = 'insufficient eth for gas fees';
      }
    }
  }

  const isSendInvalid = parsedSendAmount <= 0;

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

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto flex flex-col pt-6 pb-32 px-4 sm:px-8 lg:px-10 gap-4 sm:gap-6 min-h-screen"
    >
      {/* Main Balance Card */}
      <motion.div variants={fadeInItem} className="w-full bg-[#0D1117]/60 backdrop-blur-3xl border border-[#D4AF37]/20 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[160px] sm:min-h-[180px] md:min-h-[260px] shadow-[0_0_50px_rgba(212,175,55,0.1)]">
        
        {/* Glows */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden hidden sm:block">
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] z-0"></div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-32 bg-white/5 border border-white/10 rounded-xl transform rotate-12 shadow-2xl z-10 flex items-center justify-center backdrop-blur-md">
            <Wallet className="w-16 h-16 text-white/50" weight="duotone" />
            <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-[#0D1117] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden p-2.5">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" alt="ETH" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -left-4 -bottom-4 w-10 h-10 rounded-full bg-[#0D1117] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden p-2">
              <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg" alt="USDT" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#8B949E] uppercase tracking-wider">Total Balance</h3>
            <button onClick={() => setShowBalance(!showBalance)} className="text-[#8B949E] hover:text-white transition-colors">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeSlash className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-1 sm:mb-2 flex-wrap">
            <h2 className="text-[32px] sm:text-5xl md:text-6xl leading-[1.1] font-extrabold text-white tracking-tight flex items-end gap-2 sm:gap-3 drop-shadow-lg break-all">
              <span className={`transition-all duration-300 ${!showBalance ? 'blur-md opacity-50 select-none' : ''}`}>
                {formatCurrency(totalBalanceUsd)}
              </span>
              <span className={`text-base sm:text-xl font-bold text-[#D4AF37] mb-1 transition-all duration-300 ${!showBalance ? 'blur-md opacity-50 select-none' : ''}`}>USD</span>
            </h2>
          </div>
          {showBalance && (
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${isPositive ? 'bg-[#22C55E]/10' : 'bg-red-500/10'}`}>
                {isPositive ? <TrendUp className="w-4 h-4 text-[#22C55E]" /> : <TrendDown className="w-4 h-4 text-red-500" />}
                <span className={`text-xs font-bold ${isPositive ? 'text-[#22C55E]' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{blendedChangePercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest">24h Return</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons Row */}
      <motion.div variants={fadeInItem} className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-4 relative z-10 w-full max-w-[320px] sm:max-w-[400px] md:max-w-none mx-auto mt-2 md:mt-0">
        <button 
          onClick={() => setShowReceiveModal(true)}
          className="bg-transparent md:bg-[#0D1117]/60 md:backdrop-blur-2xl border-none md:border md:border-solid md:border-white/5 md:hover:border-white/20 rounded-xl md:rounded-2xl p-1 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 transition-all group md:shadow-lg"
        >
          <div className="w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] md:w-12 md:h-12 rounded-full md:rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE047] flex items-center justify-center text-black border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] md:shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
            <DownloadSimple className="w-5 h-5 md:w-5 md:h-5" weight="bold" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-white font-semibold md:font-extrabold text-[12px] sm:text-[13px] md:text-sm md:mb-0.5 leading-tight">Receive</h4>
            <p className="hidden md:block text-[11px] font-medium text-[#8B949E]">Get your unique address</p>
          </div>
        </button>

        <button 
          onClick={() => setShowSendModal(true)}
          className="bg-transparent md:bg-[#0D1117]/60 md:backdrop-blur-2xl border-none md:border md:border-solid md:border-white/5 md:hover:border-white/20 rounded-xl md:rounded-2xl p-1 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 transition-all group md:shadow-lg"
        >
          <div className="w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] md:w-12 md:h-12 rounded-full md:rounded-xl bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform shadow-lg">
            <UploadSimple className="w-5 h-5 md:w-5 md:h-5" weight="bold" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-white font-semibold md:font-extrabold text-[12px] sm:text-[13px] md:text-sm md:mb-0.5 leading-tight">Send</h4>
            <p className="hidden md:block text-[11px] font-medium text-[#8B949E]">Send crypto externally</p>
          </div>
        </button>

        <button 
          disabled
          className="bg-transparent md:bg-[#0D1117]/60 md:backdrop-blur-2xl border-none md:border md:border-solid md:border-white/5 rounded-xl md:rounded-2xl p-1 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 transition-all opacity-60 cursor-not-allowed md:shadow-lg group"
        >
          <div className="w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] md:w-12 md:h-12 rounded-full md:rounded-xl bg-gradient-to-tr from-white/5 to-white/5 flex items-center justify-center text-[#8B949E] border border-white/10">
            <ArrowsLeftRight className="w-5 h-5 md:w-5 md:h-5" weight="bold" />
          </div>
          <div className="text-center md:text-left relative">
            <h4 className="text-[#8B949E] font-semibold md:font-extrabold text-[12px] sm:text-[13px] md:text-sm md:mb-0.5 flex items-center justify-center md:justify-start gap-2 leading-tight">
              Swap <span className="hidden md:inline-block text-[9px] bg-white/10 px-2 py-0.5 rounded-sm">SOON</span>
            </h4>
            <p className="hidden md:block text-[11px] font-medium text-[#8B949E]/70">Swap network assets</p>
          </div>
        </button>
      </motion.div>

      {/* Assets & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative z-10 w-full mt-4 sm:mt-0">
        {/* Your Assets */}
        <motion.div variants={fadeInItem} className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] md:rounded-2xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-extrabold text-white">Your Assets</h3>
            <button className="flex items-center gap-2 text-xs font-bold text-[#8B949E] hover:text-white transition-colors uppercase tracking-wider">
              Manage <CaretDown className="w-3 h-3" weight="bold" />
            </button>
          </div>

          <div className="hidden md:flex justify-between pb-3 border-b border-white/5 text-[10px] font-bold text-[#8B949E] uppercase tracking-widest px-4">
            <div className="w-1/3">Asset</div>
            <div className="w-1/3 text-right">Balance</div>
            <div className="w-1/3 text-right">USD Value</div>
          </div>

          <div className="flex flex-col mt-2">
            {/* USDT Row */}
            <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 mb-2 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors">
              <div className="flex items-center gap-3 sm:gap-4 md:w-1/3">
                <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg" alt="USDT" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg" />
                <div>
                  <p className="text-[14px] sm:text-base font-extrabold text-white leading-tight">USDT</p>
                  <p className="text-[11px] sm:text-xs font-medium text-[#8B949E] mt-0.5">Tether USD</p>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3 text-right">
                <p className={`text-[13px] font-medium text-[#8B949E] transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {usdtValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USDT
                </p>
              </div>
              <div className="text-right md:w-1/3">
                <p className={`text-[14px] sm:text-base font-extrabold text-white leading-tight transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {formatCurrency(usdtValue)}
                </p>
                <p className={`md:hidden text-[11px] sm:text-xs font-medium text-[#8B949E] mt-0.5 transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {usdtValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USDT
                </p>
              </div>
            </div>

            {/* ETH Row */}
            <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors">
              <div className="flex items-center gap-3 sm:gap-4 md:w-1/3">
                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" alt="ETH" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg" />
                <div>
                  <p className="text-[14px] sm:text-base font-extrabold text-white leading-tight">ETH</p>
                  <p className="text-[11px] sm:text-xs font-medium text-[#8B949E] mt-0.5">Ethereum</p>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3 text-right">
                <p className={`text-[13px] font-medium text-[#8B949E] transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {ethBalance.toFixed(4)} ETH
                </p>
              </div>
              <div className="text-right md:w-1/3">
                <p className={`text-[14px] sm:text-base font-extrabold text-white leading-tight transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {formatCurrency(ethValue)}
                </p>
                <p className={`md:hidden text-[11px] sm:text-xs font-medium text-[#8B949E] mt-0.5 transition-all duration-300 ${!showBalance ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {ethBalance.toFixed(4)} ETH
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeInItem} className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] md:rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 pb-4 sm:pb-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">Recent Transactions</h3>
              <Link href="/dashboard/transactions" className="text-xs font-bold text-[#D4AF37] hover:text-[#Eab308] transition-colors uppercase tracking-wider">
                View All
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-between pb-3 border-b border-white/10 text-[10px] font-bold text-[#8B949E] uppercase tracking-widest px-5 sm:px-6">
            <div className="w-5/12">Transaction</div>
            <div className="w-3/12 text-left px-2">Date</div>
            <div className="w-4/12 text-right">Amount</div>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-[#8B949E] flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" weight="light" />
                </div>
                <p className="text-[13px] sm:text-base font-bold text-white mb-1">No transactions yet</p>
                <p className="text-[11px] sm:text-sm font-medium">Your deposits and withdrawals will appear here.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                let rawType = tx.tx_hash || tx.type;
                if (rawType && rawType.startsWith('{')) {
                  try {
                    const parsed = JSON.parse(rawType);
                    rawType = parsed.original_tx_hash || tx.type;
                  } catch (e) {}
                }
                const trueType = rawType;
                let label = trueType.replace(/_/g, ' ');
                let isIncoming = true;
                let bg = 'bg-white/5 border-white/10 text-white';
                let currency = 'USDT';
                let Icon = FileText;

                switch (trueType) {
                  case 'wallet_deposit':
                  case 'deposit':
                    label = 'Deposit';
                    Icon = ArrowDownLeft;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = true;
                    break;
                  case 'eth_deposit':
                    label = 'ETH Deposit';
                    Icon = ArrowDownLeft;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = true;
                    currency = 'ETH';
                    break;
                  case 'eth_withdrawal':
                    label = 'ETH Withdrawal';
                    Icon = ArrowUpRight;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = false;
                    currency = 'ETH';
                    break;
                  case 'wallet_withdrawal':
                  case 'withdraw':
                  case 'withdrawal':
                  case 'withdrawal_request':
                    label = 'Withdrawal';
                    Icon = ArrowUpRight;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = false;
                    break;
                  case 'capital_deployment':
                    label = 'Investment';
                    Icon = ChartLineUp;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = false;
                    break;
                  case 'referral_bonus':
                    label = 'Referral Reward';
                    Icon = Star;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = true;
                    break;
                  case 'capital_withdrawal':
                  case 'withdrawal_capital':
                    label = 'Investment Return';
                    Icon = ChartLineUp;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = true;
                    break;
                  case 'earnings_withdrawal':
                  case 'withdrawal_earnings':
                    label = 'Reward Claim';
                    Icon = Star;
                    bg = 'bg-[#161B22] border-white/10 text-white';
                    isIncoming = true;
                    break;
                }

                return (
                <div 
                  key={tx.id} 
                  className="group flex items-center justify-between py-4 px-5 sm:px-6 border-b border-white/[0.04] last:border-0 hover:bg-[#161B22]/50 transition-all duration-300 cursor-default"
                >
                  <div className="flex items-center gap-4 min-w-0 md:w-5/12">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" weight="regular" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-[14px] sm:text-[15px] font-bold text-white tracking-wide capitalize truncate leading-tight">
                        {label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {(() => {
                          let displayStatus = tx.status;
                          try {
                            if (tx.tx_hash && tx.tx_hash.startsWith('{')) {
                              const parsed = JSON.parse(tx.tx_hash);
                              if (parsed.extended_status) {
                                displayStatus = parsed.extended_status;
                              }
                            }
                          } catch (e) {}
                          
                          return (
                            <>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                displayStatus === 'completed' || displayStatus === 'approved' ? 'bg-[#22C55E] shadow-[0_0_8px_#22c55e]' : 
                                displayStatus === 'processing' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' :
                                displayStatus === 'pending' ? 'bg-[#Eab308] shadow-[0_0_8px_#Eab308]' : 
                                'bg-red-500 shadow-[0_0_8px_#ef4444]'
                              }`} />
                              <p className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]`}>
                                {displayStatus === 'approved' ? 'Success' : displayStatus}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex md:w-3/12 flex-col justify-center text-left px-2">
                    <p className="text-[12px] font-semibold text-[#8B949E] tracking-wide">
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-medium text-[#8B949E]/70 mt-0.5">
                      {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0 md:w-4/12 flex flex-col justify-center">
                    <p className={`text-[15px] sm:text-[17px] font-extrabold font-mono tracking-tight leading-none text-white`}>
                      {isIncoming ? '+' : '-'}{currency === 'USDT' ? formatCurrency(tx.amount) : `${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})} ETH`}
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-[#8B949E] mt-1.5">{currency === 'USDT' ? 'USDT (ERC20)' : `~$${(Number(tx.amount) * ethPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`}</p>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </motion.div>

      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#070A0D]/90 backdrop-blur-md"
          onClick={() => {
            setShowReceiveModal(false);
            setSuccessMsg('');
            setErrorMsg('');
          }}
        >
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1117] border border-[#1C2128] rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative mt-16 sm:mt-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="p-6 border-b border-[#1C2128] flex items-center justify-between relative z-10">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold text-white tracking-tight">Deposit Crypto</h3>
              <button 
                onClick={() => {
                  setShowReceiveModal(false);
                  setSuccessMsg('');
                  setErrorMsg('');
                }} 
                className="w-8 h-8 flex items-center justify-center text-[#8B949E] hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>
            
              <div className="p-6 space-y-6 relative z-10 overflow-y-auto max-h-[80vh] custom-scrollbar">
                
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-3">
                    <Warning className="w-5 h-5 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 bg-[#22C55E]/10 text-[#22C55E] rounded-xl text-sm font-bold border border-[#22C55E]/20 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    {successMsg}
                  </div>
                )}

                {/* Asset Selector */}
                <div className="flex justify-center">
                  <div className="bg-[#161B22] border border-[#30363D] rounded-full p-1 flex items-center gap-1">
                    <button 
                      onClick={() => setDepositToken('USDT')}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        depositToken === 'USDT' 
                        ? 'bg-[#21262D] text-white shadow-md border border-[#30363D]' 
                        : 'text-[#8B949E] hover:text-white'
                      }`}
                    >
                      USDT (ERC20)
                    </button>
                    <button 
                      onClick={() => setDepositToken('ETH')}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        depositToken === 'ETH' 
                        ? 'bg-[#21262D] text-white shadow-md border border-[#30363D]' 
                        : 'text-[#8B949E] hover:text-white'
                      }`}
                    >
                      Ethereum
                    </button>
                  </div>
                </div>

                {/* Massive Amount Input */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="w-full relative">
                    <input 
                      type="text" 
                      value={depositAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        if (val.split('.').length > 2) return;
                        setDepositAmount(val);
                      }}
                      placeholder="0"
                      className="w-full bg-transparent text-center text-5xl sm:text-6xl font-extrabold tracking-tighter text-white focus:outline-none transition-colors"
                      style={{ minWidth: '0' }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <span className="text-sm font-bold text-[#8B949E]">
                      ~${(parseFloat(depositAmount || '0') * (depositToken === 'USDT' ? initialUsdtPrice : initialEthPrice)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center mt-6">
                  {qrCodeUrl ? (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-[2rem] p-5 shadow-2xl flex items-center justify-center relative ring-4 ring-[#D4AF37]/20">
                      <img src={qrCodeUrl} alt="Wallet QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white/5 rounded-[2rem] p-5 flex flex-col items-center justify-center relative border border-white/10">
                      <CircleNotch className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" weight="bold" />
                      <p className="text-xs font-bold text-[#8B949E] uppercase tracking-widest text-center">Provisioning<br/>Address</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="inline-block px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-4 mt-6">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">ERC20 Network Only</span>
                  </div>
                  <p className="text-xs text-[#8B949E] max-w-[280px] font-medium leading-relaxed">
                    Send only USDT or ETH to this address. Sending any other asset will result in permanent loss.
                  </p>
                </div>
                  
                  <div className="w-full relative mb-8 group">
                    <div className="w-full bg-[#070A0D] border border-white/10 group-hover:border-white/20 rounded-xl py-4 px-5 text-center font-mono text-sm font-bold text-white tracking-wider truncate transition-colors">
                      {userWalletAddress}
                    </div>
                    <button 
                      onClick={handleCopy}
                      disabled={!walletAddress}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {copied ? <CheckCircle weight="fill" className="w-5 h-5 text-[#22C55E]" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  <button 
                    onClick={handleNotifyDeposit}
                    disabled={isDepositing || !!successMsg}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isDepositing ? (
                      <><CircleNotch className="w-5 h-5 animate-spin" weight="bold" /> Processing...</>
                    ) : (
                      successMsg ? <><CheckCircle className="w-5 h-5" weight="bold"/> Logged</> : "I've Deposited"
                    )}
                  </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#070A0D]/90 backdrop-blur-md"
          onClick={() => setShowSendModal(false)}
        >
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D1117] border border-[#1C2128] rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative mt-16 sm:mt-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="p-6 border-b border-[#1C2128] flex items-center justify-between relative z-10">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold text-white tracking-tight">Send Crypto</h3>
              <button onClick={() => setShowSendModal(false)} disabled={isSubmitting} className="w-8 h-8 flex items-center justify-center text-[#8B949E] hover:text-white rounded-full hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 relative z-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
              
              {errorMsg && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-3">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-[#22C55E]/10 text-[#22C55E] rounded-xl text-sm font-bold border border-[#22C55E]/20 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  {successMsg}
                </div>
              )}
              
              {/* Asset Selector */}
              <div className="flex justify-center">
                <div className="bg-[#161B22] border border-[#30363D] rounded-full p-1 flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedToken('USDT')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedToken === 'USDT' 
                      ? 'bg-[#21262D] text-white shadow-md border border-[#30363D]' 
                      : 'text-[#8B949E] hover:text-white'
                    }`}
                  >
                    USDT (ERC20)
                  </button>
                  <button 
                    onClick={() => setSelectedToken('ETH')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedToken === 'ETH' 
                      ? 'bg-[#21262D] text-white shadow-md border border-[#30363D]' 
                      : 'text-[#8B949E] hover:text-white'
                    }`}
                  >
                    Ethereum
                  </button>
                </div>
              </div>

              {/* Massive Amount Input */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="w-full relative">
                  <input 
                    type="text" 
                    value={sendAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      if (val.split('.').length > 2) return;
                      setSendAmount(val);
                    }}
                    placeholder="0"
                    className={`w-full bg-transparent text-center text-5xl sm:text-6xl font-extrabold tracking-tighter focus:outline-none transition-colors ${
                      isSendInsufficient ? 'text-red-500' : 'text-white'
                    }`}
                    style={{ minWidth: '0' }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <span className="text-sm font-bold text-[#8B949E]">
                    ~${(parsedSendAmount * (selectedToken === 'USDT' ? initialUsdtPrice : initialEthPrice)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30363D]"></div>
                  <span className="text-sm font-bold text-[#8B949E]">
                    Avail: {selectedToken === 'USDT' ? `${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USDT` : `${ethBalance.toFixed(4)} ETH`}
                  </span>
                  <button 
                    onClick={() => setSendAmount(selectedToken === 'USDT' ? walletBalance.toString() : ethBalance.toString())} 
                    className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 px-2 py-1 rounded-md font-extrabold transition-colors uppercase tracking-widest"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Destination Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest ml-2">Send to Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Wallet className="w-5 h-5 text-[#8B949E] group-focus-within:text-[#D4AF37] transition-colors" weight="duotone" />
                  </div>
                  <input 
                    type="text" 
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full pl-12 pr-4 py-4 bg-[#161B22] border border-[#30363D] text-white rounded-2xl text-sm font-mono focus:outline-none focus:border-[#D4AF37] hover:border-[#8B949E]/50 transition-all placeholder:text-[#8B949E]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  />
                </div>
              </div>

              {/* Network Fee Box */}
              <div className="bg-[#161B22]/50 border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B949E] flex items-center gap-1.5">
                    <Info className="w-4 h-4" weight="fill" /> Network Fee
                  </span>
                  <span className="text-xs font-bold text-white">~{estimatedGasEth} ETH</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#30363D] pt-3 mt-1">
                  <span className="text-xs font-bold text-[#8B949E]">Estimated Total</span>
                  <span className="text-sm font-extrabold text-white">
                    {selectedToken === 'ETH' ? (parsedSendAmount + estimatedGasEth).toFixed(4) : parsedSendAmount} {selectedToken}
                  </span>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-[#161B22]/50 border-t border-[#1C2128]">
              <button 
                onClick={handleWithdrawalRequest}
                disabled={!sendAddress || isSendInvalid || isSendInsufficient || isSubmitting}
                className={`w-full py-4 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isSendInsufficient
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : !sendAddress || isSendInvalid
                    ? 'bg-[#21262D] border border-[#30363D] text-[#8B949E] cursor-not-allowed'
                    : 'bg-[#D4AF37] hover:bg-[#Eab308] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <><CircleNotch className="w-5 h-5 animate-spin" weight="bold" /> Processing...</>
                ) : isSendInsufficient ? (
                  <><Warning className="w-5 h-5" weight="fill" /> {validationError}</>
                ) : (
                  <><UploadSimple className="w-5 h-5" weight="bold" /> Confirm Transfer</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
