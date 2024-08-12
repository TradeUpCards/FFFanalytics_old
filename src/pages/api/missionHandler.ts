import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const transactions = req.body; // Helius sends an array of transaction signatures
            console.log("Processing transactions:", transactions);

            for (const transaction of transactions) {
                // Extract blockTime from the transaction
                const blockTime = transaction.blockTime;

                // Iterate over all signatures in the transaction
                for (const signature of transaction.transaction.signatures) {
                    console.log("Processing signature:", signature);
                    console.log("blocktime:", blockTime);

                    const { error } = await supabase
                        .from('trx_to_process')
                        .insert({ signature, blockTime });

                    if (error) {
                        console.error('Error inserting signature into database:', error);
                        throw new Error('Database Insertion Error');
                    }

                    console.log(`Inserted signature ${signature} with blocktime ${blockTime} into trx_to_process table`);
                }
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
