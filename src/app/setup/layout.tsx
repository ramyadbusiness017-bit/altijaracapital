import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../../components/BackButton';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-900 relative flex flex-col selection:bg-[#07351A] selection:text-white overflow-hidden">
      
      {/* Sleek Gradient Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#FAFAFA]">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] -left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-[#07351A]/5 to-transparent rounded-full blur-[120px] opacity-80"></div>
        <div className="absolute bottom-0 left-[20%] w-[80vw] h-[40vw] bg-gradient-to-t from-[#0B913B]/5 to-transparent rounded-full blur-[100px] opacity-60"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Setup Top Navbar */}
      <nav className="w-full z-40 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Image 
                src="/images/logo.png" 
                alt="Al-Tijara Capital Logo" 
                width={36} 
                height={36} 
                className="object-contain" 
              />
              <span className="font-bold text-xl text-[#07351A] tracking-tight">AL-TIJARA</span>
            </Link>
          </div>
          <div className="flex items-center gap-6 text-[14px] font-medium text-slate-500">
            <Link href="/login" className="hover:text-[#07351A] transition-colors">Sign In</Link>
            <span className="text-[#0B913B] cursor-pointer">عربي</span>
          </div>
        </div>
      </nav>

      {/* Setup Content Area */}
      <div className="flex-1 flex flex-col items-center py-12 p-4 sm:p-6 relative z-10 overflow-y-auto">
        <div className="w-full max-w-3xl relative">
          <BackButton />
          
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/40 relative overflow-hidden mt-6">
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#D4AF37] to-[#07351A]"></div>
            
            <div className="px-6 py-10 sm:px-12 sm:py-16">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
