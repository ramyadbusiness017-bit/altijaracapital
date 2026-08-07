"use client";

import { useState, useEffect } from "react";
import { resendOtp } from "../app/actions/auth";
import { useFormStatus } from "react-dom";

function SubmitButton({ isCounting, timeLeft }: { isCounting: boolean; timeLeft: number }) {
  const { pending } = useFormStatus();
  
  if (isCounting) {
    return (
      <span className="text-slate-400 text-sm font-semibold cursor-not-allowed">
        Resend available in {timeLeft}s
      </span>
    );
  }

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="text-[#0B913B] text-sm font-semibold hover:text-[#07351A] transition-colors underline underline-offset-4 disabled:opacity-50"
    >
      {pending ? "Sending..." : "Click to Resend"}
    </button>
  );
}

export default function ResendTimer({ email, initialError }: { email: string; initialError?: string }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (initialError && initialError.toLowerCase().includes('wait after')) {
      // Extract seconds from "wait after 57 seconds"
      const match = initialError.match(/wait after (\d+)/i);
      if (match && match[1]) {
        setTimeLeft(parseInt(match[1], 10));
      }
    }
  }, [initialError]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-slate-500 font-medium">Didn't receive the code?</p>
      <form action={resendOtp}>
        <input type="hidden" name="email" value={email} />
        <SubmitButton isCounting={timeLeft > 0} timeLeft={timeLeft} />
      </form>
    </div>
  );
}
