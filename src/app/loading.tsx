import Image from 'next/image';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9F9] flex flex-col items-center justify-center">
      <div className="relative w-32 h-10 mb-4 animate-pulse">
        <Image 
          src="/images/logo.png" 
          alt="Al-Tijara Loading" 
          fill 
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#07351A] animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#07351A] animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#07351A] animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
