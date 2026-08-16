"use client";

import GeofenceModal from "../components/GeofenceModal";
import Footer from "../components/Footer";
import { ShieldCheck, LineChart, Building2, Briefcase, HeadphonesIcon, Fingerprint } from "lucide-react";
import Image from "next/image";
import { startOnboarding } from "./actions/setup";
import { loginWithGoogle } from "./actions/auth";
import SubmitButton from "../components/SubmitButton";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const refCode = searchParams.get('ref');

  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const countries = useMemo(() => {
    return getCountries().map(code => {
      let name: string = code;
      try {
        name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
      } catch (e) {}
      return {
        code,
        flagUrl: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
        dialCode: `+${getCountryCallingCode(code)}`,
        name
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === 'AE') || countries[0]
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPhoneDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.dialCode.includes(searchQuery)
  );

  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-900 relative overflow-hidden flex flex-col">
      {/* Elegant Light Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#F0F5F2] rounded-full blur-[100px] opacity-80 animate-pulse-slow"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FEF6D8] rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-0 right-[20%] w-[40%] h-[40%] bg-[#F0F5F2] rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
      </div>

      {/* Top Bar */}
      <div className="w-full bg-[#07351A] text-white/90 text-[11px] font-medium tracking-wide py-2 px-6 flex justify-end gap-6 relative z-10">
        <a href="#" className="hover:text-[#D4AF37] transition-colors">عربى</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Help Desk</a>
      </div>

      {/* Navbar */}
      <nav className="w-full z-40 bg-transparent relative pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Al-Tijara Capital Logo" 
              width={180} 
              height={48} 
              className="object-contain h-9 w-auto hover:opacity-90 transition-opacity" 
              priority 
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <a href="#pricing" className="hover:text-[#07351A] transition-colors">Solutions</a>
            <a href="#faq" className="hover:text-[#07351A] transition-colors">FAQ</a>
            <a href="/login" className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-[#07351A] hover:border-[#07351A]/30 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              Sign In
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20 relative z-10 w-full flex items-center">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center w-full">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[45%] flex-shrink-0"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-white relative">
              <h1 className="text-3xl md:text-[34px] font-serif font-bold text-[#07351A] mb-3 tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-500 text-[14.5px] mb-8 font-medium">
                Enter your details exactly as they appear on your official government ID.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-2xl border border-red-100 text-center font-medium shadow-sm">
                  {error}
                </div>
              )}

              <form action={startOnboarding} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      name="firstName"
                      type="text" 
                      placeholder="First name" 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <input 
                      name="lastName"
                      type="text" 
                      placeholder="Last name" 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Email address" 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex gap-0 relative" ref={dropdownRef}>
                  <button 
                    type="button"
                    onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-4 border border-r-0 border-slate-200/60 rounded-l-2xl bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 z-10"
                  >
                    <img src={selectedCountry.flagUrl} alt={selectedCountry.code} className="w-5 h-auto rounded-[2px] object-cover shadow-sm" />
                    <span className="text-[13px]">{selectedCountry.dialCode}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {phoneDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[340px] bg-white border border-slate-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 max-h-72 flex flex-col py-2">
                      <div className="px-3 pb-2 border-b border-slate-50">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#07351A]/40 focus:ring-2 focus:ring-[#07351A]/10 font-medium"
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                            onClick={() => {
                              setSelectedCountry(country);
                              setPhoneDropdownOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <img src={country.flagUrl} alt={country.code} className="w-5 h-auto rounded-[2px] object-cover shadow-sm flex-shrink-0" />
                            <span className="text-[13px] text-slate-700 flex-1 truncate font-medium">{country.name}</span>
                            <span className="text-[12px] text-slate-400 font-semibold">{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="50 123 4567" 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-r-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium -ml-[1px]"
                  />
                  <input type="hidden" name="countryCode" value={selectedCountry.dialCode} />
                  {refCode && <input type="hidden" name="referredBy" value={refCode} />}
                </div>
                
                <div className="pt-2">
                  <SubmitButton 
                    text="Continue securely" 
                    className="w-full py-4 bg-[#07351A] hover:bg-[#0A4D25] text-white font-bold rounded-2xl text-[14.5px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] active:scale-[0.98]"
                  />
                </div>

                <div className="flex items-center justify-center gap-4 py-3">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Or</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

              </form>

              <form action={loginWithGoogle} className="mt-1">
                {refCode && <input type="hidden" name="referredBy" value={refCode} />}
                <button 
                  type="submit"
                  className="w-full py-3.5 mb-3 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-[14.5px] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </form>

              <button 
                type="button"
                className="w-full py-3.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-[14.5px] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
              >
                <Fingerprint className="w-5 h-5 text-slate-500" />
                Sign up with UAE PASS
              </button>

              <div className="mt-6 text-[11.5px] text-slate-400 text-center leading-relaxed px-2">
                Secured by reCAPTCHA. <Link href="/privacy" className="hover:text-slate-600 underline underline-offset-2">Privacy</Link> & <Link href="/terms" className="hover:text-slate-600 underline underline-offset-2">Terms</Link> apply.
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <span className="text-slate-500 text-[14px] font-medium">
                Already have an account? <a href="/login" className="text-[#07351A] font-bold hover:text-[#0B913B] transition-colors ml-1">Sign in</a>
              </span>
            </div>
          </motion.div>

          {/* Right Column: Premium Features */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[55%] pt-4"
          >
            <div className="mb-10 pl-2">
              <div className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#B3932D] text-[12px] font-bold tracking-wider uppercase rounded-full mb-4 border border-[#D4AF37]/20">
                Wealth Management
              </div>
              <h1 className="text-[40px] lg:text-[52px] font-serif font-bold text-[#0A140A] mb-4 leading-[1.1] tracking-tight">
                Deploy your capital <br/><span className="text-[#07351A]">with precision.</span>
              </h1>
              <p className="text-[16px] text-slate-500 leading-relaxed max-w-md font-medium">
                Access institutional-grade investment portfolios, automated yields, and concierge support.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-start gap-4 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-default">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#07351A]/5 flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-5 h-5 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[14.5px] mb-1">Algorithmic Precision</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Execute trades across thousands of high-yield assets globally.</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-start gap-4 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-default">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#07351A]/5 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[14.5px] mb-1">Structural Yield</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Invest in diversified, physical Dubai real estate portfolios.</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-start gap-4 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-default">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#0B913B]/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-[#0B913B]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[14.5px] mb-1">USDT Liquid Account</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Generate compounding monthly interest on idle capital.</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-start gap-4 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-default">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[#07351A]/5 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[14.5px] mb-1">Institutional Security</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Confidently manage wealth with bank-level AES-256 encryption.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <GeofenceModal />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03150A] flex items-center justify-center"></div>}>
      <HomeContent />
    </Suspense>
  )
}