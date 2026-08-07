"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors text-slate-300 hover:text-slate-500"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
