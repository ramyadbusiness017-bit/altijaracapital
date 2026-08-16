import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#07351A] mb-4">Privacy Policy</h1>
        <p className="text-slate-500 font-medium mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              At Al-Tijara Capital (Digital Wealth) Limited ("Al-Tijara", "we", "us", or "our"), we are committed to safeguarding your privacy and ensuring the highest standards of data security. This Privacy Policy outlines how we collect, use, disclose, and protect your personal data in accordance with the Data Protection Law, DIFC Law No. 5 of 2020 (the "DIFC DP Law") and other applicable regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed text-justify mb-4">
              To provide our institutional-grade wealth management services, we collect various types of information, including:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li><strong>Identity Data:</strong> Full name, date of birth, passport/national ID details, and biometric data (via UAE PASS).</li>
              <li><strong>Contact Data:</strong> Residential address, email address, and telephone numbers.</li>
              <li><strong>Financial Data:</strong> Source of wealth, annual income, net worth, bank account details, and crypto wallet addresses.</li>
              <li><strong>Transaction Data:</strong> Details of your deposits, investments, algorithmic trades, and withdrawals.</li>
              <li><strong>Technical Data:</strong> IP address, login data, browser type and version, time zone setting, and operating system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. How We Use Your Data</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              We process your personal data primarily to execute our contractual obligations, comply with strict Anti-Money Laundering (AML) and Know Your Customer (KYC) regulatory requirements set forth by the Dubai Financial Services Authority (DFSA), and to optimize your investment portfolio yields using our algorithmic systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              Your data is secured using bank-level AES-256 encryption both in transit and at rest. We employ rigorous access controls, multi-factor authentication, and continuous security monitoring to prevent unauthorized access, alteration, or disclosure of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed text-justify">
              If you have any questions regarding this Privacy Policy or wish to exercise your data subject rights, please contact our Data Protection Officer at: <a href="mailto:privacy@al-tijaracapital.com" className="text-[#07351A] font-semibold hover:underline">privacy@al-tijaracapital.com</a> or visit our registered office at Level 15, Gate Building, DIFC, Dubai, UAE.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
