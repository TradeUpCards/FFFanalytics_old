import type { NextApiRequest, NextApiResponse } from 'next';
import { processMissionEvent } from '../../utils/missionUtils';
import { supabase } from '../../utils/supabaseClient'; // Import your Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const transactions = req.body; // Helius sends an array of transactions

            for (const transaction of transactions) {
                await processMissionEvent(transaction, supabase); // Pass both transaction and supabase
            }

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error processing mission event:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
