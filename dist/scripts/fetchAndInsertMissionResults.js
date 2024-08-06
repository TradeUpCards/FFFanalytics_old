import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { determineFameLevel } from '../utils/determineFameLevel.js';
import { readFameLevels } from '../utils/readFameLevels.js';
dotenv.config();
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
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
    console.log('Transaction response:', JSON.stringify(result, null, 2)); // Debugging log
    return result.result;
}
async function insertMissionResult(transaction, signature, fameLevels) {
    const { logMessages, innerInstructions } = transaction.meta;
    const blocktime = transaction.blockTime;
    // Debugging log to check blocktime
    console.log('blocktime:', blocktime);
    if (blocktime === undefined || blocktime === null) {
        throw new Error('blocktime is null or undefined');
    }
    // Extract additional data from log messages and inner instructions
    const fox_id = extractFoxId(logMessages);
    const fox_collection = extractFoxCollection(logMessages);
    const fox_owner = extractFoxOwner(innerInstructions);
    const { fox_address, den_address } = extractAddresses(innerInstructions);
    const mission_result = extractMissionResult(logMessages);
    const den_bonus = extractDenBonus(logMessages);
    const fame_before = extractFameBefore(logMessages);
    const fame_after = extractFameAfter(logMessages);
    const mission_fame = extractMissionFame(logMessages);
    const fame_earned = fame_after - fame_before;
    const chests_base = extractChestsBase(logMessages);
    const tier = extractTier(logMessages);
    const chests_earned = mission_result ? chests_base + tier : 0;
    const level_before = determineFameLevel(fame_before, fameLevels);
    const level_after = determineFameLevel(fame_after, fameLevels);
    const { fox_power, den_power } = await calculatePowers(fox_id, fox_collection, den_address, fame_before, fameLevels);
    const total_power = fox_power + (den_power || 0);
    const { data, error } = await supabase
        .from('mission_results')
        .insert([{
            signature: signature,
            blocktime: blocktime,
            fox_id: fox_id,
            fox_collection: fox_collection,
            fox_owner: fox_owner,
            fox_address: fox_address,
            den_address: den_address,
            mission_result: mission_result,
            den_bonus: den_bonus,
            fame_before: fame_before,
            fame_after: fame_after,
            mission_fame: mission_fame,
            fame_earned: fame_earned,
            chests_base: chests_base,
            tier: tier,
            chests_earned: chests_earned,
            fox_power: fox_power,
            den_power: den_power,
            total_power: total_power,
            level_before: level_before,
            level_after: level_after
        }]);
    if (error) {
        if (error.code === '23505') { // Unique constraint violation error code in PostgreSQL
            console.log(`Mission result for signature ${signature} already exists. Skipping insertion.`);
        }
        else {
            console.error('Error inserting mission result:', error);
        }
    }
    else {
        console.log('Mission result inserted successfully:', data);
    }
}
// Functions to extract data from log messages and inner instructions
function extractFoxId(logMessages) {
    const regex = /name: Fox #(\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return match[1];
        }
    }
    return '';
}
function extractFoxCollection(logMessages) {
    for (const message of logMessages) {
        if (message.includes('is_faf: true'))
            return 'F&F';
        if (message.includes('is_fff: true'))
            return 'FFF';
        if (message.includes('is_tff: true'))
            return 'TFF';
    }
    return '';
}
function extractFoxOwner(innerInstructions) {
    for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
            if (instruction.parsed?.type === 'revoke' && instruction.parsed.info?.owner) {
                return instruction.parsed.info.owner;
            }
        }
    }
    return '';
}
function extractAddresses(innerInstructions) {
    let fox_address = '';
    let den_address = null;
    for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
            if (instruction.parsed?.type === 'thawAccount' && instruction.parsed.info?.mint) {
                if (!fox_address) {
                    fox_address = instruction.parsed.info.mint;
                }
                else if (!den_address) {
                    den_address = instruction.parsed.info.mint;
                }
            }
        }
    }
    return { fox_address, den_address };
}
function extractMissionResult(logMessages) {
    if (logMessages.some(message => message.includes("User didn't qualify true"))) {
        return false;
    }
    const regex = /Ended mission \d+ (true|false)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return match[1] === 'true';
        }
    }
    return true;
}
function extractDenBonus(logMessages) {
    const regex = /(\d+)% den bonus/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
function extractFameBefore(logMessages) {
    const regex = /FAME before: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
function extractFameAfter(logMessages) {
    const regex = /FAME after: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
function extractMissionFame(logMessages) {
    const regex = /Mission FAME: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
function extractChestsBase(logMessages) {
    const regex = /chests: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
function extractTier(logMessages) {
    const regex = /tier: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
async function calculatePowers(fox_id, fox_collection, den_address, fame_before, fameLevels) {
    let foxQuery;
    if (fox_collection === 'F&F') {
        foxQuery = supabase
            .from('collections')
            .select('score')
            .eq('collection_name', fox_collection)
            .eq('name', fox_id);
    }
    else {
        foxQuery = supabase
            .from('collections')
            .select('score')
            .eq('collection_name', fox_collection)
            .eq('name', `Fox #${fox_id}`);
    }
    const { data: foxData, error: foxError } = await foxQuery.single();
    if (foxError) {
        throw new Error(`Error fetching fox data: ${foxError.message}`);
    }
    const fameLevel = determineFameLevel(fame_before, fameLevels); // Ensure the fame levels are referenced correctly
    const fox_power = Math.floor(fameLevel * foxData.score);
    let den_power = null;
    if (den_address) {
        const { data: denData, error: denError } = await supabase
            .from('collections')
            .select('score')
            .eq('collection_name', 'Dens')
            .eq('token_address', den_address)
            .single();
        if (denError) {
            throw new Error(`Error fetching den data: ${denError.message}`);
        }
        den_power = Math.floor(denData.score / 10);
    }
    return { fox_power, den_power };
}
async function main() {
    try {
        const fameLevels = await readFameLevels(); // Read fame levels from file
        const signature = '962F3mXjYuyQTqt9XKUf7unJLY2sAd4B7EnS8xuS9tYd7Zo94pgrt5jjkeJGh8kP8MKpqYWfSJyV64wz5BRAp4G';
        const transaction = await getTransaction(signature);
        console.log('Transaction:', JSON.stringify(transaction, null, 2));
        await insertMissionResult(transaction, signature, fameLevels);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main().catch(console.error);
