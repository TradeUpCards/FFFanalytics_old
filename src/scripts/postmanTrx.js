import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import fs from 'fs';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const signatures = [
    "5gccWm51rvpuLedNmBhS5bfj4fVRALQsBwvNdKk6FMmDpJ5Veue2cqnQh8nMgpSrvB81Ec9vxGoqwz4Di1AxwPbx"
];

async function fetchTransactionDetails(signature) {
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

    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result.result;
}

async function main() {
    const transactions = [];

    for (const signature of signatures) {
        const transaction = await fetchTransactionDetails(signature);
        if (transaction) {
            transactions.push(transaction);
        } else {
            console.error(`Transaction not found for signature: ${signature}`);
        }
    }

    const outputFilename = 'StartMission.json';
    fs.writeFileSync(outputFilename, JSON.stringify(transactions, null, 2));

    console.log(`Transaction details saved to ${outputFilename}`);
}

main().catch(error => console.error("Error fetching transaction details:", error));
