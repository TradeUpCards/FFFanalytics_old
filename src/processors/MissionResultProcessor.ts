import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { SupabaseClient } from '@supabase/supabase-js';
import { determineFameLevel } from '../utils/determineFameLevel.js';
import { 
    RpcResponse, Signature, Transaction
} from '../types/index.js';
import { 
    extractFoxOwner, extractAddresses, extractMissionResult, 
    extractDenBonus, extractFameBefore, extractFameAfter, 
    extractMissionFame, extractChestsBase, extractTier,
    extractTokenBalanceChanges, isEndMissionTransaction, 
    isStartMissionTransaction, extractFame, extractTrxTypes
} from '../extractors/index.js';
import { insertFailedTransaction, insertOtherTransaction } from '../utils/supabaseUtils.js';

dotenv.config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export class MissionResultProcessor {
    private supabase: SupabaseClient;
    private fameLevels: Record<number, number>;
    private ignoreAddresses: Set<string>; // Set for efficient look-up

    constructor(supabase: SupabaseClient, fameLevels: Record<number, number>, ignoreAddresses: string[] = []) {
        this.supabase = supabase;
        this.fameLevels = fameLevels;
        this.ignoreAddresses = new Set(ignoreAddresses); // Initialize ignoreAddresses set
    }
    async getMissionAddresses(): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('missions')
            .select('address')
            .eq('version', 3)
            .not('name', 'like', '%Test Restructure%');

        if (error) {
            console.error(`Error fetching mission addresses: ${error.message}`);
            throw new Error(`Error fetching mission addresses: ${error.message}`);
        }

        // Filter out addresses that are in the ignore list
        return data.map((mission: { address: string }) => mission.address)
                   .filter(address => !this.ignoreAddresses.has(address));
    }

    async fetchSignatures(programId: string, before: string | null, limit: number, retries: number = 5): Promise<Signature[]> {
        const params: any = { limit: limit };
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

                const result = await response.json() as { result: Signature[] };

                if (result.result) {
                    console.log(`Fetched ${result.result.length} signatures`);
                    return result.result;
                } else {
                    console.error('No result in response:', JSON.stringify(result, null, 2));
                    throw new Error('No result in response');
                }
            } catch (error: any) {
                if (error.message.includes('429')) {
                    const waitTime = Math.pow(2, attempt) * 1000;
                    console.warn(`Rate limit hit. Retrying in ${waitTime / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error('Error fetching signatures:', error);
                    throw error;
                }
            }
        }

        throw new Error('Failed to fetch signatures after multiple retries');
    }

    async getTransaction(signature: string): Promise<Transaction | null> {
        const payload = {
            jsonrpc: "2.0",
            id: 1,
            method: "getTransaction",
            params: [
                signature,
                {
                    encoding: "jsonParsed",
                    maxSupportedTransactionVersion: 0 // Adding this parameter
                }
            ]
        };

        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json() as RpcResponse<Transaction>;
        console.log(result);
        return result.result;
    }

    async getMissionAddress(accountKeys: string[]): Promise<string | null> {
        const { data: missions, error } = await this.supabase
            .from('missions')
            .select('address');

        if (error) {
            throw new Error(`Error fetching missions: ${error.message}`);
        }

        return accountKeys.find(address => 
            missions.some((mission: { address: string }) => mission.address === address)
        ) || null;
    }

    async calculatePowers(fox_address: string | null, den_address: string | null, fame_before: number, fox_collection: string | null): Promise<{ fox_power: number; den_power: number | null }> {
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

    async insertMissionResult(transaction: Transaction, signature: string): Promise<boolean> {
        let blocktime: number | undefined;

        try {
            const { logMessages, innerInstructions, preTokenBalances, postTokenBalances, err } = transaction.meta;
            blocktime = transaction.blockTime;
            // Extract pubkey strings from accountKeys
            const accountKeys = transaction.transaction.message.accountKeys.map(key => key.pubkey);

            if (err) {
                console.log(`Transaction with signature ${signature} failed. Skipping.`);
                await insertFailedTransaction(signature);
                return false;
            }

            if (!isEndMissionTransaction(logMessages)) {
                console.log(`Transaction with signature ${signature} is not an EndMissionv2 transaction. Skipping.`);
                return false;
            }

            const { fox_address, den_address, mission_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, accountKeys, this.supabase);
            const fox_owner = extractFoxOwner(innerInstructions, true); // Updated to check for 'revoke' only for EndMission
            console.log(`Final extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}, Mission: ${mission_address}`);

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
                    return false;
                } else {
                    console.error('Error inserting mission result:', error);
                    this.logErrorToFile({ signature, blocktime, error: error.message });
                    this.logFailedTransactionToCSV(signature, blocktime);
                    return false;
                }
            } else {
                console.log('Mission result inserted successfully:', data);
                return true;
            }
        } catch (error) {
            console.error(`Error processing transaction with signature ${signature}:`, error);
            this.logErrorToFile({ signature, blocktime, error: (error as Error).message });
            this.logFailedTransactionToCSV(signature, blocktime);
            return false;
        }
    }

    async processStartMission(transaction: Transaction, signature: string): Promise<boolean> {
        let blocktime: number | undefined;

        try {
            const { logMessages, innerInstructions, err } = transaction.meta;
            // Extract pubkey strings from accountKeys
            const accountKeys = transaction.transaction.message.accountKeys.map(key => key.pubkey);
            console.log('Account keys:', accountKeys);
            blocktime = transaction.blockTime;

            if (err) {
                console.log(`Transaction with signature ${signature} failed. Skipping.`);
                return false;
            }

            if (!isStartMissionTransaction(logMessages)) {
                console.log(`Transaction with signature ${signature} is not a StartMission transaction. Skipping.`);
                return false;
            }

            const { fox_address, den_address, mission_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, accountKeys, this.supabase);
            const fox_owner = extractFoxOwner(innerInstructions, false); // Updated to check for 'approve' only for StartMission

            console.log(`Final extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}, Mission: ${mission_address}`);

            const fame = extractFame(logMessages);
            const { tier } = extractTier(logMessages);

            const { fox_power, den_power } = await this.calculatePowers(fox_address, den_address, fame, fox_collection);
            const total_power = fox_power + (den_power || 0);
            const level = determineFameLevel(fame, this.fameLevels);

            const missionSend = {
                signature,
                blocktime,
                fox_id,
                fox_collection,
                fox_owner,
                fox_address,
                den_address,
                mission_address,
                fame,
                tier,
                fox_power,
                den_power,
                total_power,
                level
            };

            console.log('Mission Send:', missionSend);

            const { data, error } = await this.supabase
                .from('mission_sends')
                .insert([missionSend]);

            if (error) {
                if (error.code === '23505') {
                    console.log(`Mission send for signature ${signature} already exists. Skipping insertion.`);
                    return false;
                } else {
                    console.error('Error inserting mission send:', error);
                    this.logErrorToFile({ signature, blocktime, error: error.message });
                    this.logFailedTransactionToCSV(signature, blocktime);
                    return false;
                }
            } else {
                console.log('Mission send inserted successfully:', data);
                return true;
            }
        } catch (error) {
            console.error(`Error processing transaction with signature ${signature}:`, error);
            this.logErrorToFile({ signature, blocktime, error: (error as Error).message });
            this.logFailedTransactionToCSV(signature, blocktime);
            return false;
        }
    }

async processMissionResults(before?: string): Promise<void> {
    const missionAddresses = await this.getMissionAddresses();
    let totalMissionEndInserted = 0;
    let totalMissionStartInserted = 0;
    let totalProcessed = 0;
    let totalSigs = 0;

    console.log('Starting to fetch signatures');

    for (const address of missionAddresses) {
        let lastSignature = before;

        while (true) {
            try {
                const signatures = await this.fetchSignatures(address, lastSignature || null, 100);

                if (signatures.length === 0) {
                    break;
                }

                const { data: existingMissionResults } = await this.supabase
                    .from('mission_results')
                    .select('signature')
                    .in('signature', signatures.map(sig => sig.signature));

                const { data: existingMissionSends } = await this.supabase
                    .from('mission_sends')
                    .select('signature')
                    .in('signature', signatures.map(sig => sig.signature));

                    const { data: existingOtherTransactions } = await this.supabase
                    .from('other_transactions')
                    .select('signature')
                    .in('signature', signatures.map(sig => sig.signature));

                    const { data: existingFailedTransactions } = await this.supabase
                    .from('failed_transactions')
                    .select('signature')
                    .in('signature', signatures.map(sig => sig.signature));

                if (!existingMissionResults && !existingMissionSends && !existingOtherTransactions && !existingFailedTransactions) {
                    console.error('Error fetching existing signatures.');
                    break;
                }

                const existingSignatures = [
                    ...(existingMissionResults?.map((result: { signature: string }) => result.signature) ?? []),
                    ...(existingMissionSends?.map((send: { signature: string }) => send.signature) ?? []),
                    ...(existingOtherTransactions?.map((transaction: { signature: string }) => transaction.signature) ?? []),
                    ...(existingFailedTransactions?.map((transaction: { signature: string }) => transaction.signature) ?? [])
                ];

                const newSignatures = signatures.filter(sig => 
                    !existingSignatures.includes(sig.signature)
                );

                console.log(`Processing ${newSignatures.length} new signatures out of ${signatures.length}`);
                totalSigs += newSignatures.length;

                for (const signature of newSignatures) {
                    const transaction = await this.getTransaction(signature.signature);
                    if (transaction) {
                        const logMessages = transaction.meta.logMessages;
                        const trxTypes = extractTrxTypes(transaction.meta.innerInstructions || []);

                        if (isEndMissionTransaction(logMessages)) {
                            const inserted = await this.insertMissionResult(transaction, signature.signature);
                            if (inserted) {
                                totalMissionEndInserted++;
                            }
                        } else if (isStartMissionTransaction(logMessages)) {
                            const inserted = await this.processStartMission(transaction, signature.signature);
                            if (inserted) {
                                totalMissionStartInserted++;
                            }
                        } else {
                            // Log non-EndMission and non-StartMission transactions
                            await insertOtherTransaction(signature.signature, trxTypes);
                        }
                        totalProcessed++;
                    }
                }

                lastSignature = signatures[signatures.length - 1].signature;

                console.log(
                    'Processed batch of signatures:\n' +
                    `    - Total Signatures: ${totalSigs}\n` +
                    `    - Total Processed Transactions: ${totalProcessed}\n` +
                    `    - Total Mission Starts Inserted: ${totalMissionStartInserted}\n` +
                    `    - Total Mission Ends Inserted: ${totalMissionEndInserted}`
                );
                            } catch (error) {
                console.error('Error fetching or processing transactions:', error);
                this.logErrorToFile({ error: (error as Error).message, signature: '', blocktime: 0 });
                break;
            }
        }
    }

    console.log(`Completed processing. Total records inserted: ${totalMissionEndInserted + totalMissionStartInserted}`);
}


    private logErrorToFile(error: { signature: string; blocktime?: number; error: string }): void {
        const fs = require('fs');
        const logFilePath = 'error_log.json';
        const logData = JSON.stringify(error, null, 2);
        fs.appendFileSync(logFilePath, logData + ',\n');
    }

    private logFailedTransactionToCSV(signature: string, blocktime?: number): void {
        const fs = require('fs');
        const csvFilePath = 'failed_transactions.csv';
        const csvData = `${blocktime},${signature}\n`;
        if (!fs.existsSync(csvFilePath)) {
            fs.writeFileSync(csvFilePath, 'blocktime,signature\n');
        }
        fs.appendFileSync(csvFilePath, csvData);
    }
}
