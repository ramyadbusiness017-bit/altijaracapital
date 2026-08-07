import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { generateUIA } from '../src/lib/wallet';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching rows:', error.message);
    return;
  }

  let index = 0;
  for (const profile of profiles) {
    // Generate sequential UIA
    const uiaAddress = generateUIA(index);
    const randomString = Math.random().toString(36).substring(2, 9).toUpperCase();
    const customUid = `AJ-${randomString}`;
    
    console.log(`Updating ${profile.id} with Index: ${index}, UID: ${customUid}, UIA: ${uiaAddress}`);
    
    // Update the profile
    await supabase.from('profiles').update({
      uia_address: uiaAddress,
      uid: customUid
    }).eq('id', profile.id);
    
    // Also save the wallet_index to auth.users raw_user_meta_data so it is permanently tracked
    await supabase.auth.admin.updateUserById(profile.id, {
      user_metadata: { wallet_index: index }
    });

    index++;
  }
  
  console.log('Backfill complete!');
}

backfill();
