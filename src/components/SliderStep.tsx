"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Loader from "./Loader";

interface SliderStepProps {
  title: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  suffix?: string;
  action: (formData: FormData) => Promise<void>;
  name: string;
}

function SubmitIcon() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending && <Loader fullScreen={true} />}
      <button 
        type="submit"
        disabled={pending}
        className="px-10 py-4 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[15px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] active:scale-[0.98] w-full disabled:opacity-50"
      >
        Continue
      </button>
    </>
  );
}

export default function SliderStep({ title, min, max, step, defaultValue, suffix = "", action, name }: SliderStepProps) {
  const [value, setValue] = useState(defaultValue);

  const percentage = ((value - min) / (max - min)) * 100;
  
  const isMax = value >= max;
  
  const formattedValue = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(value) + (isMax ? "+" : "") + suffix;

  return (
    <div className="w-full max-w-xl mx-auto py-8 animate-fade-in-up">
      <h1 className="text-3xl md:text-4xl font-bold text-[#07351A] mb-12 leading-tight font-serif tracking-tight text-center">
        {title}
      </h1>

      <form action={action} className="space-y-8">
        
        <div className="relative pt-4 pb-12 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-3xl px-8 shadow-sm">
          <div className="text-4xl font-serif text-[#07351A] mb-10 mt-6 font-medium tracking-tight text-center transition-all drop-shadow-sm">
            {formattedValue}
          </div>
          
          <div className="relative h-2 w-full mb-4">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-slate-200/80 rounded-full mt-0.5"></div>
            <div 
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#0B913B] rounded-full mt-0.5 transition-all duration-75 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
              style={{ width: `${percentage}%` }}
            ></div>
            <input 
              type="range" 
              name={name}
              min={min} 
              max={max} 
              step={step}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-2.5 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#0B913B] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-center pt-2">
          <SubmitIcon />
        </div>

      </form>
    </div>
  );
}
