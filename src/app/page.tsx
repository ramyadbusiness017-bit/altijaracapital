"use client";

import GeofenceModal from "../components/GeofenceModal";
import Footer from "../components/Footer";
import { ShieldCheck, ArrowRight, LockKeyhole, LineChart, Building2, Briefcase, HeadphonesIcon, Fingerprint } from "lucide-react";
import Image from "next/image";
import { startOnboarding } from "./actions/setup";
import { loginWithGoogle } from "./actions/auth";
import SubmitButton from "../components/SubmitButton";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import { useSearchParams } from 'next/navigation';

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

  // Close dropdown when clicking outside
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
    <div className="min-h-screen font-sans bg-[#F8F9F9] text-slate-900 relative overflow-hidden">
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

      {/* Navbar */}
      <nav className="w-full z-40 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Al-Tijara Capital Logo" 
              width={180} 
              height={48} 
              className="object-contain h-10 w-auto" 
              priority 
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-700">
            <a href="#pricing" className="hover:text-[#07351A] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#07351A] transition-colors">FAQ</a>
            <a href="/login" className="hover:text-[#07351A] transition-colors font-semibold">Sign In</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-slate-100 relative">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#07351A] mb-2 tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-600 text-[15px] mb-8 leading-relaxed">
                Please enter your first and last name as written in your official documents.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50/50 text-red-600 text-[14px] rounded-xl border border-red-100 text-center font-medium">
                  {error}
                </div>
              )}

              <form action={startOnboarding} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      name="firstName"
                      type="text" 
                      placeholder="First name" 
                      required
                      className="w-full px-4 py-3.5 border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <input 
                      name="lastName"
                      type="text" 
                      placeholder="Last name" 
                      required
                      className="w-full px-4 py-3.5 border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Email" 
                    required
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-0 relative" ref={dropdownRef}>
                  <button 
                    type="button"
                    onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-3 border border-r-0 border-slate-200 rounded-l-lg bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:ring-1 focus:ring-[#07351A]"
                  >
                    <img src={selectedCountry.flagUrl} alt={selectedCountry.code} className="w-5 h-auto rounded-[2px] object-cover shadow-sm" />
                    <span className="text-[14px]">{selectedCountry.dialCode}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {phoneDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-[340px] bg-white border border-slate-200 rounded-lg shadow-2xl z-50 max-h-72 flex flex-col py-2">
                      <div className="px-3 pb-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Search country or code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-[#07351A]"
                        />
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F8F9F9] transition-colors text-left border-b border-slate-50 last:border-0"
                            onClick={() => {
                              setSelectedCountry(country);
                              setPhoneDropdownOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <img src={country.flagUrl} alt={country.code} className="w-5 h-auto rounded-[2px] object-cover shadow-sm flex-shrink-0" />
                            <span className="text-[13px] text-slate-700 flex-1 truncate">{country.name}</span>
                            <span className="text-[13px] text-slate-500 font-medium">{country.dialCode}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No countries found</div>
                        )}
                      </div>
                    </div>
                  )}

                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="50 123 4567" 
                    required
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-r-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
                  />
                  <input type="hidden" name="countryCode" value={selectedCountry.dialCode} />
                  {refCode && <input type="hidden" name="referredBy" value={refCode} />}
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  This site is protected by reCAPTCHA and the Google <a href="#" className="text-[#0B913B] hover:underline">privacy policy</a> and <a href="#" className="text-[#0B913B] hover:underline">terms of service</a> apply.
                </div>
                
                <div className="pt-2">
                  <a href="#" className="text-[#0B913B] text-[13px] font-medium hover:underline">Am I eligible?</a>
                </div>

                <SubmitButton text="Sign up" />

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-slate-400 text-sm">Or</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

              </form>

              <form action={loginWithGoogle} className="mt-4">
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
                Sign up with UAE PASS
              </button>

              <div className="text-center text-[11px] text-slate-500 pt-3">
                  Clicking Sign up accepts <a href="#" className="text-[#0B913B] hover:underline">Terms of Use</a>
                </div>

                <div className="text-center pt-2">
                  <a href="/login" className="text-[#0B913B] text-[13px] font-medium hover:underline">Already have an account?</a>
                </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full lg:w-[55%] pt-6 lg:pt-12">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Smart Investing for the Elite</h3>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#0A140A] mb-6 leading-tight tracking-tight">
              Deploy Your Capital to Work
            </h1>
            <p className="text-[17px] text-slate-600 mb-12 leading-relaxed max-w-lg">
              Choose the investment approach that is right for you, and build the financial future you want.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <LineChart className="w-6 h-6 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">Algorithmic Precision</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Execute trades across thousands of high-yield assets</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <Building2 className="w-6 h-6 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">Structural Yield</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Invest in diversified physical Dubai portfolios</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <Briefcase className="w-6 h-6 text-[#0B913B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">USDT Liquid Account</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Generate high monthly interest on idle capital</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <HeadphonesIcon className="w-6 h-6 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">Concierge Support</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Dedicated liaisons always ready to assist you</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <ShieldCheck className="w-6 h-6 text-[#07351A]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">Institutional Security</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Confidently manage wealth with bank-level encryption</p>
                </div>
              </div>
              
              <div className="p-5 flex items-center text-[#07351A] font-semibold text-[15px]">
                and more...
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <GeofenceModal />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9F9] flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}