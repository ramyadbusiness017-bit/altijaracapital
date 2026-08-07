import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Wallet, Warning } from '@phosphor-icons/react/dist/ssr';
import DepositForm from '@/components/DepositForm';

export default async function DepositPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('uia_address')
    .eq('id', user.id)
    .single();

  const uia = profile?.uia_address || 'Pending Generation...';

  return (
    <div className="w-full h-full font-sans text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-[#07351A] font-serif">Deposit Capital</h1>
      </header>

      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center text-[#07351A] border border-slate-100">
                <Wallet weight="duotone" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#07351A] font-serif">User Investment Address</h2>
                <p className="text-sm text-slate-500 tracking-wide">Your exclusive HD Wallet deposit address</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8 mt-2">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uia}`} 
                  alt="Deposit QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full">
                <p className="font-mono text-lg sm:text-xl break-all text-slate-800 font-bold tracking-wider text-center select-all">
                  {uia}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200/50 rounded-2xl text-amber-800 text-sm shadow-sm">
              <Warning weight="fill" className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Strictly send USDT (ERC-20)</strong> to this address. Sending any other token or using a different network will result in permanent loss of funds. Minimum deposit is $100.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-20">
          <h3 className="text-xl font-bold text-[#07351A] mb-2 font-serif">Simulate / Confirm Deposit</h3>
          <p className="text-sm text-slate-500 mb-8">
            After sending funds to your UIA, enter the exact amount here to await network confirmation.
          </p>
          <DepositForm />
        </div>

      </div>
    </div>
  );
}
