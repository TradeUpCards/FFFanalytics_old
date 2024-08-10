import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getMostRecentExpiry } from './fetchMostRecentExpiry';
dotenv.config();
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
async function getSlotFromTimestamp(timestamp) {
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
    const result = await response.json();
    return result.result.result;
}
async function getTransaction(signature) {
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
    const result = await response.json();
    return result.result;
}
async function getSignaturesForAddress(programId, sinceSlot) {
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
    const result = await response.json();
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
        }
        else {
            console.log('No transactions found');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main().catch(console.error);
