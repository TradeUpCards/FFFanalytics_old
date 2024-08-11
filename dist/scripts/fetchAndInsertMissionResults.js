import dotenv from 'dotenv';
import { supabase } from '../utils/supabaseClient.js';
import { readFameLevels } from '../utils/readFameLevels.js';
import { MissionResultProcessor } from '../processors/MissionResultProcessor.js';
dotenv.config();
async function main() {
    try {
        const fameLevels = await readFameLevels();
        // Ignore list for mission addresses
        const ignoreAddresses = [
            'G9HdcXk39uDFyXynmTCE4XBNUcZykTmSyLc4wXKJviH',
            '7ePMtCydingXia5Gj55DHdTtb9KbmTGsf9PoBRJAsmgq'
        ];
        const processor = new MissionResultProcessor(supabase, fameLevels, ignoreAddresses);
        await processor.processMissionResults();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main().catch(console.error);
