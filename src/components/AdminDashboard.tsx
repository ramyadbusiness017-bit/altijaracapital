"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MagnifyingGlass, 
  ShieldCheck, 
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  PencilSimple,
  CircleNotch,
  SignOut,
  CalendarBlank,
  Bell,
  Lock,
  LockOpen,
  Wallet,
  CaretRight,
  X,
  ArrowsOut,
  List,
  TrendUp,
  WarningCircle,
  Money,
  Check,
  EnvelopeSimple,
  ArrowRight,
  DownloadSimple,
  UploadSimple,
  ChartLineUp,
  Ticket
} from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/client';
import { processTransaction, toggleUserPermit, adminAdjustBalance, resolveSupportTicket } from '@/app/actions/admin';
import { logoutAdmin } from '@/app/actions/admin-auth';
import { sendNotification, sendMassNotification } from '@/app/actions/notifications';
import Image from 'next/image';

export default function AdminDashboard({ initialProfiles, initialTransactions, initialTickets = [], ethPrice = 3000 }: { 
  initialProfiles: any[], 
  initialTransactions: any[], 
  initialTickets?: any[],
  ethPrice?: number
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [tickets, setTickets] = useState(initialTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'requests' | 'support'>('dashboard');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Drawer state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'funds' | 'permissions'>('overview');
  
  // Fund Manager state
  const [editAssetType, setEditAssetType] = useState<'wallet' | 'capital' | 'eth'>('wallet');
  const [editActionType, setEditActionType] = useState<'add' | 'deduct'>('add');
  const [editAmount, setEditAmount] = useState('');
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editStatus, setEditStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Notification state
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTarget, setNotifTarget] = useState<any>(null); // null = mass broadcast
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Metrics
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter(p => p.capital_balance > 0).length;
  const totalAssets = profiles.reduce((acc, curr) => acc + (curr.wallet_balance || 0) + (curr.capital_balance || 0) + ((curr.eth_balance || 0) * ethPrice), 0);
  const pendingRequests = transactions.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  const calculateAgeInDays = (startDate: string | null) => {
    if (!startDate) return 0;
    const start = new Date(startDate).getTime();
    const now = Date.now();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const query = searchQuery.toLowerCase().trim();
    if (query.startsWith('age ')) {
      const ageTarget = parseInt(query.replace('age ', '').trim(), 10);
      if (!isNaN(ageTarget)) {
        return profiles.filter(p => calculateAgeInDays(p.investment_start_date) === ageTarget);
      }
    }
    return profiles.filter(p => 
      p.id.toLowerCase().includes(query) ||
      (p.wallet_address && p.wallet_address.toLowerCase().includes(query)) ||
      (p.first_name && p.first_name.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query))
    );
  }, [profiles, searchQuery]);

  const togglePermit = async (userId: string, type: 'earnings' | 'capital' | 'gas', currentValue: boolean) => {
    try {
      setUpdatingId(`permit_${type}`);
      await toggleUserPermit(userId, type, currentValue);
      let column = '';
      if (type === 'earnings') column = 'earnings_withdrawal_permitted';
      else if (type === 'gas') column = 'block_gas_fees';
      else if (type === 'capital') column = 'capital_withdrawal_permitted';
      
      const updatedProfiles = profiles.map(p => p.id === userId ? { ...p, [column]: !currentValue } : p);
      setProfiles(updatedProfiles);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedProfiles.find(p => p.id === userId));
      }
    } catch (error) {
      console.error("Error toggling permit:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTransaction = async (txId: string, action: 'process' | 'approve' | 'decline') => {
    try {
      setUpdatingId(txId);
      await processTransaction(txId, action, ethPrice);
      if (action === 'process') {
        setTransactions(transactions.map(t => t.id === txId ? { ...t, status: 'processing' } : t));
      } else {
        setTransactions(transactions.filter(t => t.id !== txId));
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolveTicket = async (ticketId: string, currentStatus: string) => {
    try {
      setUpdatingId(ticketId);
      const newStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
      await resolveSupportTicket(ticketId, newStatus);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error resolving ticket:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const saveBalances = async () => {
    if (!selectedUser || !editAmount) return;
    try {
      setIsEditingBalance(true);
      const amt = parseFloat(editAmount);
      if (amt <= 0) throw new Error("Amount must be positive");
      
      const { newBalance } = await adminAdjustBalance(selectedUser.id, editAssetType, editActionType, amt);
      
      let updateObj: any = {};
      if (editAssetType === 'wallet') updateObj = { wallet_balance: newBalance };
      if (editAssetType === 'capital') updateObj = { capital_balance: newBalance };
      if (editAssetType === 'eth') updateObj = { eth_balance: newBalance };

      const updatedProfiles = profiles.map(p => p.id === selectedUser.id ? { ...p, ...updateObj } : p);
      setProfiles(updatedProfiles);
      setSelectedUser(updatedProfiles.find(p => p.id === selectedUser.id));
      setEditAmount('');
      
      // Manually add the new transaction to the UI so it shows up instantly without needing a hard refresh
      const newTx = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: selectedUser.id,
        amount: amt,
        type: editActionType === 'add' ? 'deposit' : 'withdrawal_capital',
        status: 'approved',
        created_at: new Date().toISOString(),
        profiles: selectedUser
      };
      setTransactions([newTx, ...transactions]);

      setEditStatus('success');
      setTimeout(() => setEditStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Error saving balances:", error);
      setEditStatus('error');
      setEditErrorMsg(error.message || "An error occurred");
      setTimeout(() => setEditStatus('idle'), 5000);
    } finally {
      setIsEditingBalance(false);
    }
  };

  const handleSendNotif = async () => {
    if (!notifTitle || !notifMsg) return;
    try {
      setIsSendingNotif(true);
      if (notifTarget === null) {
        await sendMassNotification(notifTitle, notifMsg, notifType);
      } else {
        await sendNotification(notifTarget.id, notifTitle, notifMsg, notifType);
      }
      setShowNotifModal(false);
      setNotifTitle('');
      setNotifMsg('');
      setNotifType('info');
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsSendingNotif(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#070A0D] text-slate-200 overflow-hidden font-sans selection:bg-[#D4AF37]/30">
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0A0E14] border-r border-white/5 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="relative w-40 h-14">
              <img src="/images/logo.png" alt="Al-Tijara" className="w-full h-full object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(42%) saturate(459%) hue-rotate(352deg) brightness(90%) contrast(85%)' }} />
            </div>
            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Admin Command Center</p>
          </div>
          <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={<ChartLineUp />} label="Overview" isActive={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} 
          />
          <NavItem 
            icon={<Users />} label="Client Directory" isActive={activeTab === 'users'} 
            onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }} 
          />
          <NavItem 
            icon={<Wallet />} label="Financial Requests" isActive={activeTab === 'requests'} badge={pendingRequests}
            onClick={() => { setActiveTab('requests'); setMobileMenuOpen(false); }} 
          />
          <NavItem 
            icon={<Ticket />} label="Support Tickets" isActive={activeTab === 'support'} badge={openTickets} badgeColor="bg-red-500"
            onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }} 
          />
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Quick Actions</p>
            <button 
              onClick={() => { setNotifTarget(null); setShowNotifModal(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-colors font-bold text-sm"
            >
              <Bell className="w-5 h-5" weight="bold" /> Mass Broadcast
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={async () => await logoutAdmin()}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-bold text-sm"
          >
            <SignOut className="w-5 h-5" weight="bold" /> Secure Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#070A0D]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="relative w-28 h-8">
              <img src="/images/logo.png" alt="Al-Tijara" className="w-full h-full object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(42%) saturate(459%) hue-rotate(352deg) brightness(90%) contrast(85%)' }} />
            </div>
            <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest border-l border-white/20 pl-2">Admin</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-zinc-400">
            <List className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Platform Overview</h2>
                  <p className="text-sm font-medium text-[#8B949E]">Monitor the overall health and metrics of Al-Tijara.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total AUM" value={formatCurrency(totalAssets)} icon={<Wallet weight="duotone" className="text-[#D4AF37] w-8 h-8" />} />
                  <StatCard title="Total Clients" value={totalUsers} icon={<Users weight="duotone" className="text-blue-500 w-8 h-8" />} />
                  <StatCard title="Active Investors" value={activeUsers} icon={<TrendUp weight="duotone" className="text-green-500 w-8 h-8" />} />
                  <StatCard title="Pending Requests" value={pendingRequests} icon={<WarningCircle weight="duotone" className="text-red-500 w-8 h-8" />} />
                </div>

                <div className="bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck weight="duotone" className="w-10 h-10 text-white/40" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">System Optimal</h3>
                  <p className="text-[#8B949E] max-w-md">All core systems are fully operational. Transaction processing and yield generation are running normally.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Client Directory</h2>
                    <p className="text-sm font-medium text-[#8B949E]">Manage users, adjust balances, and toggle permissions.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Search ID, Name, or 'AGE 7'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 text-white rounded-2xl text-sm font-medium focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-zinc-600 shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProfiles.map(profile => {
                    const totalAsset = (profile.wallet_balance || 0) + (profile.capital_balance || 0) + ((profile.eth_balance || 0) * ethPrice);
                    return (
                      <div 
                        key={profile.id}
                        onClick={() => setSelectedUser(profile)}
                        className="bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 hover:border-[#D4AF37]/30 rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden"
                      >
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-[40px] -mr-8 -mt-8 pointer-events-none group-hover:bg-[#D4AF37]/20 transition-colors"></div>
                        
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                            {(profile.first_name?.[0] || 'U').toUpperCase()}
                          </div>
                          {profile.block_gas_fees ? (
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                          )}
                        </div>
                        
                        <h3 className="font-extrabold text-white text-lg truncate relative z-10">{profile.first_name || 'Unverified'} {profile.last_name}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono mb-4 relative z-10">{profile.uid || profile.id.slice(0, 8)}</p>
                        
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 relative z-10">
                          <p className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-1">Total Assets</p>
                          <p className="font-mono font-black text-[#D4AF37]">{formatCurrency(totalAsset)}</p>
                        </div>
                      </div>
                    )
                  })}
                  {filteredProfiles.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-lg font-bold text-white">No Clients Found</h3>
                      <p className="text-sm text-[#8B949E]">Try adjusting your search query.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Financial Requests</h2>
                  <p className="text-sm font-medium text-[#8B949E]">Approve or reject deposits and withdrawals.</p>
                </div>

                <div className="flex flex-col gap-4 max-w-4xl">
                  {transactions.length === 0 ? (
                    <div className="bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-16 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500/40 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
                      <p className="text-[#8B949E]">No pending requests at the moment.</p>
                    </div>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-white/10 hover:shadow-xl">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${tx.type.includes('withdrawal') ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                            {tx.type.includes('withdrawal') ? <UploadSimple className="w-7 h-7" weight="bold" /> : <DownloadSimple className="w-7 h-7" weight="bold" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-extrabold text-white">{tx.amount} {tx.type.includes('eth') || tx.tx_hash?.includes('"token":"ETH"') ? 'ETH' : 'USDT'}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${tx.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : tx.status === 'completed' || tx.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{tx.status}</span>
                            </div>
                            <p className="text-xs text-[#8B949E] font-medium uppercase tracking-wider">{tx.type.replace('_', ' ')}</p>
                            <p className="text-[11px] font-bold text-white mt-2 mb-0.5">User: {profiles.find(p => p.id === tx.user_id)?.email || tx.user_id}</p>
                            <p className="text-[10px] text-zinc-400 font-mono mb-1 break-all max-w-md">Source: {profiles.find(p => p.id === tx.user_id)?.wallet_address || 'N/A'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono break-all max-w-md">Dest: {(() => {
                              try {
                                if (tx.tx_hash && tx.tx_hash.startsWith('{')) {
                                  return JSON.parse(tx.tx_hash).address || 'Platform Wallet';
                                }
                              } catch(e) {}
                              return tx.destination_address || 'Platform Wallet';
                            })()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:flex-col lg:flex-row w-full md:w-auto">
                          <button 
                            disabled={updatingId === tx.id}
                            onClick={() => handleTransaction(tx.id, 'decline')}
                            className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            {updatingId === tx.id ? <CircleNotch className="w-5 h-5 animate-spin" /> : <XCircle weight="fill" className="w-5 h-5" />} Reject
                          </button>
                          
                          {tx.status === 'pending' ? (
                            <button 
                              disabled={updatingId === tx.id}
                              onClick={() => handleTransaction(tx.id, 'process')}
                              className="flex-1 md:flex-none px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
                            >
                              {updatingId === tx.id ? <CircleNotch className="w-5 h-5 animate-spin" /> : <CheckCircle weight="bold" className="w-5 h-5" />} Process
                            </button>
                          ) : (
                            <button 
                              disabled={updatingId === tx.id}
                              onClick={() => handleTransaction(tx.id, 'approve')}
                              className="flex-1 md:flex-none px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                            >
                              {updatingId === tx.id ? <CircleNotch className="w-5 h-5 animate-spin" /> : <CheckCircle weight="fill" className="w-5 h-5" />} Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Support Tickets</h2>
                  <p className="text-sm font-medium text-[#8B949E]">Manage client inquiries and issues.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tickets.length === 0 ? (
                    <div className="col-span-full bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-16 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500/40 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white">Inbox Zero!</h3>
                      <p className="text-[#8B949E]">No support tickets found.</p>
                    </div>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between transition-all hover:border-white/10 hover:shadow-xl">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">{ticket.subject}</h3>
                              <p className="text-xs font-mono text-[#8B949E]">From: {ticket.profiles?.first_name || 'User'} • {new Date(ticket.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                              ticket.status === 'Open' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-sm text-zinc-300 mb-6 leading-relaxed">
                            {ticket.message}
                          </div>
                        </div>
                        
                        <button 
                          disabled={updatingId === ticket.id}
                          onClick={() => handleResolveTicket(ticket.id, ticket.status)}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            ticket.status === 'Open' 
                              ? 'bg-white text-black hover:bg-zinc-200 shadow-md' 
                              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {updatingId === ticket.id ? <CircleNotch className="w-5 h-5 animate-spin" /> : <Check weight="bold" className="w-5 h-5" />} 
                          {ticket.status === 'Open' ? 'Mark as Resolved' : 'Reopen Ticket'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Fund Manager Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-[#070A0D] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="relative h-32 bg-gradient-to-br from-[#1A1F26] to-[#070A0D] border-b border-white/10 flex items-end p-6 shrink-0">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => { setNotifTarget(selectedUser); setShowNotifModal(true); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <EnvelopeSimple className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center text-black font-extrabold text-2xl">
                    {(selectedUser.first_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="pb-1">
                    <h2 className="text-2xl font-extrabold text-white">{selectedUser.first_name} {selectedUser.last_name}</h2>
                    <p className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded inline-block border border-[#D4AF37]/20 mt-1">{selectedUser.uid || selectedUser.id}</p>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-white/5 shrink-0">
                <DrawerTab active={drawerTab === 'overview'} onClick={() => setDrawerTab('overview')} label="Overview" />
                <DrawerTab active={drawerTab === 'funds'} onClick={() => setDrawerTab('funds')} label="Manage Funds" />
                <DrawerTab active={drawerTab === 'permissions'} onClick={() => setDrawerTab('permissions')} label="Permissions" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {drawerTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest uppercase text-[#8B949E] mb-3">Asset Balances</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <BalanceBox title="Liquid Wallet" value={formatCurrency(selectedUser.wallet_balance || 0)} />
                        <BalanceBox title="Locked Capital" value={formatCurrency(selectedUser.capital_balance || 0)} />
                        <BalanceBox title="Accrued Yield" value={formatCurrency(selectedUser.earnings_balance || 0)} />
                        <BalanceBox title="Ethereum" value={`${selectedUser.eth_balance || 0} ETH`} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest uppercase text-[#8B949E] mb-3">Client Details</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 text-sm">
                        <DetailRow label="Email" value={selectedUser.email || 'N/A'} />
                        <DetailRow label="Deposit Address" value={selectedUser.wallet_address || 'Not generated'} isMono />
                        <DetailRow label="Referral Code" value={selectedUser.referral_code || 'None'} />
                        <DetailRow label="Investment Age" value={`${calculateAgeInDays(selectedUser.investment_start_date)} Days`} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {drawerTab === 'funds' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col h-full">
                    <div>
                      <label className="text-[10px] font-black text-[#8B949E] uppercase mb-3 block tracking-widest">Select Target Asset</label>
                      <div className="grid grid-cols-3 gap-2">
                        <AssetSelectBtn active={editAssetType === 'wallet'} onClick={() => setEditAssetType('wallet')} label="Liquid (USDT)" />
                        <AssetSelectBtn active={editAssetType === 'capital'} onClick={() => setEditAssetType('capital')} label="Locked (USDT)" />
                        <AssetSelectBtn active={editAssetType === 'eth'} onClick={() => setEditAssetType('eth')} label="Ethereum" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#8B949E] uppercase mb-3 block tracking-widest">Transaction Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setEditActionType('add')} 
                          className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${editActionType === 'add' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                        >
                          <TrendUp className="w-4 h-4" /> Credit (+)
                        </button>
                        <button 
                          onClick={() => setEditActionType('deduct')} 
                          className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${editActionType === 'deduct' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                        >
                          <WarningCircle className="w-4 h-4" /> Debit (-)
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 mt-4">
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-black text-[#8B949E] uppercase tracking-widest">Amount</label>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Current: {editAssetType === 'wallet' ? selectedUser.wallet_balance : editAssetType === 'capital' ? selectedUser.capital_balance : selectedUser.eth_balance}
                        </span>
                      </div>
                      <div className="relative">
                        {editAssetType !== 'eth' && (
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20">$</span>
                        )}
                        <input 
                          type="number" 
                          value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)} 
                          placeholder="0.00" 
                          className={`w-full bg-[#11161D] border border-white/10 rounded-2xl ${editAssetType !== 'eth' ? 'pl-14' : 'pl-6'} pr-20 py-6 text-white text-4xl font-extrabold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-mono`} 
                        />
                        {editAssetType === 'eth' && (
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-white/20">ETH</span>
                        )}
                      </div>
                    </div>

                    <button 
                        onClick={saveBalances} 
                        disabled={isEditingBalance || !editAmount || editStatus === 'success'} 
                        className={`w-full py-5 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-6 text-lg flex items-center justify-center gap-2 ${
                          editStatus === 'success' 
                            ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                            : editStatus === 'error'
                            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'bg-[#D4AF37] hover:bg-[#FDE047] text-black disabled:opacity-50'
                        }`}
                      >
                        {isEditingBalance ? (
                          <CircleNotch className="animate-spin w-6 h-6" />
                        ) : editStatus === 'success' ? (
                          <>Success!</>
                        ) : editStatus === 'error' ? (
                          <span className="text-sm">{editErrorMsg}</span>
                        ) : (
                          `Execute ${editActionType === 'add' ? 'Credit' : 'Debit'}`
                        )}
                      </button>
                  </motion.div>
                )}

                {drawerTab === 'permissions' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <PermissionRow 
                      title="Earnings Withdrawal" desc="Allow client to withdraw accrued yield."
                      isActive={selectedUser.earnings_withdrawal_permitted} isBlockedState={false}
                      loading={updatingId === `permit_earnings`}
                      onToggle={() => togglePermit(selectedUser.id, 'earnings', selectedUser.earnings_withdrawal_permitted)}
                    />
                    <PermissionRow 
                      title="Capital Withdrawal" desc="Allow client to withdraw locked principal."
                      isActive={selectedUser.capital_withdrawal_permitted} isBlockedState={false}
                      loading={updatingId === `permit_capital`}
                      onToggle={() => togglePermit(selectedUser.id, 'capital', selectedUser.capital_withdrawal_permitted)}
                    />
                    <PermissionRow 
                      title="Block Gas Fees" desc="Simulates 'Insufficient Gas' error."
                      isActive={selectedUser.block_gas_fees} isBlockedState={true}
                      loading={updatingId === `permit_gas`}
                      onToggle={() => togglePermit(selectedUser.id, 'gas', selectedUser.block_gas_fees)}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Broadcast Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#0D1117] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">
                {notifTarget ? `Message ${notifTarget.first_name}` : 'Mass Broadcast'}
              </h3>
              <button onClick={() => setShowNotifModal(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black tracking-widest text-[#8B949E] uppercase mb-2">Title</label>
                <input 
                  type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                  placeholder="e.g. Deposit Successful"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest text-[#8B949E] uppercase mb-2">Message</label>
                <textarea 
                  value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={4}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white text-sm resize-none custom-scrollbar"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest text-[#8B949E] uppercase mb-2">Type</label>
                <select 
                  value={notifType} onChange={e => setNotifType(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white text-sm"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <button 
                onClick={handleSendNotif} disabled={isSendingNotif || !notifTitle || !notifMsg}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all"
              >
                {isSendingNotif ? <CircleNotch className="w-5 h-5 animate-spin" /> : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponents for cleanliness
function NavItem({ icon, label, isActive, onClick, badge, badgeColor = "bg-[#D4AF37]" }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white font-medium'}`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-[#D4AF37]' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      {badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${badgeColor}`}>{badge}</span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-[#0D1117]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center gap-4 hover:border-white/10 transition-colors shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function DrawerTab({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${active ? 'text-white border-[#D4AF37] bg-white/5' : 'text-zinc-600 border-transparent hover:text-zinc-400 hover:bg-white/5'}`}
    >
      {label}
    </button>
  );
}

function BalanceBox({ title, value }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <p className="text-[9px] uppercase font-bold text-[#8B949E] tracking-wider mb-1">{title}</p>
      <p className="text-lg font-mono font-black text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, isMono }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[#8B949E] text-xs">{label}</span>
      <span className={`text-white text-xs ${isMono ? 'font-mono bg-black/40 px-2 py-0.5 rounded' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

function AssetSelectBtn({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 px-2 border rounded-xl font-bold text-[11px] transition-all whitespace-nowrap ${active ? 'border-white bg-white text-black' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}
    >
      {label}
    </button>
  );
}

function PermissionRow({ title, desc, isActive, isBlockedState, loading, onToggle }: any) {
  // isBlockedState means TRUE = BAD (red), FALSE = GOOD (green). Normal means TRUE = GOOD, FALSE = BAD.
  const isPositive = isBlockedState ? !isActive : isActive;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-[10px] text-[#8B949E] mt-1">{desc}</p>
      </div>
      <button 
        disabled={loading}
        onClick={onToggle}
        className={`w-14 h-8 rounded-full relative transition-colors border ${isPositive ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}
      >
        {loading ? (
          <CircleNotch className="w-4 h-4 animate-spin text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        ) : (
          <div className={`w-6 h-6 rounded-full absolute top-1/2 -translate-y-1/2 transition-all ${isPositive ? 'bg-green-500 right-1' : 'bg-red-500 left-1'}`}></div>
        )}
      </button>
    </div>
  );
}
