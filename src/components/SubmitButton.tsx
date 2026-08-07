"use client";

import { useFormStatus } from "react-dom";
import Loader from "./Loader";

interface SubmitButtonProps {
  text: string;
  className?: string;
  loaderMessage?: string;
}

export default function SubmitButton({ text, className, loaderMessage = "Processing..." }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && <Loader message={loaderMessage} fullScreen={true} />}
      <button 
        type="submit"
        disabled={pending}
        className={className || "w-full py-4 mt-2 bg-[#07351A] hover:bg-[#106E37] text-white font-semibold rounded-lg text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"}
      >
        {text}
      </button>
    </>
  );
}
