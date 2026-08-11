import { verifyOtp } from '../actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import AutoSubmitOtp from '../../components/AutoSubmitOtp'
import ResendTimer from '../../components/ResendTimer'

export default async function VerifyPage(props: { searchParams: Promise<{ email?: string, error?: string }> }) {
  const searchParams = await props.searchParams;
  const email = searchParams.email || '';
  const error = searchParams.error || '';

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

      {/* Top Navbar */}
      <nav className="w-full z-40 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image 
                src="/images/logo.png" 
                alt="Al-Tijara Capital Logo" 
                width={160} 
                height={42} 
                className="object-contain h-9 w-auto" 
                priority 
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-slate-600">
            <Link href="/login" className="hover:text-[#07351A] transition-colors">Sign In</Link>
            <span className="text-[#0B913B] cursor-pointer">عربي</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 relative z-10 w-full mb-16">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-[440px] text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6">
            <svg className="w-8 h-8 text-[#07351A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#07351A] font-serif tracking-tight mb-3">
            Verify Identity
          </h2>
          <p className="text-[15px] text-slate-500 font-medium leading-relaxed px-4">
            We sent a secure code to <br className="hidden sm:block" />
            <span className="font-semibold text-slate-900">{email}</span>
          </p>

          {error && !error.toLowerCase().includes('wait after') && !error.toLowerCase().includes('resent') && (
            <div className="mt-6 mx-4 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[14px] rounded-2xl border border-red-100/50 text-center font-medium shadow-sm">
              {error}
            </div>
          )}
          
          {error && error.toLowerCase().includes('resent') && (
            <div className="mt-6 mx-4 p-4 bg-green-50/80 backdrop-blur-sm text-[#0B913B] text-[14px] rounded-2xl border border-green-100/50 text-center font-medium shadow-sm">
              {error}
            </div>
          )}
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[440px] px-4 sm:px-0">
          <div className="bg-white/80 backdrop-blur-2xl py-10 px-6 shadow-[0_8px_40px_rgb(0,0,0,0.06)] sm:rounded-3xl sm:px-12 border border-white/40 relative overflow-hidden">
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#D4AF37] to-[#07351A]"></div>
            
            <div className="w-full flex justify-center py-2 mb-6">
              <AutoSubmitOtp email={email} action={verifyOtp} />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-center">
              <ResendTimer email={email} initialError={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
