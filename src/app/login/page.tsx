"use client";

import Image from 'next/image'
import { Fingerprint } from 'lucide-react'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { loginWithPassword, loginWithGoogle } from '../actions/auth'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="w-full max-w-[440px] mx-auto z-10 relative">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-slate-100 relative">
        <h1 className="text-3xl font-serif font-bold text-[#07351A] mb-8 text-center tracking-tight">
          Sign In to Al-Tijara
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50/50 text-red-600 text-[14px] rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form action={loginWithPassword} className="space-y-5">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3.5 border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3.5 border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
              required
            />
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-relaxed px-2 pt-2">
            This site is protected by reCAPTCHA and the Google <a href="#" className="text-[#0B913B] hover:underline">privacy policy</a> and <a href="#" className="text-[#0B913B] hover:underline">terms of service</a> apply.
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-[#07351A] hover:bg-[#106E37] text-white font-semibold rounded-lg text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 py-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-slate-400 text-sm">Or</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="w-full py-3.5 mb-3 bg-white border border-[#07351A] hover:bg-slate-50 text-[#07351A] font-semibold rounded-lg text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </form>

        <button
          type="button"
          className="w-full py-3.5 bg-white border border-[#07351A] hover:bg-slate-50 text-[#07351A] font-semibold rounded-lg text-[15px] transition-colors flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-5 h-5" />
          Sign in with UAE PASS
        </button>

        <div className="mt-8 flex justify-center">
          <a href="#" className="text-[#0B913B] text-[14px] font-medium hover:underline">Forgot password?</a>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center pb-12">
        <span className="text-slate-500 text-[14px]">
          Don't have an account yet? <Link href="/#signup" className="text-[#0B913B] font-medium hover:underline ml-1">Sign Up</Link>
        </span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen font-sans bg-[#F8F9F9] text-slate-900 relative overflow-x-hidden flex flex-col">
      {/* Subtle Background Graphic simulating the Sarwa curve */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[120%] h-[80%] bg-[#F0F4F2] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-[#FEF3C7] rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Top Bar */}
      <div className="w-full bg-[#07351A] text-[#F8F9F9] text-xs py-2 px-6 flex justify-end gap-6 relative z-10">
        <a href="#" className="hover:text-amber-400 transition-colors">عربى</a>
        <a href="#" className="hover:text-amber-400 transition-colors">Help Desk</a>
      </div>
      
      {/* Navbar with Logo */}
      <nav className="w-full z-40 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image 
                src="/images/logo.png" 
                alt="Al-Tijara Capital Logo" 
                width={180} 
                height={48} 
                className="object-contain h-10 w-auto cursor-pointer" 
                priority 
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-700">
            <a href="/#pricing" className="hover:text-[#07351A] transition-colors">Pricing</a>
            <a href="/#faq" className="hover:text-[#07351A] transition-colors">FAQ</a>
            <Link href="/" className="hover:text-[#07351A] transition-colors font-semibold">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-20 px-6 relative z-10 w-full">
        <Suspense fallback={<div className="w-full max-w-[400px] h-64 flex items-center justify-center text-[#07351A]">Loading...</div>}>
          <LoginContent />
        </Suspense>
      </main>
      
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  )
}
