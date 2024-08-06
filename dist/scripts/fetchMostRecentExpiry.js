import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export async function getMostRecentExpiry() {
    const { data, error } = await supabase
        .from('missions')
        .select('expiry')
        .order('expiry', { ascending: false })
        .limit(1)
        .single();
    if (error) {
        console.error('Error fetching most recent expiry:', error);
        throw new Error(error.message);
    }
    return data.expiry;
}
async function main() {
    const expiry = await getMostRecentExpiry();
    console.log('Most recent expiry:', expiry);
}
main().catch(console.error);
