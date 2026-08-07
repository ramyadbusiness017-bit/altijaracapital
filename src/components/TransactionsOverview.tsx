"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  Export,
  FileText,
  DownloadSimple,
  ArrowDownLeft,
  ArrowUpRight,
  ChartLineUp,
  Star,
  Waveform,
  CaretDown,
  CalendarBlank,
  MagnifyingGlass,
  SlidersHorizontal,
  CaretRight,
  Copy,
  Briefcase,
  Bag,
  Gift,
  CircleNotch,
  Wallet,
  CheckCircle,
  Clock,
  Link as LinkIcon
} from '@phosphor-icons/react/dist/ssr';
import toast from 'react-hot-toast';

export default function TransactionsOverview({ transactions, ethPrice = 3000 }: { transactions: any[], ethPrice?: number }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions based on tab and search
  const filteredTransactions = transactions.filter(tx => {
    let matchesTab = true;
    
    let rawType = tx.tx_hash || tx.type;
    if (rawType && rawType.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawType);
        rawType = parsed.original_tx_hash || tx.type;
      } catch (e) {}
    }
    const trueType = rawType;
    if (activeTab === 'Wallet') matchesTab = ['wallet_deposit', 'deposit', 'wallet_withdrawal', 'withdraw', 'withdrawal_request', 'referral_bonus', 'capital_deployment', 'capital_withdrawal', 'withdrawal_capital', 'earnings_withdrawal', 'withdrawal_earnings'].includes(trueType);
    if (activeTab === 'Investments') matchesTab = ['capital_deployment', 'capital_withdrawal', 'withdrawal_capital', 'earnings_withdrawal', 'withdrawal_earnings', 'capital_reinvestment', 'investment_earnings'].includes(trueType);
    
    let matchesSearch = true;
    if (searchQuery.trim()) {
      matchesSearch = (tx.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (tx.tx_hash || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (trueType || '').toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesTab && matchesSearch;
  });

  // Compute metrics from real transactions
  const totalReceived = transactions
    .filter(tx => getTxDetails(tx.type, tx.tx_hash).isIncoming && tx.status === 'approved')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalSent = transactions
    .filter(tx => !getTxDetails(tx.type, tx.tx_hash).isIncoming && tx.status === 'approved')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netFlow = totalReceived - totalSent;

  // Group transactions for Mobile view
  const groupedTransactions = filteredTransactions.reduce((acc: Record<string, any[]>, tx) => {
    const dateGroup = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dateGroup]) acc[dateGroup] = [];
    acc[dateGroup].push(tx);
    return acc;
  }, {});

  function getTxDetails(type: string, txHash: string | null) {
    let rawType = txHash || type;
    if (rawType && rawType.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawType);
        rawType = parsed.original_tx_hash || type;
      } catch (e) {}
    }
    const trueType = rawType;
    switch (trueType) {
      case 'wallet_deposit':
      case 'deposit': 
        return { label: 'Deposit', icon: <ArrowDownLeft className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
      case 'eth_deposit': 
        return { label: 'ETH Deposit', icon: <ArrowDownLeft className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'ETH' };
      case 'wallet_withdrawal':
      case 'withdraw':
      case 'withdrawal':
      case 'withdrawal_request':
        return { label: 'Withdrawal', icon: <ArrowUpRight className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: false, currency: 'USDT' };
      case 'eth_withdrawal':
        return { label: 'ETH Withdrawal', icon: <ArrowUpRight className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: false, currency: 'ETH' };
      case 'capital_deployment':
        return { label: 'Investment', icon: <ChartLineUp className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: false, currency: 'USDT' };
      case 'referral_bonus':
        return { label: 'Referral Reward', icon: <Star className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
      case 'capital_withdrawal':
      case 'withdrawal_capital':
        return { label: 'Investment Return', icon: <ChartLineUp className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
      case 'earnings_withdrawal':
      case 'withdrawal_earnings':
        return { label: 'Reward Claim', icon: <Star className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
      case 'capital_reinvestment':
        return { label: 'Reinvestment', icon: <ArrowUpRight className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: false, currency: 'USDT' };
      case 'investment_earnings':
        return { label: 'Accrued Yield', icon: <Bag className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
      default: 
        return { label: trueType.replace(/_/g, ' '), icon: <FileText className="w-5 h-5" weight="regular" />, bg: 'bg-[#161B22] border-white/10 text-white', isIncoming: true, currency: 'USDT' };
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const escapeCSV = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

    const headers = ['Date', 'Type', 'Amount', 'Status', 'Transaction ID', 'Hash / Reference'];
    const rows = filteredTransactions.map(tx => {
      const formattedDate = new Date(tx.created_at).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      const formattedAmount = `$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USDT`;
      const formattedStatus = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
      
      return [
        escapeCSV(formattedDate),
        escapeCSV(getTxDetails(tx.type, tx.tx_hash).label),
        escapeCSV(formattedAmount),
        escapeCSV(formattedStatus),
        escapeCSV(tx.id || 'N/A'),
        escapeCSV(tx.tx_hash || 'Internal Ledger')
      ];
    });

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `al_tijara_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Transactions exported successfully');
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success('Transaction ID copied to clipboard');
  };

  const openEtherscan = (hash: string) => {
    if (hash && hash.startsWith('0x')) {
      window.open(`https://etherscan.io/tx/${hash}`, '_blank');
    } else {
      toast('Internal ledger transfer. No external blockchain hash.', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-6 min-h-screen">
      
      {/* Action Button Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-end mb-2 relative z-10"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportCSV}
            className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center gap-2 active:scale-95"
          >
            <DownloadSimple className="w-4 h-4" weight="bold" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#8B949E]">
              <FileText className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">All Transactions</h3>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">{transactions.length}</h2>
            <p className="text-xs font-medium text-[#8B949E] mt-1">Total count in history</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
          
          <div className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#D4AF37]">
            <Waveform className="w-5 h-5" weight="bold" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 uppercase tracking-wider">Total Net Flow</h3>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">${netFlow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs font-medium text-[#8B949E] mt-1">USD Eqv.</p>
          </div>
          <div className="flex items-center mt-6">
            <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              Real-time Sync
            </span>
          </div>
        </motion.div>

      </div>

      {/* Main Transactions Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0D1117]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative z-10"
      >
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            {['All', 'Wallet', 'Investments'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-[#161B22] text-white shadow-md border border-white/10' 
                    : 'text-[#8B949E] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" weight="bold" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tx hash or type..." 
                className="w-full sm:w-72 bg-[#161B22] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#8B949E] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
            <button className="p-2.5 bg-[#161B22] border border-white/10 rounded-xl text-[#8B949E] hover:text-white hover:border-[#8B949E] transition-colors flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" weight="bold" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-[#161B22]/50">
          <p className="col-span-3 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest">Type & Asset</p>
          <p className="col-span-1 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest">Network</p>
          <p className="col-span-2 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest">Amount</p>
          <p className="col-span-2 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest text-center">Status</p>
          <p className="col-span-2 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest text-center">Date</p>
          <p className="col-span-2 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest text-right">Transaction Hash</p>
        </div>

        {/* Desktop Transactions List */}
        <div className="hidden md:flex flex-col min-h-[400px]">
          <AnimatePresence>
            {filteredTransactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-[#8B949E] py-20"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-base font-bold text-white mb-1">No transactions found</p>
                <p className="text-sm font-medium">Try adjusting your filters or search query.</p>
              </motion.div>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const details = getTxDetails(tx.type, tx.tx_hash);
                const displayHash = tx.tx_hash && tx.tx_hash.startsWith('0x') ? tx.tx_hash : 'INTERNAL';
                
                return (
                  <motion.div 
                    key={tx.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => openEtherscan(tx.tx_hash)}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#161B22] transition-colors cursor-pointer group ${idx !== filteredTransactions.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    
                    <div className="col-span-3 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mx-auto flex-shrink-0 ${details.bg}`}>
                          {details.icon}
                        </div>
                      <div>
                        <p className="text-sm font-bold text-white capitalize group-hover:text-[#D4AF37] transition-colors">{details.label}</p>
                        <p className="text-[11px] font-medium text-[#8B949E] mt-0.5">{details.currency === 'USDT' ? 'USDT (ERC20)' : 'ETH'}</p>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm font-bold text-white">{details.currency}</p>
                      <p className="text-[11px] font-medium text-[#8B949E] mt-0.5">{details.currency === 'USDT' ? 'ERC20' : 'Native'}</p>
                    </div>

                    <div className="col-span-2">
                      <p className={`text-sm font-extrabold ${details.isIncoming ? 'text-[#22C55E]' : 'text-red-500'}`}>
                        {details.isIncoming ? '+' : '-'}{details.currency === 'USDT' ? '$' : ''}{Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: details.currency === 'USDT' ? 2 : 6})} {details.currency === 'ETH' ? 'ETH' : ''}
                      </p>
                      <p className="text-[11px] font-medium text-[#8B949E] mt-0.5">{details.currency === 'USDT' ? `$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD` : `~$${(Number(tx.amount) * ethPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`}</p>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 capitalize ${
                        tx.status === 'approved' ? 'border-[#22C55E]/30 text-[#22C55E] bg-[#22C55E]/10' : 
                        tx.status === 'pending' ? 'border-[#Eab308]/30 text-[#Eab308] bg-[#Eab308]/10' : 
                        'border-red-500/30 text-red-500 bg-red-500/10'
                      }`}>
                        {tx.status === 'approved' && <CheckCircle weight="fill" className="w-3.5 h-3.5" />}
                        {tx.status === 'pending' && <Clock weight="fill" className="w-3.5 h-3.5" />}
                        {tx.status}
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-white">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[11px] font-medium text-[#8B949E] mt-0.5">{new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                      <div className="flex items-center gap-2 max-w-[150px]">
                        <span className="text-sm font-mono text-[#8B949E] truncate block">
                          {displayHash === 'INTERNAL' ? 'INTERNAL' : `${displayHash.slice(0, 6)}...${displayHash.slice(-4)}`}
                        </span>
                        {displayHash !== 'INTERNAL' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(tx.tx_hash || '');
                              toast.success('Hash copied');
                            }}
                            className="text-[#8B949E] hover:text-white transition-colors flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Transactions List (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col min-h-[400px]">
          <AnimatePresence>
            {filteredTransactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-[#8B949E] flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Wallet className="w-7 h-7 opacity-50" />
                </div>
                <p className="text-base font-bold text-white mb-1">No transactions found</p>
                <p className="text-sm font-medium">Try adjusting your filters or search.</p>
              </motion.div>
            ) : (
              Object.entries(groupedTransactions).map(([dateGroup, txs]) => (
                <div key={dateGroup} className="flex flex-col">
                  <div className="px-6 py-2 bg-[#161B22]/80 backdrop-blur-md border-y border-white/5 sticky top-0 z-10">
                    <h4 className="text-[11px] font-extrabold text-[#8B949E] tracking-wider uppercase">{dateGroup}</h4>
                  </div>
                  <div className="flex flex-col">
                    {txs.map((tx, idx) => {
                      const details = getTxDetails(tx.type, tx.tx_hash);
                      const displayHash = tx.tx_hash && tx.tx_hash.startsWith('0x') ? tx.tx_hash : 'INTERNAL';

                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => openEtherscan(tx.tx_hash)}
                          className={`px-6 py-5 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer ${idx !== txs.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
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
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${details.bg}`}>
                                    {details.icon}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white capitalize">{details.label}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      {displayHash !== 'INTERNAL' ? (
                                        <span className="text-[10px] font-mono font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded">{tx.tx_hash?.slice(0, 4)}...{tx.tx_hash?.slice(-4)}</span>
                                      ) : (
                                        <span className="text-[10px] font-mono font-medium text-[#8B949E] bg-white/5 px-1.5 py-0.5 rounded">Internal</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                  <p className={`text-sm font-extrabold text-white font-mono`}>
                                    {details.isIncoming ? '+' : '-'}{details.currency === 'USDT' ? '$' : ''}{Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: details.currency === 'USDT' ? 2 : 6})} {details.currency === 'ETH' ? 'ETH' : ''}
                                  </p>
                                  {details.currency === 'ETH' && (
                                    <p className="text-[10px] text-[#8B949E] font-medium mt-0.5">
                                      ~${(Number(tx.amount) * ethPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      displayStatus === 'completed' || displayStatus === 'approved' ? 'bg-[#22C55E]' : 
                                      displayStatus === 'processing' ? 'bg-blue-500' :
                                      displayStatus === 'pending' ? 'bg-[#Eab308]' : 
                                      'bg-red-500'
                                    }`} />
                                    <span className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">{displayStatus === 'approved' ? 'Success' : displayStatus}</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between p-5 border-t border-white/5 bg-[#161B22]/30">
            <p className="text-xs font-medium text-[#8B949E]">Showing all {filteredTransactions.length} records</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-white/5 transition-colors"><CaretRight className="w-4 h-4 transform rotate-180" weight="bold" /></button>
              <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F27] text-black text-xs font-extrabold flex items-center justify-center shadow-lg">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-white/5 transition-colors"><CaretRight className="w-4 h-4" weight="bold" /></button>
            </div>
          </div>
        )}

      </motion.div>

    </div>
  );
}
