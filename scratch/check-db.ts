import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRows() {
  console.log('Checking profiles table rows...');
  const { data, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching rows:', error.message);
  } else {
    console.log(`Found ${data.length} profiles.`);
    console.log(data);
  }
}

checkRows();
