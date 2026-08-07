import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../../components/BackButton';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9F9] flex flex-col font-sans relative">
      {/* Setup Top Navbar */}
      <div className="w-full bg-white px-8 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
          <span className="font-bold text-xl text-[#07351A] tracking-tight">AL-TIJARA</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link href="/login" className="hover:text-[#07351A] transition-colors">Sign In</Link>
          <span className="text-[#0B913B]">عربي</span>
        </div>
      </div>

      {/* Setup Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-3xl relative">
          <BackButton />
          <div className="px-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
