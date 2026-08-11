"use client";

import Image from 'next/image'
import { Fingerprint } from 'lucide-react'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { loginWithPassword, loginWithGoogle } from '../actions/auth'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[440px] mx-auto z-10 relative"
    >
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 md:p-10 border border-white/40 relative overflow-hidden">
        {/* Subtle inner top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
        
        <div className="flex justify-center mb-6">
          <Image 
            src="/images/logo.png" 
            alt="Al-Tijara Capital Logo" 
            width={64} 
            height={64} 
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#07351A] mb-2 text-center tracking-tight">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-center text-[15px] mb-8 font-medium">
          Sign in to manage your wealth portfolio
        </p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[14px] rounded-2xl border border-red-100/50 text-center font-medium shadow-sm"
          >
            {error}
          </motion.div>
        )}

        <form action={loginWithPassword} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
              required
            />
          </div>

          <div className="flex justify-end pt-1 pb-2">
            <a href="#" className="text-[#0B913B] text-[13.5px] font-semibold hover:text-[#07351A] transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[15px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 py-7">
          <div className="h-px bg-slate-200/70 flex-1"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
          <div className="h-px bg-slate-200/70 flex-1"></div>
        </div>

        <div className="space-y-3">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-[15px] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
          </form>

          <button
            type="button"
            className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-[15px] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            <Fingerprint className="w-5 h-5 text-slate-500" />
            UAE PASS
          </button>
        </div>

        <div className="mt-8 text-[11px] text-slate-400 text-center leading-relaxed px-2">
          Secured by reCAPTCHA. <a href="#" className="hover:text-slate-600 underline underline-offset-2">Privacy</a> & <a href="#" className="hover:text-slate-600 underline underline-offset-2">Terms</a> apply.
        </div>
      </div>
      
      <div className="mt-8 flex justify-center pb-12">
        <span className="text-slate-500 text-[14.5px] font-medium">
          New to Al-Tijara? <Link href="/#signup" className="text-[#07351A] font-bold hover:text-[#0B913B] transition-colors ml-1">Create an account</Link>
        </span>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-900 relative flex flex-col selection:bg-[#07351A] selection:text-white">
      
      {/* Sleek Gradient Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#FAFAFA]">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] -left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-[#07351A]/5 to-transparent rounded-full blur-[120px] opacity-80"></div>
        <div className="absolute bottom-0 left-[20%] w-[80vw] h-[40vw] bg-gradient-to-t from-[#0B913B]/5 to-transparent rounded-full blur-[100px] opacity-60"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Top Bar */}
      <div className="w-full bg-[#07351A] text-[#F8F9F9] text-xs py-2.5 px-6 flex justify-end gap-6 relative z-10 font-medium tracking-wide">
        <a href="#" className="hover:text-[#D4AF37] transition-colors">عربى</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Help Desk</a>
      </div>
      
      {/* Navbar with Logo */}
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
          <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-slate-600">
            <a href="/#pricing" className="hover:text-[#07351A] transition-colors">Pricing</a>
            <a href="/#faq" className="hover:text-[#07351A] transition-colors">FAQ</a>
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#07351A] hover:border-[#07351A]/30 hover:shadow-sm transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative z-10 w-full min-h-[600px]">
        <Suspense fallback={
          <div className="w-full max-w-[440px] h-[500px] bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#07351A]/20 border-t-[#07351A] rounded-full animate-spin"></div>
          </div>
        }>
          <LoginContent />
        </Suspense>
      </main>
      
      <div className="relative z-10 mt-auto border-t border-slate-200/50 bg-white/50 backdrop-blur-lg">
        <Footer />
      </div>
    </div>
  )
}
