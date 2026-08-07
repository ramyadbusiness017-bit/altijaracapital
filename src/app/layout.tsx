import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Al-Tijara Capital | Engineering Generational Wealth",
  description: "A subsidiary of the Al-Tijara Group. Specialized in cryptographic wealth allocation and sovereign-caliber structural yield generation.",
};

import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#0B0F13] text-slate-200 transition-colors duration-300">
        <NextTopLoader
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1C2128', color: '#fff', border: '1px solid #30363D' } }} />
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}