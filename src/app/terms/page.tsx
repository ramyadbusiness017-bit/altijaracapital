import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="w-full bg-[#07351A] text-white/90 text-[11px] font-medium tracking-wide py-2 px-6 flex justify-end gap-6 relative z-10">
        <a href="#" className="hover:text-[#D4AF37] transition-colors">عربى</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Help Desk</a>
      </div>

      {/* Navbar */}
      <nav className="w-full z-40 bg-white border-b border-slate-200/50 sticky top-0 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
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
          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <Link href="/login" className="px-5 py-2.5 rounded-full bg-[#07351A] text-white hover:bg-[#0A4D25] transition-all shadow-sm">
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#07351A] mb-4">Disclaimer & Terms of Service</h1>
        <p className="text-slate-500 font-medium mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-red-800 mb-2">Important Risk Warning</h3>
            <p className="text-red-700 text-sm leading-relaxed text-justify">
              All investments carry risks. The value of your portfolio may go down as well as up, and you may get back less than you invested. Past performance is not a reliable indicator of future results. Al-Tijara Capital (Digital Wealth) Limited is not a bank. The financial products offered (including Al-Tijara Classic, X, Crypto, Trade, and Save) are investment products and are not guaranteed by any government agency. You should carefully consider whether trading or holding digital and traditional assets is suitable for you in light of your financial condition.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Regulatory Status</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              Al-Tijara Capital (Digital Wealth) Limited is regulated by the Dubai Financial Services Authority ("DFSA") in the Dubai International Financial Centre ("DIFC") under a Category 3C license (Retail Client and Holding and Controlling Clients Investments and Money Endorsement). By using our services, you acknowledge that you are dealing with a regulated entity under DIFC jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Account Registration & KYC</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              To access Al-Tijara's platform, you must complete our Know Your Customer (KYC) onboarding process. You agree to provide accurate, current, and complete information, and to promptly update such information. We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate or if you fail to meet our ongoing compliance requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Investment Execution & Algorithmic Yields</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              When you deploy capital through Al-Tijara, you authorize our algorithmic systems to allocate and execute trades across diversified portfolios (including physical real estate and digital assets) on your behalf. While we target specific annualized yields, these are projections based on historical data and market conditions, and are strictly <strong>non-guaranteed</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Shariah Compliance</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              Select portfolios offered by Al-Tijara are structured to comply with Islamic finance principles. Our Shariah Supervisory Board periodically reviews these specific portfolios. However, it remains the investor's independent responsibility to ensure the investments align with their personal beliefs and interpretations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              To the maximum extent permitted by DFSA regulations, Al-Tijara Capital shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including but not limited to market volatility, system outages, or third-party banking delays.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
