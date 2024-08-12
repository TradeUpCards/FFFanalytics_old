import { SupabaseClient } from '@supabase/supabase-js';
import {
    isEndMissionTransaction,
    isStartMissionTransaction,
    extractAddresses,
    extractFoxOwner,
    extractFameBefore,
    extractFameAfter,
    extractMissionFame,
    extractTier,
    extractMissionResult,
    extractDenBonus,
    extractChestsBase,
    extractTokenBalanceChanges,
    extractFame
} from '../extractors/index';
import { Transaction } from '../types/index';
import { determineFameLevel } from '../utils/determineFameLevel';
import { fameLevels } from '../utils/readFameLevels'; // Adjust the path as needed
import { AccountKey } from '../types';


// Function to process a transaction and extract relevant mission event details
export async function processMissionEvent(transaction: Transaction, supabase: SupabaseClient) {
    const { logMessages, innerInstructions, preTokenBalances, postTokenBalances, err } = transaction.meta;

    if (err) {
        console.log(`Transaction failed. Skipping.`);
        return null;
    }

    if (isEndMissionTransaction(logMessages)) {
        return await processEndMission(transaction, supabase, fameLevels);
    } else if (isStartMissionTransaction(logMessages)) {
        return await processStartMission(transaction, supabase, fameLevels);
    }

    console.log('Transaction is neither endMissionv2 nor StartMission. Skipping.');
    return null;
}

// Function to process and decode the endMissionv2 transaction
export async function processEndMission(transaction: Transaction, supabase: SupabaseClient, fameLevels: Record<number, number>) {
    const { logMessages, innerInstructions, preTokenBalances, postTokenBalances } = transaction.meta;
    const blocktime = transaction.blockTime;
    const signature = transaction.transaction.signatures[0];
    // Extract pubkey strings from accountKeys
    const accountKeys = transaction.transaction.message.accountKeys as AccountKey[];

    console.log('Processing EndMissionv2 transaction:', signature);
    console.log ('Inner Instructions:', innerInstructions);
    console.log ('Account Keys:', accountKeys);
    const { fox_address, den_address, mission_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, accountKeys, supabase);
    const fox_owner = extractFoxOwner(innerInstructions, true);

    console.log(`Extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}, Mission: ${mission_address}`);

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

    const level_before = determineFameLevel(fame_before, fameLevels);
    const level_after = determineFameLevel(fame_after, fameLevels);

    const { fox_power, den_power } = await calculatePowers(fox_address, den_address, fame_before, fox_collection, supabase);

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

    console.log('Processed EndMissionv2 result:', missionResult);
    const { data, error } = await supabase
    .from('mission_results')
    .insert([missionResult]);

if (error) {
    if (error.code === '23505') {
        console.log(`Mission result for signature ${signature} already exists. Skipping insertion.`);
    } else {
        console.error('Error inserting mission result:', error);
    }
} else {
    console.log('Mission result inserted successfully:', data);
}

    return missionResult;
}

// Function to process and decode the StartMission transaction
export async function processStartMission(transaction: Transaction, supabase: SupabaseClient, fameLevels: Record<number, number>) {
    const { logMessages, innerInstructions } = transaction.meta;
    const blocktime = transaction.blockTime;
    const signature = transaction.transaction.signatures[0];
    // Extract pubkey strings from accountKeys
    const accountKeys = transaction.transaction.message.accountKeys as AccountKey[];

    console.log('Processing EndMissionv2 transaction:', signature);
    console.log ('Inner Instructions:', innerInstructions);
    console.log ('Account Keys:', accountKeys);
    const { fox_address, den_address, mission_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, accountKeys, supabase);
    const fox_owner = extractFoxOwner(innerInstructions, false);

    console.log(`Extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}, Mission: ${mission_address}`);

    const fame = extractFame(logMessages);
    const { tier } = extractTier(logMessages);

    const { fox_power, den_power } = await calculatePowers(fox_address, den_address, fame, fox_collection, supabase);
    const total_power = fox_power + (den_power || 0);
    const level = determineFameLevel(fame, fameLevels);

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

    console.log('Processed StartMission event:', missionSend);
    const { data, error } = await supabase
    .from('mission_sends')
    .insert([missionSend]);

if (error) {
    if (error.code === '23505') {
        console.log(`Mission send for signature ${signature} already exists. Skipping insertion.`);
    } else {
        console.error('Error inserting mission send:', error);
    }
} else {
    console.log('Mission send inserted successfully:', data);
}

    return missionSend;
}

// Utility function to fetch fame levels
export async function getMissionAddress(accountKeys: string[], supabase: SupabaseClient): Promise<string | null> {
    const { data: missions, error } = await supabase
        .from('missions')
        .select('address');

    if (error) {
        throw new Error(`Error fetching missions: ${error.message}`);
    }

    return accountKeys.find(address => 
        missions.some((mission: { address: string }) => mission.address === address)
    ) || null;
}

// Utility function to calculate powers
async function calculatePowers(fox_address: string | null, den_address: string | null, fame_before: number, fox_collection: string | null, supabase: SupabaseClient): Promise<{ fox_power: number; den_power: number | null }> {
    let fox_power = 0;
    let den_power = null;

    if (fox_address && fox_collection) {
        const { data: foxData, error: foxError } = await supabase
            .from('collections')
            .select('score')
            .eq('collection_name', fox_collection)
            .eq('token_address', fox_address)
            .single();

        if (foxError || !foxData) {
            console.error(`Error fetching fox data for fox_address: ${fox_address}, fox_collection: ${fox_collection}`);
            throw new Error(`Error fetching fox data: ${foxError ? foxError.message : 'No data found'}`);
        }

        const fameLevel = determineFameLevel(fame_before, fameLevels);
        fox_power = Math.floor(fameLevel * foxData.score);
    }

    if (den_address) {
        const { data: denData, error: denError } = await supabase
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
