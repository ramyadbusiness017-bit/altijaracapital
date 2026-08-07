"use client";

import Image from 'next/image';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ message = "Processing...", fullScreen = true }: LoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9F9]/95 backdrop-blur-sm transition-opacity"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[#07351A]/10 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-[#07351A]/20 animate-pulse"></div>
        
        {/* Spinning border */}
        <div className="w-20 h-20 rounded-full border-[3px] border-transparent border-t-[#07351A] border-r-[#0B913B] animate-spin"></div>
        
        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-2 shadow-sm">
          <Image 
            src="/images/logo.png" 
            alt="Loading..." 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
      </div>
      
      {message && (
        <p className="mt-6 text-[#07351A] font-medium tracking-wide text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
