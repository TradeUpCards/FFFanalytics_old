import type { NextApiRequest, NextApiResponse } from 'next';
import { checkForMissionTrx } from '../../utils/solanaUtils'; // Import the checkForMissionTrx function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const transactions = req.body; // Helius sends an array of transaction signatures
            console.log("Received payload:", transactions);

            for (const signature of transactions) {
                console.log("Processing signature:", signature.signature);

                // Check for mission transaction with only the signature
                await checkForMissionTrx(signature.signature);
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
