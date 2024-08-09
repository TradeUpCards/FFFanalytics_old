// src/pages/api/getTransactions.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch transactions from the database (you can filter or limit as needed)
        const { data, error } = await supabase
            .from('mission_results') // or 'mission_sends' depending on what you want to view
            .select('*')
            .order('blocktime', { ascending: false }) // Order by latest transactions
            .limit(10); // Limit to the latest 10 transactions

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}
