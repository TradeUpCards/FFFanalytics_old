import { Connection, Keypair, PublicKey, Transaction, Signer } from '@solana/web3.js';
import { AnchorProvider, Program, Idl, setProvider } from '@project-serum/anchor';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet.js";
import { IDL, Staking } from '../lib/idl/missionsIdl.js'; // Update the path if necessary
import { SupabaseClient } from '@supabase/supabase-js';
import { Signature } from '../types'; // Import Signature from your types file
import dotenv from 'dotenv';
dotenv.config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const PROGRAM_ID = new PublicKey(process.env.SOLANA_PROGRAM_ID || '6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9'); // Replace with your actual program ID

const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

export class SimpleWallet implements Signer {
    public publicKey: PublicKey;
    private keypair: Keypair;

    constructor(keypair: Keypair) {
        this.publicKey = keypair.publicKey;
        this.keypair = keypair;
    }

    async signTransaction(tx: Transaction): Promise<Transaction> {
        tx.partialSign(this.keypair);
        return tx;
    }

    async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
        return txs.map(tx => {
            tx.partialSign(this.keypair);
            return tx;
        });
    }

    // Provide secretKey if needed for other purposes
    get secretKey(): Uint8Array {
        return this.keypair.secretKey;
    }
}

// Create a placeholder wallet
const keypair = Keypair.generate();
const wallet = new SimpleWallet(keypair);

// Create an Anchor provider
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});

// Set the provider as the default provider
setProvider(provider);

// Create the program
export const program = new Program(IDL as Idl, PROGRAM_ID) as unknown as Program<Staking>;

// Fetch and log data
export const fetchData = async (pda: PublicKey) => {
    console.log("Fetching data...");
    try {
      const account = await program.account.fox.fetch(pda);
      console.log(JSON.stringify(account, null, 2));
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
    }
};

export async function getCurrentSlot(): Promise<number> {
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getSlot",
        params: [
            {
                commitment: "confirmed"
            }
        ]
    };

    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as { result: number };
    return result.result;
}

export async function fetchSignaturesFromSlot(programId: string, startSlot: number, limit: number): Promise<Signature[]> {
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [
            programId,
            {
                limit: limit,
                minContextSlot: startSlot
            }
        ]
    };

    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as { result: Signature[] };

    if (!result.result) {
        console.error('No result in response:', JSON.stringify(result, null, 2));
        throw new Error('No result in response');
    }

    return result.result;
}

export async function getEarliestExpiryForVersion3(supabase: SupabaseClient): Promise<number> {
    const { data, error } = await supabase
        .from('missions')
        .select('expiry')
        .eq('version', 3)
        .order('expiry', { ascending: true })
        .limit(1)
        .single();

    if (error) {
        throw new Error(`Error fetching earliest expiry for version 3 missions: ${error.message}`);
    }

    return data.expiry;
}

