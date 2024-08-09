import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MissionResultProcessor } from '../processors/MissionResultProcessor.js';
import { determineFameLevel } from '../utils/determineFameLevel.js';

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
    const signature = '478h3AAsA4UuC9DVbyqve2caAB7X9BW7Hh7BdzGhK5WjRoK5GDCyryFYRzqUyDzpSrpt8xM388ExvhboiiRBmALq';
    const transaction = await processor.getTransaction(signature);
    console.log('Full transaction response:', JSON.stringify(transaction, null, 2)); // Added for debugging
    if (transaction) {
        await processor.processStartMission(transaction, signature);
    }
}

main().catch(error => {
    console.error('Error running test:', error);
});
