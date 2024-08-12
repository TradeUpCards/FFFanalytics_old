import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MissionResultProcessor } from '../processors/MissionResultProcessor.js';
import { determineFameLevel } from '../utils/determineFameLevel';
import { getTransaction } from '../utils/solanaUtils.js';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseKey!);

const fameLevels = {
    1: 1000,
    2: 3000,
    3: 6000,
    4: 10000,
    5: 15000,
    // Add more levels as needed
};

const processor = new MissionResultProcessor(supabase, fameLevels);

async function main() {
    const signature = 'pWnFajEQHKShLtUoQbSnD998wt2VwGr8ERPq9hdLnWqngqmMbfseS1Q54bEmtzQ2X1Y71xvod1sVbFJy3qRVg1e';
    const transaction = await getTransaction(signature);
    console.log('Full transaction response:', transaction); // Added for debugging
    if (transaction) {
        await processor.processStartMission(transaction, signature);
    }
}

main().catch(error => {
    console.error('Error running test:', error);
});
