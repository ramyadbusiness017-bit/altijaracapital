"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  Copy,
  CheckCircle,
  Users,
  UserPlus,
  ShareNetwork,
  UsersThree,
  ArrowRight,
  Gift,
  CircleNotch
} from '@phosphor-icons/react/dist/ssr';
import toast from 'react-hot-toast';

interface ReferralsOverviewProps {
  firstName: string;
  userId: string;
  referralCode?: string;
  referrals?: any[];
  referralEarnings?: any[];
}

export default function ReferralsOverview({ 
  firstName, 
  userId,
  referralCode = '',
  referrals = [],
  referralEarnings = []
}: ReferralsOverviewProps) {
  
  const [copied, setCopied] = useState(false);

  // Use the referral code from the DB, fallback to vanity
  const codeToUse = referralCode || `${firstName}${userId.substring(0,2)}`.replace(/\s+/g, '');
  const referralLink = `https://altijara.capital/register?ref=${codeToUse}`;
  
  // High contrast QR code to match the dark theme
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${referralLink}&bgcolor=0D1117&color=D4AF37&margin=0`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Al Tijara Capital',
          text: 'Use my link to join Al Tijara Capital and we both get rewarded when you fund your account!',
          url: referralLink,
        });
        toast.success('Thanks for sharing!');
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  // Compute metrics
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.has_funded).length;
  const pendingReferrals = totalReferrals - activeReferrals;
  const totalEarningsAmt = referralEarnings.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-6 min-h-screen">
      
      {/* Top Header */}
      {/* Action Button Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-end mb-2 relative z-10"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4" weight="bold" />
            Invite Friends
          </button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#D4AF37]" weight="fill" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 uppercase tracking-wider">Total Earnings</h3>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">${totalEarningsAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center">
            <UsersThree className="w-5 h-5 text-blue-400" weight="fill" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 uppercase tracking-wider">Registered Users</h3>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{totalReferrals}</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#22C55E]" weight="fill" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 uppercase tracking-wider">Active Investors</h3>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{activeReferrals}</h2>
          </div>
        </motion.div>
      </div>

      {/* Referral Link & QR Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0D1117]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] flex flex-col md:flex-row overflow-hidden shadow-2xl relative z-10"
      >
        
        {/* Link Side */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
          <h3 className="text-lg font-bold text-white mb-2">Your Invite Link</h3>
          <p className="text-sm font-medium text-[#8B949E] mb-8">Share your unique link directly with friends or on social media to start earning $5 per funded user.</p>
          
          <div className="w-full relative flex items-center group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              className="w-full relative z-10 bg-[#161B22] border border-white/10 rounded-xl py-4 pl-5 pr-16 text-sm font-mono text-[#D4AF37] tracking-tight focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
            <button 
              onClick={handleCopy}
              className="absolute z-20 right-2 p-2.5 text-[#8B949E] hover:text-[#D4AF37] bg-black/40 hover:bg-black/60 border border-white/5 rounded-lg transition-all flex items-center justify-center active:scale-95"
            >
              {copied ? <CheckCircle weight="fill" className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" weight="bold" />}
            </button>
          </div>

          <button 
            onClick={handleShare}
            className="md:hidden mt-6 w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#Eab308] hover:to-[#D4AF37] text-black font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 active:scale-95"
          >
            <ShareNetwork className="w-5 h-5" weight="bold" />
            Share Link Directly
          </button>
        </div>

        {/* QR Side */}
        <div className="hidden md:flex p-8 md:p-10 items-center justify-center gap-8 bg-gradient-to-br from-[#161B22]/80 to-[#0D1117] min-w-[320px] relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[#D4AF37]/5 pointer-events-none" />
          <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={handleCopy}>
             <img src={qrCodeUrl} alt="Referral QR Code" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-base font-bold text-white mb-2">Scan to Register</h4>
            <p className="text-xs font-medium text-[#8B949E] leading-relaxed">
              Users can scan this code to instantly attach to your network on mobile.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Network List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0D1117]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Your Network</h3>
            <p className="text-sm font-medium text-[#8B949E]">Track users who have signed up with your link.</p>
          </div>
          <div className="text-xs font-extrabold bg-[#Eab308]/10 px-3.5 py-2 rounded-lg text-[#Eab308] border border-[#Eab308]/20 flex items-center gap-2">
            <CircleNotch className="w-3.5 h-3.5 animate-spin" weight="bold" />
            {pendingReferrals} Pending
          </div>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-4 gap-4 pb-4 px-4 border-b border-white/5 text-[11px] font-extrabold text-[#8B949E] uppercase tracking-widest">
          <div>User</div>
          <div>Date Joined</div>
          <div>Status</div>
          <div>Reward</div>
        </div>

        {/* User Rows */}
        <div className="flex flex-col">
          <AnimatePresence>
            {referrals.length === 0 ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="p-16 flex flex-col items-center justify-center text-center"
               >
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                   <Users className="w-8 h-8 text-[#8B949E]" weight="light" />
                 </div>
                 <h4 className="text-base font-bold text-white mb-2">No Referrals Yet</h4>
                 <p className="text-sm font-medium text-[#8B949E] max-w-sm mb-6">
                   You haven't referred anyone yet. Share your link with friends to start earning rewards instantly!
                 </p>
                 <button 
                   onClick={handleShare}
                   className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-2"
                 >
                   <ShareNetwork className="w-4 h-4" weight="bold" />
                   Share Now
                 </button>
               </motion.div>
            ) : referrals.map((ref, index) => (
              <motion.div 
                key={ref.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-1 md:grid-cols-4 gap-4 py-5 px-4 items-center hover:bg-white/5 transition-colors rounded-xl ${index !== referrals.length - 1 ? 'border-b border-white/5 md:border-none' : ''}`}
              >
                
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ${ref.has_funded ? 'bg-gradient-to-br from-[#22C55E] to-emerald-700 text-white' : 'bg-[#161B22] text-[#8B949E] border border-white/10'}`}>
                    {ref.first_name ? ref.first_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {ref.first_name ? `${ref.first_name} ${ref.last_name ? ref.last_name.charAt(0) + '.' : ''}` : 'Unknown User'}
                    </p>
                    <p className="text-[11px] font-medium text-[#8B949E] md:hidden mt-0.5">{new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="md:hidden ml-auto text-right">
                     <p className={`text-[11px] font-extrabold uppercase px-2 py-1 rounded-md border ${ref.has_funded ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : 'text-[#Eab308] bg-[#Eab308]/10 border-[#Eab308]/20'}`}>
                       {ref.has_funded ? 'Funded' : 'Pending'}
                     </p>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-[#8B949E]">
                    {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="hidden md:block">
                  {ref.has_funded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[11px] font-extrabold uppercase tracking-wide">
                      <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                      Funded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#Eab308]/10 border border-[#Eab308]/30 text-[#Eab308] text-[11px] font-extrabold uppercase tracking-wide">
                      <CircleNotch className="w-3.5 h-3.5 animate-spin" weight="bold" />
                      Pending 
                    </span>
                  )}
                </div>
                
                <div className="hidden md:block">
                  <p className={`text-sm font-extrabold ${ref.has_funded ? 'text-[#D4AF37]' : 'text-slate-600'}`}>
                    {ref.has_funded ? '+$5.00 USDT' : '$0.00 USDT'}
                  </p>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}
