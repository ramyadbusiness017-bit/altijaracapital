import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOtp() {
  console.log('Sending OTP...');
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'petersinko92@gmail.com',
    options: {
      shouldCreateUser: true,
      data: {
        first_name: 'Peter',
        last_name: 'Sinko',
      }
    }
  });

  if (error) {
    console.error('Supabase Error Object:', error);
    console.error('Supabase Error Name:', error.name);
    console.error('Supabase Error Message:', error.message);
    console.error('Supabase Error Status:', error.status);
  } else {
    console.log('Success! Data:', data);
  }
}

testOtp();
