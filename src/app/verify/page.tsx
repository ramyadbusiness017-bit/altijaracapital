import { verifyOtp } from '../actions/auth'
import Image from 'next/image'
import AutoSubmitOtp from '../../components/AutoSubmitOtp'
import ResendTimer from '../../components/ResendTimer'

export default async function VerifyPage(props: { searchParams: Promise<{ email?: string, error?: string }> }) {
  const searchParams = await props.searchParams;
  const email = searchParams.email || '';
  const error = searchParams.error || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
            <span className="text-3xl font-bold tracking-tight text-slate-900">AL-TIJARA</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-[#07351A] font-serif tracking-tight">
          Verify Identity
        </h2>
        <p className="mt-4 text-center text-base text-slate-600">
          We sent a secure code to <span className="font-semibold text-slate-900">{email}</span>
        </p>

        {error && !error.toLowerCase().includes('wait after') && !error.toLowerCase().includes('resent') && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}
        
        {error && error.toLowerCase().includes('resent') && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          
          <div className="w-full flex justify-center py-4">
            <AutoSubmitOtp email={email} action={verifyOtp} />
          </div>

          <ResendTimer email={email} initialError={error} />
        </div>
      </div>
    </div>
  )
}
