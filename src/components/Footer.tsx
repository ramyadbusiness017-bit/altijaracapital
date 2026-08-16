import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-16 border-t border-slate-100 relative z-10">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="mb-10">
          <Image 
            src="/images/logo.png" 
            alt="Al-Tijara Capital Logo" 
            width={150} 
            height={40} 
            className="object-contain" 
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-10 mb-12">
          <div className="flex flex-col space-y-3.5">
            <a href="#" className="text-[#07351A] font-medium text-[15px] hover:text-[#0B913B] transition-colors">Home</a>
            <a href="#" className="text-[#07351A] font-medium text-[15px] hover:text-[#0B913B] transition-colors">Trade</a>
            <a href="#" className="text-[#07351A] font-medium text-[15px] hover:text-[#0B913B] transition-colors">Invest</a>
          </div>
          
          <div className="flex flex-col space-y-3.5">
            <a href="#" className="text-[#07351A] font-medium text-[15px] hover:text-[#0B913B] transition-colors">Save</a>
            <a href="#" className="text-[#07351A] font-medium text-[15px] hover:text-[#0B913B] transition-colors">Pricing</a>
          </div>

          <div className="flex flex-col space-y-3.5">
            <h4 className="text-[#07351A] font-medium text-[15px]">Discover</h4>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Blog</a>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Retirement calculator</a>
          </div>

          <div className="flex flex-col space-y-3.5">
            <h4 className="text-[#07351A] font-medium text-[15px]">About</h4>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Who we are</a>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Contact</a>
          </div>

          <div className="flex flex-col space-y-3.5">
            <h4 className="text-[#07351A] font-medium text-[15px]">Quick Links</h4>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Data management</a>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Careers</a>
            <a href="#" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">FAQ</a>
            <Link href="/privacy" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Privacy policy</Link>
            <Link href="/terms" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Disclaimer notice</Link>
            <Link href="/login" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Sign In</Link>
            <Link href="/" className="text-[#07351A] text-[13px] hover:text-[#0B913B] transition-colors">Sign up</Link>
          </div>

          <div className="flex flex-col space-y-3.5">
            <h4 className="text-[#07351A] font-medium text-[15px]">Socials</h4>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#" className="w-8 h-8 rounded-full bg-[#07351A] flex items-center justify-center text-white hover:bg-[#106E37] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#07351A] flex items-center justify-center text-white hover:bg-[#106E37] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#07351A] flex items-center justify-center text-white hover:bg-[#106E37] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#07351A] flex items-center justify-center text-white hover:bg-[#106E37] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#07351A] flex items-center justify-center text-white hover:bg-[#106E37] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.078 0 12 0 12s0 3.922.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.922 24 12 24 12s0-3.922-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
            <a href="#" className="text-[#07351A] font-medium text-[14px] hover:text-[#0B913B] transition-colors mt-2">عربى</a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 text-[11px] text-[#737D84] leading-relaxed space-y-4 max-w-none text-justify">
          <p>
            Al-Tijara Capital (Digital Wealth) Limited is regulated by the Dubai Financial Services Authority ("DFSA") in the Dubai International Financial Centre ("DIFC") and holds a Category 3C license with a Retail Client and Holding and Controlling Clients Investments and Money Endorsement. Al-Tijara Capital (Digital Wealth) Limited's registered address is Level 15, Gate Building, DIFC, Dubai, United Arab Emirates.
          </p>
          <p>
            <a href="#" className="underline hover:text-slate-600">https://www.dfsa.ae/public-register/firm/al-tijara-capital-digital-wealth-limited</a>
          </p>
          <p>
            Al-Tijara Classic, Al-Tijara X, Al-Tijara Crypto, Al-Tijara Trade, and Al-Tijara Save are products offered through Al-Tijara Capital (Digital Wealth) Limited that is regulated by the DFSA in the DIFC.
          </p>
          <p>
            All Promotional materials are provided from/by Al-Tijara Capital (Digital Wealth) Limited and is intended only for jurisdictions where it is authorised to provide services and does not constitute an offer or solicitation to provide services in any jurisdiction where it is not permitted to do so. Al-Tijara is not a bank. We can unlock high-yield accounts through our banking partners. Past performance is no guarantee of future results. Historical returns, expected returns, and probability projections are provided for informational and illustrative purposes and may not reflect actual future performance. Information contained on this website is of a general nature only and does not consider your financial objectives or personal circumstances. All investing involves risk, including the possible loss of money you invest.
          </p>
          <p>
            Please visit our Disclaimer Notice page for further information.
          </p>
          <p className="pt-2">
            © {new Date().getFullYear()} Al-Tijara Capital (Digital Wealth) Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
