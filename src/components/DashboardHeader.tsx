"use client";

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import NotificationDropdown from './NotificationDropdown';

interface DashboardHeaderProps {
  firstName: string;
}

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const pathname = usePathname();



  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      {/* Mobile Top Bar (Notification) */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <NotificationDropdown />
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={fadeInItem} 
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 relative z-20 ${pathname === '/dashboard' ? 'pt-16 lg:pt-8' : 'pt-20 lg:pt-8 pb-4'}`}
      >
        <div className="hidden lg:block">
          {/* Empty block to maintain layout spacing on desktop if needed, or simply nothing */}
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <NotificationDropdown />
          
          {pathname === '/dashboard' && (
            <Link 
              href="/dashboard/investments"
              className="px-6 py-2.5 bg-gradient-to-tr from-[#D4AF37] to-[#FDE047] hover:scale-105 active:scale-95 text-black font-extrabold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2"
            >
              Invest Now <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          )}
        </div>
      </motion.div>
    </>
  );
}
