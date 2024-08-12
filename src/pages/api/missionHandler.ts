import type { NextApiRequest, NextApiResponse } from 'next';
import { checkForMissionTrx } from '../../utils/solanaUtils'; // Import the checkForMissionTrx function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const transactions = req.body; // Helius sends an array of transaction signatures

            // Flag to stop checking further signatures once a relevant transaction is found
            let foundRelevantTransaction = false;

            for (const transaction of transactions) {
                // Iterate over all signatures in the transaction
                for (const signature of transaction.transaction.signatures) {
                    console.log("Processing signature:", signature);

                    // Check if the signature fits the selected transaction types
                    const isRelevant = await checkForMissionTrx(signature);

                    if (isRelevant) {
                        foundRelevantTransaction = true;
                        break; // Stop checking other signatures if one matches
                    }
                }

                if (foundRelevantTransaction) {
                    break; // Stop checking other transactions if a relevant one is found
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
