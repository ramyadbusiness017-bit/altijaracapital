"use client";

import Image from 'next/image'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { requestPasswordReset } from '../actions/auth'
import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Move searchParams usage into a separate client component
import { useSearchParams } from 'next/navigation'

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[440px] mx-auto z-10 relative"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 md:p-10 border border-white/60 relative overflow-hidden">
        
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
          Reset Password
        </h1>
        <p className="text-slate-500 text-center text-[14.5px] mb-8 font-medium">
          Enter your email address to receive a secure password reset link.
        </p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-2xl border border-red-100 text-center font-medium shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-5 bg-green-50 text-green-700 text-[13.5px] rounded-2xl border border-green-100 text-center font-medium shadow-sm leading-relaxed"
          >
            Password reset link sent! Please check your email inbox and spam folder.
          </motion.div>
        ) : (
          <form action={requestPasswordReset} className="space-y-4">
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-2 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[14.5px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Send Reset Link
            </button>
          </form>
        )}

      </div>
      
      <div className="mt-8 flex justify-center pb-12">
        <span className="text-slate-500 text-[14px] font-medium">
          Remembered it? <Link href="/login" className="text-[#07351A] font-bold hover:text-[#0B913B] transition-colors ml-1">Sign In</Link>
        </span>
      </div>
    </motion.div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-900 relative flex flex-col selection:bg-[#07351A] selection:text-white">
      
      {/* Elegant Light Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#F0F5F2] rounded-full blur-[100px] opacity-80 animate-pulse-slow"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FEF6D8] rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-0 right-[20%] w-[40%] h-[40%] bg-[#F0F5F2] rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative z-10 w-full min-h-[600px]">
        {/* We must wrap the component using useSearchParams in Suspense */}
        <Suspense fallback={
          <div className="w-full max-w-[440px] h-[500px] bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/60 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#07351A]/20 border-t-[#07351A] rounded-full animate-spin"></div>
          </div>
        }>
          <ForgotPasswordContent />
        </Suspense>
      </main>
      
      <div className="relative z-10 mt-auto border-t border-slate-200/50 bg-white/50 backdrop-blur-lg">
        <Footer />
      </div>
    </div>
  )
}
