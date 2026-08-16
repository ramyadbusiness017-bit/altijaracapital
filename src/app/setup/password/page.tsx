import SubmitButton from "../../../components/SubmitButton";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { clearSetupData } from "../../actions/setup";

export default async function PasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams.error || '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  async function handleCreatePassword(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      redirect('/setup/password?error=Passwords do not match');
    }

    if (password.length < 8) {
      redirect('/setup/password?error=Password must be at least 8 characters long');
    }

    const supabase = await createClient();
    
    // Check if user is actually authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Error updating password:', error.message);
      redirect(`/setup/password?error=${encodeURIComponent(error.message)}`);
    }

    // Success! Clear the onboarding cookies
    await clearSetupData();

    // Send them to the dashboard
    redirect('/dashboard');
  }

  return (
    <div className="w-full mx-auto flex flex-col items-center animate-fade-in-up">
      <div className="w-20 h-20 bg-gradient-to-br from-[#07351A]/10 to-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-[#07351A]/5 transform rotate-3 transition-transform hover:rotate-6">
        <div className="-rotate-3">
          <LockKeyhole className="w-9 h-9 text-[#07351A]" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-[#07351A] mb-4 leading-tight font-serif tracking-tight text-center">
        Secure Your Account
      </h1>
      
      <p className="text-[15px] text-slate-500 mb-10 text-center max-w-md font-medium">
        Your email has been verified. Create a strong password to protect your Al-Tijara portfolio.
      </p>

      {error && (
        <div className="w-full max-w-md mb-8 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[14px] rounded-2xl border border-red-100/50 text-center font-medium shadow-sm">
          {error}
        </div>
      )}

      <form action={handleCreatePassword} className="w-full max-w-md space-y-4">
        <div>
          <input 
            type="password" 
            name="password"
            placeholder="New Password" 
            required
            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        <div>
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Confirm Password" 
            required
            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A]/20 focus:border-[#07351A]/40 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="pt-6">
          <SubmitButton 
            text="Confirm Password" 
            loaderMessage="Securing..."
            className="w-full py-4 bg-gradient-to-r from-[#07351A] to-[#0A4D25] hover:from-[#0A4D25] hover:to-[#07351A] text-white font-bold rounded-2xl text-[15px] transition-all shadow-[0_4px_14px_rgba(7,53,26,0.25)] hover:shadow-[0_6px_20px_rgba(7,53,26,0.3)] active:scale-[0.98]"
          />
        </div>
      </form>
    </div>
  );
}
