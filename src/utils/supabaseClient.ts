import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and ANON KEY are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
