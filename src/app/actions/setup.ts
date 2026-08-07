'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SETUP_COOKIE_NAME = 'altijara_onboarding_data'

type SetupData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  productInterest?: string[];
  howHeard?: string;
  investAmount?: string;
  netWorth?: string;
  annualIncome?: string;
  mainIncome?: string;
  referredBy?: string;
}

export async function getSetupData(): Promise<SetupData> {
  const cookieStore = await cookies()
  const data = cookieStore.get(SETUP_COOKIE_NAME)?.value
  if (!data) return {}
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function saveSetupStep(newData: Partial<SetupData>, nextRoute?: string) {
  const cookieStore = await cookies()
  const existingData = await getSetupData()
  
  const mergedData = { ...existingData, ...newData }
  
  cookieStore.set(SETUP_COOKIE_NAME, JSON.stringify(mergedData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  if (nextRoute) {
    redirect(nextRoute)
  }
}

export async function clearSetupData() {
  const cookieStore = await cookies()
  cookieStore.delete(SETUP_COOKIE_NAME)
}

export async function startOnboarding(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const countryCode = formData.get('countryCode') as string;
  const referredBy = formData.get('referredBy') as string | null;

  await saveSetupStep({
    firstName,
    lastName,
    email,
    phone,
    countryCode,
    referredBy: referredBy || undefined
  }, '/setup/product-interest');
}
