import 'dotenv/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { IDL } from '../lib/idl/missionsIdl'; // Make sure to replace this with the actual path to your IDL file
// Environment variable for Helius API key
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
// Setup Helius RPC URL and Program ID
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const PROGRAM_ID = new PublicKey('6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9');
// Initialize Solana connection
const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
// Create a dummy wallet object
const dummyWallet = {
    publicKey: new PublicKey('11111111111111111111111111111111'), // Dummy public key
    signTransaction: async (transaction) => transaction, // Dummy signTransaction
    signAllTransactions: async (transactions) => transactions // Dummy signAllTransactions
};
// Initialize AnchorProvider with the correct types
const provider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' });
// Create the program interface
const program = new Program(IDL, provider);
// Function to fetch and decode accounts
const fetchAndDecodeAccounts = async () => {
    try {
        // Fetch all account addresses for the program
        const accounts = await connection.getProgramAccounts(PROGRAM_ID);
        // Limit to 5 accounts
        const maxAccounts = 5;
        let count = 0;
        for (const account of accounts) {
            if (count >= maxAccounts)
                break;
            console.log(`Public Key: ${account.pubkey.toBase58()}`);
            // Use Anchor to decode the account data based on the IDL
            // Replace 'fox' with the correct account type name from your IDL
            console.log('----------------------------------------');
            count++;
        }
    }
    catch (error) {
        console.error('Error fetching and decoding accounts:', error);
    }
};
// Call the function to fetch and decode accounts
fetchAndDecodeAccounts();
