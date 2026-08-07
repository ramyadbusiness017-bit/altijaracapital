"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  House, 
  Wallet,
  ChartLineUp,
  Users,
  Receipt,
  Gear,
  CaretDown,
  List,
  X,
  User,
  ShieldCheck,
  Question,
  SignOut
} from '@phosphor-icons/react/dist/ssr';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  firstName?: string;
  lastName?: string;
  portfolioValue?: number;
  avatarUrl?: string;
}

export default function Sidebar({ firstName = 'User', lastName = '', portfolioValue = 0, avatarUrl }: SidebarProps = {}) {
  const pathname = usePathname();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: House },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Investments', href: '/dashboard/investments', icon: ChartLineUp },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Settings', href: '/dashboard/settings', icon: Gear },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#161B22] border border-[#30363D] rounded-full flex items-center justify-center text-white shadow-sm hover:bg-[#1C2128] transition-colors"
      >
        {isOpen ? <X weight="bold" className="w-5 h-5" /> : <List weight="bold" className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static top-0 left-0 z-40 h-full w-[280px] bg-[#070A0D] border-r border-[#1C2128]
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="pt-10 pb-8 flex justify-center">
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
            <div className="relative w-40 h-14">
              <img src="/images/logo.png" alt="Al-Tijara" className="w-full h-full object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(42%) saturate(459%) hue-rotate(352deg) brightness(90%) contrast(85%)' }} />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#101913] text-white border border-[#14291A]' 
                    : 'text-[#8B949E] hover:text-white hover:bg-[#101913]/50'
                }`}
              >
                <Icon weight={isActive ? "fill" : "regular"} className={`w-5 h-5 ${isActive ? 'text-[#22C55E]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Portfolio Value & Profile */}
        <div className="p-4 space-y-4">
          
          {/* Total Portfolio Card */}
          <div className="p-4 bg-[#0D1117] border border-[#1C2128] rounded-2xl relative overflow-hidden group hover:border-[#30363D] transition-colors">
            <h4 className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider mb-1">Total Portfolio Value</h4>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-bold text-white tracking-tight">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolioValue)}
              </span>
            </div>
            
            {/* Fake Sparkline using an SVG for precise mockup matching */}

            
            {portfolioValue > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#22C55E]">Active</span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            {isProfileOpen && (
              <div className="absolute bottom-[calc(100%+16px)] left-0 w-[240px] z-50 transform transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Downward Caret pointing to Profile Avatar */}
                <div className="absolute -bottom-[7px] left-[25px] w-4 h-4 bg-[#0D1117] border-b border-r border-[#1C2128] transform rotate-45 z-10"></div>
                
                {/* Dropdown Content */}
                <div className="w-full bg-[#0D1117] border border-[#1C2128] rounded-2xl shadow-2xl overflow-hidden relative z-20">
                  <div className="p-4 border-b border-[#1C2128]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C2128] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8B949E] uppercase border border-[#30363D]">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        `${firstName.charAt(0)}${lastName.charAt(0)}`
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white leading-tight capitalize">{firstName} {lastName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-[#8B949E]">Investor</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#161B22] text-[#8B949E] hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Profile</p>
                      <p className="text-[10px] text-[#8B949E]">View and edit your profile</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#161B22] text-[#8B949E] hover:text-white transition-colors">
                    <Gear className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Account Settings</p>
                      <p className="text-[10px] text-[#8B949E]">Manage your account</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#161B22] text-[#8B949E] hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Security</p>
                      <p className="text-[10px] text-[#8B949E]">Password, 2FA, and more</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/support" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#161B22] text-[#8B949E] hover:text-white transition-colors">
                    <Question className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Help & Support</p>
                      <p className="text-[10px] text-[#8B949E]">Get help and support</p>
                    </div>
                  </Link>
                </div>
                  <div className="p-2 border-t border-[#1C2128]">
                    <form action="/auth/signout" method="POST">
                      <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors">
                        <SignOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#101913] transition-colors border border-transparent hover:border-[#1C2128]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C2128] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8B949E] uppercase border border-[#30363D]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    `${firstName.charAt(0)}${lastName.charAt(0)}`
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white leading-tight capitalize">{firstName} {lastName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-[#8B949E]">Investor</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>
                  </div>
                </div>
              </div>
              <CaretDown className={`w-4 h-4 text-[#8B949E] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
