import type { NextApiRequest, NextApiResponse } from 'next';
import { processMissionEvent } from '../../utils/missionUtils';
import { supabase } from '../../utils/supabaseClient'; // Import your Supabase client
import { AccountKey } from '../../types'; // Import the AccountKey type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const transactions = req.body; // Helius sends an array of transactions
            console.log("Received payload:", req.body);

            for (const transaction of transactions) {
                console.log("Processing transaction:", transaction);
                // Log the inner instructions
                const innerInstructions = transaction.meta.innerInstructions;
                console.log("Inner Instructions:", innerInstructions);

                // Check if innerInstructions exist and log each inner instruction
                if (innerInstructions && Array.isArray(innerInstructions)) {
                    innerInstructions.forEach((innerInstruction, index) => {
                        console.log(`Inner Instruction ${index}:`, innerInstruction);
                        innerInstruction.instructions.forEach((instruction: any, instIndex: any) => {
                            console.log(`  Instruction ${instIndex}:`, instruction);
                        });
                    });
                } else {
                    console.log("No inner instructions found.");
                }
                const accountKeys = transaction.transaction.message.accountKeys as AccountKey[];

                console.log("Full transaction payload:", transaction.transaction);
                console.log("Account Keys:", accountKeys);
                                console.log("transaction.message.accountKeys:", accountKeys.map((key: AccountKey) => key.pubkey));
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
