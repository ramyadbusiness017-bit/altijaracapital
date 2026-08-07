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
    <div className="w-full max-w-xl mx-auto py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-[#07351A] mb-12 leading-tight font-serif tracking-tight">
        What products are you interested in?
      </h1>

      <form action={handleNext} className="space-y-4">
        
        {/* Managed Portfolios */}
        <label className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#07351A] transition-colors group relative overflow-hidden shadow-sm">
          <input type="checkbox" name="managed" className="peer sr-only" />
          <span className="text-lg font-medium text-slate-800">Managed Portfolios</span>
          <div className="text-slate-200 peer-checked:text-[#07351A] transition-colors">
            <Circle className="w-8 h-8 block peer-checked:hidden" />
            <CheckCircle2 className="w-8 h-8 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
        </label>

        {/* Trading */}
        <label className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#07351A] transition-colors group relative overflow-hidden shadow-sm">
          <input type="checkbox" name="trading" className="peer sr-only" />
          <span className="text-lg font-medium text-slate-800">Trading of Stocks and ETFs</span>
          <div className="text-slate-200 peer-checked:text-[#07351A] transition-colors">
            <Circle className="w-8 h-8 block peer-checked:hidden" />
            <CheckCircle2 className="w-8 h-8 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
        </label>

        {/* Savings */}
        <label className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#07351A] transition-colors group relative overflow-hidden shadow-sm">
          <input type="checkbox" name="savings" className="peer sr-only" />
          <span className="text-lg font-medium text-slate-800">High Yield Savings Account</span>
          <div className="text-slate-200 peer-checked:text-[#07351A] transition-colors">
            <Circle className="w-8 h-8 block peer-checked:hidden" />
            <CheckCircle2 className="w-8 h-8 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
        </label>

        {/* Crypto */}
        <label className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#07351A] transition-colors group relative overflow-hidden shadow-sm">
          <input type="checkbox" name="crypto" className="peer sr-only" defaultChecked />
          <span className="text-lg font-medium text-slate-800">Crypto</span>
          <div className="text-slate-200 peer-checked:text-[#07351A] transition-colors">
            <Circle className="w-8 h-8 block peer-checked:hidden" />
            <CheckCircle2 className="w-8 h-8 hidden peer-checked:block fill-[#07351A] text-white" />
          </div>
        </label>

        <div className="mt-12 flex justify-center pt-8">
          <div className="w-16">
            <SubmitButton 
              text="&rarr;" 
              className="w-14 h-14 bg-[#07351A] hover:bg-[#106E37] text-white rounded-full flex items-center justify-center text-2xl transition-all shadow-md hover:scale-105"
            />
          </div>
        </div>

      </form>
    </div>
  );
}
