"use client";

import Link from 'next/link';
import { Headset, Translate, UserCircle, Bell } from '@phosphor-icons/react/dist/ssr';

export default function TopUtilityBar() {
  return (
    <div className="w-full bg-[#07351A] dark:bg-slate-950 flex items-center justify-between py-4 px-6 lg:px-10 border-b border-[#0A4D26] dark:border-slate-800 transition-colors duration-300 shadow-sm z-50">
      
      {/* Brand / Logo Area */}
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center justify-center gap-3">
          <div className="relative w-36 sm:w-40 h-10 sm:h-12">
            <img 
              src="/images/logo.png" 
              alt="Al-Tijara" 
              className="w-full h-full object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
            />
          </div>
        </Link>
      </div>

      {/* Utilities Area */}
      <div className="hidden sm:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-widest uppercase text-white/70 dark:text-slate-400">
        
        <button className="flex items-center gap-2 hover:text-white transition-colors group relative">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#07351A] dark:border-slate-950"></span>
        </button>

        <div className="w-px h-4 bg-white/20 dark:bg-slate-700"></div>

        <button className="flex items-center gap-2 hover:text-white transition-colors group">
          <Headset className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Support</span>
        </button>

        <button className="flex items-center gap-2 hover:text-white transition-colors group">
          <Translate className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>EN</span>
        </button>

        <div className="w-px h-4 bg-white/20 dark:bg-slate-700"></div>

        <Link href="/dashboard/settings" className="flex items-center gap-2 hover:text-white transition-colors group">
          <UserCircle className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline text-white/90">Profile</span>
        </Link>

      </div>
    </div>
  );
}
