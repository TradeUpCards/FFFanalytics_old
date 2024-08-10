import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getMostRecentExpiry } from './fetchMostRecentExpiry';

dotenv.config();

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

interface RpcResponse<T> {
    jsonrpc: string;
    result: T;
    id: number;
}

interface SlotResponse {
    result: number;
}

interface Signature {
    signature: string;
}

interface Transaction {
    transaction: {
        message: {
            accountKeys: { pubkey: string }[];
            instructions: {
                programId: string;
                data: string;
            }[];
        };
    };
    meta: {
        err: any;
    };
}

async function getSlotFromTimestamp(timestamp: number): Promise<number> {
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

    const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as RpcResponse<SlotResponse>;
    return result.result.result;
}

async function getTransaction(signature: string): Promise<Transaction> {
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
            signature,
            {
                encoding: "jsonParsed"
            }
        ]
    };

    const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as RpcResponse<Transaction>;
    return result.result;
}

async function getSignaturesForAddress(programId: string, sinceSlot: number): Promise<Signature[]> {
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [
            programId,
            {
                limit: 1,
                minContextSlot: sinceSlot
            }
        ]
    };

    const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as RpcResponse<Signature[]>;
    return result.result;
}

async function main() {
    try {
        const mostRecentExpiry = await getMostRecentExpiry();
        const sinceSlot = await getSlotFromTimestamp(mostRecentExpiry);

        const signatures = await getSignaturesForAddress('6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9', sinceSlot);

        if (signatures.length > 0) {
            const transaction = await getTransaction(signatures[0].signature);
            console.log('Transaction:', JSON.stringify(transaction, null, 2));
        } else {
            console.log('No transactions found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
