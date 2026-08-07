import Image from 'next/image';

export default function DashboardLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative w-28 h-8 mb-4 animate-pulse opacity-50">
        <Image 
          src="/images/logo.png" 
          alt="Loading..." 
          fill 
          className="object-contain"
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
