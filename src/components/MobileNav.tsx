"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Wallet, ChartLineUp, Users, Receipt } from '@phosphor-icons/react/dist/ssr';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: House },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Investments', href: '/dashboard/investments', icon: ChartLineUp },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  ];

  return (
    <nav className="w-full bg-[#0D1117] border-t border-[#1C2128] pb-safe shadow-2xl">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#22C55E]' 
                  : 'text-[#8B949E] hover:text-white'
              }`}
            >
              <div className={`transition-all ${isActive ? 'scale-110' : ''}`}>
                <Icon weight={isActive ? "fill" : "regular"} className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'tracking-wide' : 'tracking-normal'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
