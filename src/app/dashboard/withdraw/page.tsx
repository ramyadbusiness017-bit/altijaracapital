import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UploadSimple } from '@phosphor-icons/react/dist/ssr';
import WithdrawForm from '@/components/WithdrawForm';

export default async function WithdrawPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance')
    .eq('id', user.id)
    .single();

  const capital = profile?.capital_balance || 0;
  const earnings = profile?.earnings_balance || 0;

  return (
    <div className="w-full h-full font-sans text-slate-800">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-[#07351A] font-serif">Withdraw Funds</h1>
      </header>

      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center text-[#07351A] border border-slate-100">
              <UploadSimple weight="bold" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#07351A] font-serif">Secure Withdrawal</h3>
              <p className="text-sm text-slate-500">
                Execute a secure on-chain withdrawal.
              </p>
            </div>
          </div>

          <WithdrawForm availableCapital={capital} availableEarnings={earnings} />
        </div>

      </div>
    </div>
  );
}
