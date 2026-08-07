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
    <div className="w-full max-w-xl mx-auto py-12 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-8">
        <Mail className="w-10 h-10 text-amber-600" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-[#07351A] mb-6 leading-tight font-serif tracking-tight">
        Secure Your Account
      </h1>
      
      <p className="text-lg text-slate-600 mb-12 max-w-md">
        To ensure maximum security, we will send a 6-digit confirmation code to your email address:
      </p>

      {errorMsg && (
        <div className="w-full max-w-md mb-8 p-4 bg-red-50 text-red-600 text-[14px] rounded-xl border border-red-100 text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form action={handleSendOTP} className="w-full max-w-md">
        <div className="relative mb-12 group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0B913B] rounded-l-2xl z-10"></div>
          <input 
            type="email" 
            name="email"
            defaultValue={initialEmail}
            required
            className="w-full bg-white border border-slate-200 rounded-2xl py-6 pl-8 pr-12 text-xl font-medium text-slate-800 tracking-wide focus:outline-none focus:border-[#07351A] focus:ring-1 focus:ring-[#07351A] transition-all shadow-sm hover:shadow-md"
          />
          <PencilLine className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-[#07351A] transition-colors" />
        </div>

        <SubmitButton 
          text="Send Confirmation Code" 
          loaderMessage="Dispatching Secure OTP..."
          className="w-full py-4 bg-[#07351A] hover:bg-[#106E37] text-white font-bold rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
        />
      </form>

      <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        <span>Bank-grade 256-bit encryption</span>
      </div>
    </div>
  );
}
