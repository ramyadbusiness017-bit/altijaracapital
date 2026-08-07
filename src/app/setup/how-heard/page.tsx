import { saveSetupStep } from "../../actions/setup";
import SubmitButton from "../../../components/SubmitButton";
import { CheckCircle2, Circle } from "lucide-react";

export default function HowHeardPage() {
  async function handleNext(formData: FormData) {
    'use server';
    const source = formData.get('source') as string || 'Friends/family';
    await saveSetupStep({ howHeard: source }, '/setup/invest-amount');
  }

  return (
    <div className="w-full max-w-xl mx-auto py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-[#07351A] mb-12 leading-tight font-serif tracking-tight">
        How did you hear about Al-Tijara?
      </h1>

      <form action={handleNext} className="space-y-4">
        
        {['Friends/family', 'Google search', 'Social media', 'News/blog/article'].map((option, idx) => (
          <label key={option} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#07351A] transition-colors group relative overflow-hidden shadow-sm">
            <input type="radio" name="source" value={option} className="peer sr-only" defaultChecked={idx === 0} />
            <span className="text-lg font-medium text-slate-800">{option}</span>
            <div className="text-slate-200 peer-checked:text-[#07351A] transition-colors">
              <Circle className="w-8 h-8 block peer-checked:hidden" />
              <CheckCircle2 className="w-8 h-8 hidden peer-checked:block fill-[#07351A] text-white" />
            </div>
          </label>
        ))}

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
