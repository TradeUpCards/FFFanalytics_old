import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { extractFoxOwner, extractAddresses, extractMissionResult, extractDenBonus, extractFameBefore, extractFameAfter, extractMissionFame, extractChestsBase, extractTier, extractTokenBalanceChanges } from '../extractors/index';
import { determineFameLevel } from '../utils/determineFameLevel';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const fameLevels = {
// Define fame levels here
};
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
    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.result;
}
async function testTransaction() {
    const signature = '3gNHgLKibAB74asPgJdis5bp2LecTtxTeowecGTJQeTanphbA5rj4muXJjxAWaVWTw4fmFTAsVT7mApdqgSLFs6V';
    const transaction = await getTransaction(signature);
    if (!transaction) {
        console.error('Transaction not found');
        return;
    }
    console.log('Full JSON response:', JSON.stringify(transaction, null, 2));
    const { logMessages, innerInstructions, preTokenBalances, postTokenBalances } = transaction.meta;
    const blocktime = transaction.blockTime;
    // Extract pubkey strings from accountKeys
    const accountKeys = transaction.transaction.message.accountKeys.map(key => key.pubkey);
    const { fox_address, den_address, mission_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, accountKeys, supabase);
    const fox_owner = extractFoxOwner(innerInstructions);
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
    const level_before = determineFameLevel(fame_before, fameLevels);
    const level_after = determineFameLevel(fame_after, fameLevels);
    const { fox_power, den_power } = await calculatePowers(fox_address, den_address, fame_before, fox_collection);
    const missionResult = {
        signature,
        blocktime,
        fox_id,
        fox_collection,
        fox_address,
        fox_owner,
        den_address,
        mission_address: null,
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
}
async function calculatePowers(fox_address, den_address, fame_before, fox_collection) {
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
testTransaction().catch(console.error);
