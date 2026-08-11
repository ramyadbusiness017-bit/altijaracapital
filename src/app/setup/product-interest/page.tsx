import { saveSetupStep } from "../../actions/setup";
import SubmitButton from "../../../components/SubmitButton";
import { CheckCircle2, Circle } from "lucide-react";

export default function ProductInterestPage() {
  async function handleNext(formData: FormData) {
    'use server';
    // Get all checked checkboxes (they will have value="on" or the name itself if value is set)
    const interests = ['managed', 'trading', 'savings', 'crypto'].filter(
      key => formData.get(key)
    );
    await saveSetupStep({ productInterest: interests }, '/setup/how-heard');
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 animate-fade-in-up">
      <h1 className="text-3xl md:text-4xl font-bold text-[#07351A] mb-8 leading-tight font-serif tracking-tight text-center">
        What products are you interested in?
      </h1>

      <form action={handleNext} className="space-y-4">
        
        {/* Managed Portfolios */}
        <label className="flex items-center justify-between p-5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl cursor-pointer hover:border-[#07351A]/40 hover:bg-white/80 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
          <input type="checkbox" name="managed" className="peer sr-only" />
          <span className="text-[15px] font-semibold text-slate-700 peer-checked:text-[#07351A]">Managed Portfolios</span>
          <div className="text-slate-200 peer-checked:text-[#D4AF37] transition-colors">
            <Circle className="w-6 h-6 block peer-checked:hidden" />
            <CheckCircle2 className="w-6 h-6 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
          {/* Subtle glow when checked */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
        </label>

        {/* Trading */}
        <label className="flex items-center justify-between p-5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl cursor-pointer hover:border-[#07351A]/40 hover:bg-white/80 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
          <input type="checkbox" name="trading" className="peer sr-only" />
          <span className="text-[15px] font-semibold text-slate-700 peer-checked:text-[#07351A]">Trading of Stocks and ETFs</span>
          <div className="text-slate-200 peer-checked:text-[#D4AF37] transition-colors">
            <Circle className="w-6 h-6 block peer-checked:hidden" />
            <CheckCircle2 className="w-6 h-6 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
        </label>

        {/* Savings */}
        <label className="flex items-center justify-between p-5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl cursor-pointer hover:border-[#07351A]/40 hover:bg-white/80 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
          <input type="checkbox" name="savings" className="peer sr-only" />
          <span className="text-[15px] font-semibold text-slate-700 peer-checked:text-[#07351A]">High Yield Savings Account</span>
          <div className="text-slate-200 peer-checked:text-[#D4AF37] transition-colors">
            <Circle className="w-6 h-6 block peer-checked:hidden" />
            <CheckCircle2 className="w-6 h-6 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
        </label>

        {/* Crypto */}
        <label className="flex items-center justify-between p-5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl cursor-pointer hover:border-[#07351A]/40 hover:bg-white/80 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
          <input type="checkbox" name="crypto" className="peer sr-only" defaultChecked />
          <span className="text-[15px] font-semibold text-slate-700 peer-checked:text-[#07351A]">Crypto</span>
          <div className="text-slate-200 peer-checked:text-[#D4AF37] transition-colors">
            <Circle className="w-6 h-6 block peer-checked:hidden" />
            <CheckCircle2 className="w-6 h-6 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
        </label>

        <div className="mt-10 flex justify-center pt-6">
          <SubmitButton 
            text="Continue" 
            className="px-10 py-4 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[15px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] active:scale-[0.98] w-full"
          />
        </div>

      </form>
    </div>
  );
}
