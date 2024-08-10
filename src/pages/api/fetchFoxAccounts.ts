import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

// Define the program ID and the RPC URL
const PROGRAM_ID = new PublicKey('6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9'); // Replace with your actual program ID
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;


const fetchFoxAccounts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Create a connection to the Solana network
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    // Fetch all accounts of a specific program (you might need to adjust this based on your program)
    const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);

    // Process and format the accounts as needed
    const formattedAccounts = programAccounts.map(account => ({
      pubkey: account.pubkey.toBase58(),
      data: account.account.data.toString('base64'), // Convert data to base64 string
    }));

    // Return the fetched accounts as a JSON response
    res.status(200).json(formattedAccounts);
  } catch (error) {
    console.error('Error fetching fox accounts:', error);
    res.status(500).json({ error: 'Failed to fetch fox accounts' });
  }
};

export default fetchFoxAccounts;
