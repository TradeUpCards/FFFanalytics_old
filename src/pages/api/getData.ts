// src/pages/api/getData.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Example query to Supabase
        const { data, error } = await supabase
            .from('mission_results')
            .select('*');

        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(200).json(data);
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
