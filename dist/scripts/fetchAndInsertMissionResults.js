import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFameLevels } from '../utils/readFameLevels.js';
import { MissionResultProcessor } from '../processors/MissionResultProcessor.js';
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function main() {
    try {
        const fameLevels = await readFameLevels();
        const processor = new MissionResultProcessor(supabase, fameLevels);
        await processor.processMissionResults();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main().catch(console.error);
