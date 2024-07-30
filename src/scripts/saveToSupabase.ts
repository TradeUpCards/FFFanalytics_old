import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function saveToSupabase(collectionData: any[]): Promise<void> {
  if (!Array.isArray(collectionData) || collectionData.length === 0) {
    console.error('No data to insert or invalid data format:', collectionData);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .upsert(collectionData, { onConflict: 'token_address' });

    if (error) {
      console.error('Error inserting data:', error.message);
    } else {
      console.log('Data inserted successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}
