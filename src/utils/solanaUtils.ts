import fetch from 'node-fetch';
import { Signature } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

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

    const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as { result: number };
    return result.result;
}

export async function getSlotFromTimestamp(timestamp: number): Promise<number> {
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

    const response = await fetch(SOLANA_RPC_URL, {
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
