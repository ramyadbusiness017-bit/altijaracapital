import { getSetupData, saveSetupStep } from "../../actions/setup";
import SubmitButton from "../../../components/SubmitButton";
import { Mail, ShieldCheck, PencilLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ConfirmEmailPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams.error || '';
  const setupData = await getSetupData();
  const initialEmail = setupData.email || '';

  // If somehow they got here without an email, redirect to start
  if (!initialEmail) {
    redirect('/');
  }

  async function handleSendOTP(formData: FormData) {
    'use server';
    const data = await getSetupData();
    const supabase = await createClient();
    
    // Grab the potentially edited email
    const finalEmail = formData.get('email') as string;

    // Update the cookie if they changed it
    if (finalEmail !== data.email) {
      await saveSetupStep({ email: finalEmail });
      data.email = finalEmail;
    }

    // Trigger Supabase OTP and pass the onboarding data into user_metadata!
    const { error } = await supabase.auth.signInWithOtp({
      email: finalEmail,
      options: {
        shouldCreateUser: true,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          onboarding_data: data 
        }
      }
    });

    if (error) {
      console.error('Full Supabase Error:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || 'Unknown Supabase error occurred.';
      redirect(`/setup/confirm-email?error=${encodeURIComponent(errorMessage)}`);
    }

    // Redirect to verify page
    redirect(`/verify?email=${encodeURIComponent(finalEmail)}`);
  }

  return (
    <div className="w-full mx-auto flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-gradient-to-br from-[#07351A]/10 to-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-[#07351A]/5 transform rotate-3 transition-transform hover:rotate-6">
        <div className="-rotate-3">
          <Mail className="w-9 h-9 text-[#07351A]" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-[#07351A] mb-4 leading-tight font-serif tracking-tight text-center">
        Secure Your Account
      </h1>
      
      <p className="text-[15px] text-slate-500 mb-10 text-center max-w-md font-medium">
        To ensure maximum security, we will send a 6-digit confirmation code to your email address:
      </p>

      {errorMsg && (
        <div className="w-full max-w-md mb-8 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[14px] rounded-2xl border border-red-100/50 text-center font-medium shadow-sm">
          {errorMsg}
        </div>
      )}

      <form action={handleSendOTP} className="w-full max-w-md">
        <div className="relative mb-10 group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#D4AF37] to-[#0B913B] rounded-l-2xl z-10 shadow-[2px_0_8px_rgba(11,145,59,0.3)]"></div>
          <input 
            type="email" 
            name="email"
            defaultValue={initialEmail}
            required
            className="w-full bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl py-5 pl-8 pr-12 text-[17px] font-semibold text-slate-800 tracking-wide focus:outline-none focus:border-[#07351A]/40 focus:ring-2 focus:ring-[#07351A]/20 transition-all shadow-sm hover:shadow-md"
          />
          <PencilLine className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-[#07351A] transition-colors" />
        </div>

        <SubmitButton 
          text="Send Confirmation Code" 
          loaderMessage="Dispatching Secure OTP..."
          className="w-full py-4 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[15px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] active:scale-[0.98]"
        />
      </form>

      <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-slate-500 font-medium bg-white/40 px-4 py-2 rounded-full border border-slate-100/50">
        <ShieldCheck className="w-4 h-4 text-[#0B913B]" />
        <span>Bank-grade 256-bit encryption</span>
      </div>
    </div>
  );
}
