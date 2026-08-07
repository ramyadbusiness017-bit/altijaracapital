"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Loader from "./Loader";

interface AutoSubmitOtpProps {
  email: string;
  action: (formData: FormData) => void;
}

function SubmitTrigger({ code }: { code: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending && <Loader message="Verifying..." fullScreen={true} />}
      <input type="hidden" name="code" value={code} />
      {/* Hidden button to allow programmatic submission while keeping useFormStatus context */}
      <button type="submit" className="hidden" id="hidden-submit" disabled={pending}></button>
    </>
  );
}

export default function AutoSubmitOtp({ email, action }: AutoSubmitOtpProps) {
  // Strictly enforced 6 digits as requested
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    
    // Take only the last character if they somehow type multiple
    const val = value.slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    // Auto focus next
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 are filled
    if (val && index === 5 && newDigits.every(d => d !== '')) {
      // Small timeout to allow state to settle before submit
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    
    if (pasted) {
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      
      // Focus the next empty input or the last one
      const focusIndex = pasted.length < 6 ? pasted.length : 5;
      inputRefs.current[focusIndex]?.focus();

      // Auto submit if pasted exactly 6 digits
      if (pasted.length === 6) {
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 50);
      }
    }
  };

  return (
    <form ref={formRef} action={action} className="w-full flex flex-col items-center">
      <input type="hidden" name="email" value={email} />
      
      <div className="flex justify-between gap-2 mb-8">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-12 h-16 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono text-[#07351A] bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07351A] focus:border-[#07351A] transition-all shadow-sm"
          />
        ))}
      </div>

      <SubmitTrigger code={digits.join('')} />
    </form>
  );
}
