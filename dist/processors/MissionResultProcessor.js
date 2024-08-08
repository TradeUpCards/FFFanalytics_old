import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { determineFameLevel } from '../utils/determineFameLevel.js';
import { extractFoxOwner, extractAddresses, extractMissionResult, extractDenBonus, extractFameBefore, extractFameAfter, extractMissionFame, extractChestsBase, extractTier, extractTokenBalanceChanges, isEndMissionTransaction } from '../extractors/index.js';
dotenv.config();
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
export class MissionResultProcessor {
    supabase;
    fameLevels;
    constructor(supabase, fameLevels) {
        this.supabase = supabase;
        this.fameLevels = fameLevels;
    }
    async getMissionAddresses() {
        const { data, error } = await this.supabase
            .from('missions')
            .select('address')
            .eq('version', 3)
            .not('name', 'like', '%Test Restructure%');
        if (error) {
            console.error(`Error fetching mission addresses: ${error.message}`);
            throw new Error(`Error fetching mission addresses: ${error.message}`);
        }
        return data.map((mission) => mission.address);
    }
    async fetchSignatures(programId, before, limit, retries = 5) {
        const params = { limit: limit };
        if (before) {
            params.before = before;
        }
        const payload = {
            jsonrpc: "2.0",
            id: 1,
            method: "getSignaturesForAddress",
            params: [programId, params]
        };
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(`Fetching signatures from Helius with URL: ${HELIUS_RPC_URL}`);
                const response = await fetch(HELIUS_RPC_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.result) {
                    console.log(`Fetched ${result.result.length} signatures`);
                    return result.result;
                }
                else {
                    console.error('No result in response:', JSON.stringify(result, null, 2));
                    throw new Error('No result in response');
                }
            }
            catch (error) {
                if (error.message.includes('429')) {
                    const waitTime = Math.pow(2, attempt) * 1000;
                    console.warn(`Rate limit hit. Retrying in ${waitTime / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
                else {
                    console.error('Error fetching signatures:', error);
                    throw error;
                }
            }
        }
        throw new Error('Failed to fetch signatures after multiple retries');
    }
    async getTransaction(signature) {
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
    async getMissionAddress(accountKeys) {
        const { data: missions, error } = await this.supabase
            .from('missions')
            .select('address');
        if (error) {
            throw new Error(`Error fetching missions: ${error.message}`);
        }
        return accountKeys.find(address => missions.some((mission) => mission.address === address)) || null;
    }
    async calculatePowers(fox_address, den_address, fame_before, fox_collection) {
        let fox_power = 0;
        let den_power = null;
        if (fox_address && fox_collection) {
            const { data: foxData, error: foxError } = await this.supabase
                .from('collections')
                .select('score')
                .eq('collection_name', fox_collection)
                .eq('token_address', fox_address)
                .single();
            if (foxError || !foxData) {
                console.error(`Error fetching fox data for fox_address: ${fox_address}, fox_collection: ${fox_collection}`);
                throw new Error(`Error fetching fox data: ${foxError ? foxError.message : 'No data found'}`);
            }
            const fameLevel = determineFameLevel(fame_before, this.fameLevels);
            fox_power = Math.floor(fameLevel * foxData.score);
        }
        if (den_address) {
            const { data: denData, error: denError } = await this.supabase
                .from('collections')
                .select('score')
                .eq('collection_name', 'Dens')
                .eq('token_address', den_address)
                .single();
            if (denError || !denData) {
                console.error(`Error fetching den data for den_address: ${den_address}`);
                throw new Error(`Error fetching den data: ${denError ? denError.message : 'No data found'}`);
            }
            den_power = Math.floor(denData.score / 10);
        }
        return { fox_power, den_power };
    }
    async insertMissionResult(transaction, signature) {
        let blocktime;
        try {
            const { logMessages, innerInstructions, preTokenBalances, postTokenBalances } = transaction.meta;
            blocktime = transaction.blockTime;
            if (!isEndMissionTransaction(logMessages)) {
                console.log(`Transaction with signature ${signature} is not an EndMissionv2 transaction. Skipping.`);
                return;
            }
            const { fox_address, den_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, this.supabase);
            const fox_owner = extractFoxOwner(innerInstructions);
            console.log(`Final extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}`);
            const mission_result = extractMissionResult(logMessages);
            const den_bonus = extractDenBonus(logMessages);
            const fame_before = extractFameBefore(logMessages);
            const fame_after = extractFameAfter(logMessages);
            const mission_fame = extractMissionFame(logMessages);
            const fame_earned = fame_after - fame_before;
            const chests_base = extractChestsBase(fox_collection || '');
            let { tier, tier_from_log } = extractTier(logMessages);
            const tokenBalanceChanges = extractTokenBalanceChanges(preTokenBalances, postTokenBalances);
            let chests_earned = 0;
            for (const change of tokenBalanceChanges) {
                if (change.mint === 'ChEsTBFtT4PNEDTEfpvREFUoALMjaUhM5HyCh1jJnQn2' && change.owner === fox_owner) {
                    chests_earned = change.balanceChange;
                    break;
                }
            }
            if (!tier_from_log && mission_result) {
                tier = chests_earned - chests_base;
            }
            const level_before = determineFameLevel(fame_before, this.fameLevels);
            const level_after = determineFameLevel(fame_after, this.fameLevels);
            const { fox_power, den_power } = await this.calculatePowers(fox_address, den_address, fame_before, fox_collection);
            const mission_address = await this.getMissionAddress(transaction.transaction.message.accountKeys.map(key => key.pubkey));
            const missionResult = {
                signature,
                blocktime,
                fox_id,
                fox_collection,
                fox_address,
                fox_owner,
                den_address,
                mission_address,
                mission_result,
                den_bonus,
                fame_before,
                fame_after,
                mission_fame,
                fame_earned,
                chests_base,
                tier,
                chests_earned,
                fox_power,
                den_power,
                total_power: fox_power + (den_power || 0),
                level_before,
                level_after,
                tier_from_log
            };
            console.log('Mission Result:', missionResult);
            const { data, error } = await this.supabase
                .from('mission_results')
                .insert([missionResult]);
            if (error) {
                if (error.code === '23505') {
                    console.log(`Mission result for signature ${signature} already exists. Skipping insertion.`);
                }
                else {
                    console.error('Error inserting mission result:', error);
                    this.logErrorToFile({ signature, blocktime, error: error.message });
                    this.logFailedTransactionToCSV(signature, blocktime);
                }
            }
            else {
                console.log('Mission result inserted successfully:', data);
            }
        }
        catch (error) {
            console.error(`Error processing transaction with signature ${signature}:`, error);
            this.logErrorToFile({ signature, blocktime, error: error.message });
            this.logFailedTransactionToCSV(signature, blocktime);
        }
    }
    async processMissionResults(before) {
        const missionAddresses = await this.getMissionAddresses();
        let totalInserted = 0;
        console.log('Starting to fetch signatures');
        for (const address of missionAddresses) {
            let lastSignature = before;
            while (true) {
                try {
                    const signatures = await this.fetchSignatures(address, lastSignature || null, 100);
                    if (signatures.length === 0) {
                        break;
                    }
                    const { data: existingSignatures } = await this.supabase
                        .from('mission_results')
                        .select('signature')
                        .in('signature', signatures.map(sig => sig.signature));
                    if (!existingSignatures) {
                        console.error('Error fetching existing signatures.');
                        break;
                    }
                    const newSignatures = signatures.filter(sig => !existingSignatures.some((existing) => existing.signature === sig.signature));
                    console.log(`Processing ${newSignatures.length} new signatures out of ${signatures.length}`);
                    for (const signature of newSignatures) {
                        const transaction = await this.getTransaction(signature.signature);
                        if (transaction) {
                            await this.insertMissionResult(transaction, signature.signature);
                            totalInserted++;
                        }
                    }
                    lastSignature = signatures[signatures.length - 1].signature;
                    console.log(`Processed batch of signatures, total records inserted: ${totalInserted}`);
                }
                catch (error) {
                    console.error('Error fetching or processing transactions:', error);
                    this.logErrorToFile({ error: error.message, signature: '', blocktime: 0 });
                    break;
                }
            }
        }
        console.log(`Completed processing. Total records inserted: ${totalInserted}`);
    }
    logErrorToFile(error) {
        const fs = require('fs');
        const logFilePath = 'error_log.json';
        const logData = JSON.stringify(error, null, 2);
        fs.appendFileSync(logFilePath, logData + ',\n');
    }
    logFailedTransactionToCSV(signature, blocktime) {
        const fs = require('fs');
        const csvFilePath = 'failed_transactions.csv';
        const csvData = `${blocktime},${signature}\n`;
        if (!fs.existsSync(csvFilePath)) {
            fs.writeFileSync(csvFilePath, 'blocktime,signature\n');
        }
        fs.appendFileSync(csvFilePath, csvData);
    }
}
