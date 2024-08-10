import { isEndMissionTransaction, isStartMissionTransaction, extractAddresses, extractFoxOwner, extractFameBefore, extractFameAfter, extractMissionFame, extractTier, extractMissionResult, extractDenBonus, extractChestsBase, extractTokenBalanceChanges, extractFame } from '../extractors/index';
import { determineFameLevel } from '../utils/determineFameLevel';
import { readFameLevels } from '../utils/readFameLevels'; // Import the function to read fame levels from JSON
// Function to process a transaction and extract relevant mission event details
export async function processMissionEvent(transaction, supabase) {
    const fameLevels = await readFameLevels(); // Load fame levels from the JSON file
    const { logMessages, innerInstructions, preTokenBalances, postTokenBalances, err } = transaction.meta;
    if (err) {
        console.log(`Transaction failed. Skipping.`);
        return null;
    }
    if (isEndMissionTransaction(logMessages)) {
        return await processEndMission(transaction, supabase, fameLevels);
    }
    else if (isStartMissionTransaction(logMessages)) {
        return await processStartMission(transaction, supabase, fameLevels);
    }
    console.log('Transaction is neither endMissionv2 nor StartMission. Skipping.');
    return null;
}
// Function to process and decode the endMissionv2 transaction
async function processEndMission(transaction, supabase, fameLevels) {
    const { logMessages, innerInstructions, preTokenBalances, postTokenBalances } = transaction.meta;
    const blocktime = transaction.blockTime;
    const signature = transaction.transaction.signatures[0];
    const { fox_address, den_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, supabase);
    const fox_owner = extractFoxOwner(innerInstructions, true);
    const mission_address = await getMissionAddress(transaction.transaction.message.accountKeys.map(key => key.pubkey), supabase);
    console.log(`Extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}`);
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
    return missionResult;
}
// Function to process and decode the StartMission transaction
async function processStartMission(transaction, supabase, fameLevels) {
    const { logMessages, innerInstructions } = transaction.meta;
    const blocktime = transaction.blockTime;
    const signature = transaction.transaction.signatures[0];
    const { fox_address, den_address, fox_id, fox_collection } = await extractAddresses(innerInstructions, supabase);
    const fox_owner = extractFoxOwner(innerInstructions, false);
    const mission_address = await getMissionAddress(transaction.transaction.message.accountKeys.map(key => key.pubkey), supabase);
    console.log(`Extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}`);
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
    return missionSend;
}
// Utility function to fetch fame levels
async function getMissionAddress(accountKeys, supabase) {
    const { data: missions, error } = await supabase
        .from('missions')
        .select('address');
    if (error) {
        throw new Error(`Error fetching missions: ${error.message}`);
    }
    return accountKeys.find(address => missions.some((mission) => mission.address === address)) || null;
}
// Utility function to calculate powers
async function calculatePowers(fox_address, den_address, fame_before, fox_collection, supabase) {
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
        const fameLevel = determineFameLevel(fame_before, await readFameLevels());
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
