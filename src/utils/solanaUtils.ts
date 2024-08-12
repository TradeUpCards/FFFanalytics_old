// solanaUtils.js
import { Connection, Keypair, PublicKey, Transaction as SolanaTransaction, Signer } from '@solana/web3.js';
import { AnchorProvider, Program, Idl, setProvider } from '@project-serum/anchor';
import { IDL, Staking } from '../lib/idl/missionsIdl'; // Update the path if necessary
import { SupabaseClient } from '@supabase/supabase-js';
import { Signature, RpcResponse, Transaction } from '../types'; // Import Signature from your types file
import dotenv from 'dotenv';
import { insertFoxSnapshotsIntoDatabase } from './supabaseUtils';
import { processEndMission, processStartMission } from './missionUtils'; // Adjust imports as needed
import { extractTrxTypes, isEndMissionTransaction, isStartMissionTransaction } from '../extractors/index'; // Adjust imports as needed
import { insertOtherTransaction } from './supabaseUtils'; // Adjust imports as needed
import { fameLevels } from '../utils/readFameLevels'; // Adjust the path as needed
import { supabase } from './supabaseClient';
dotenv.config();

// Validate that the environment variables are set
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
  throw new Error("HELIUS_API_KEY is not set in the environment variables.");
}

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Create and export a new Solana connection
export const solconnection = new Connection(HELIUS_RPC_URL, 'confirmed');

// SimpleWallet class
export class SimpleWallet implements Signer {
  public publicKey: PublicKey;
  private keypair: Keypair;

  constructor(keypair: Keypair) {
    this.publicKey = keypair.publicKey;
    this.keypair = keypair;
  }

  async signTransaction(tx: SolanaTransaction): Promise<SolanaTransaction> {
    tx.partialSign(this.keypair);
    return tx;
  }

  async signAllTransactions(txs: SolanaTransaction[]): Promise<SolanaTransaction[]> {
    return txs.map(tx => {
      tx.partialSign(this.keypair);
      return tx;
    });
  }

  get secretKey(): Uint8Array {
    return this.keypair.secretKey;
  }
}

// Function to create an Anchor provider
export const createProvider = () => {
  const keypair = Keypair.generate();
  const wallet = new SimpleWallet(keypair);

  return new AnchorProvider(solconnection, wallet, {
    commitment: "confirmed",
  });
};

// Function to create a Program instance
export const createProgram = (idl: Idl, programId: PublicKey) => {
  const provider = createProvider();
  setProvider(provider);
  return new Program(idl, programId);
};
const MISSION_PROGRAM_ID = new PublicKey(process.env.SOLANA_PROGRAM_ID || '6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9');

// Create the program instance
export const missionprogram = createProgram(IDL as Idl, MISSION_PROGRAM_ID) as unknown as Program<Staking>;

// Function to fetch all fox accounts with a limit
export const fetchAllFoxAccounts = async (program: Program<Staking>, limit: number = Infinity):Promise<{ publicKey: PublicKey; account: any }[]> => {
  try {
    const filters = [
      {
        memcmp: {
          offset: 73,
          bytes: '1',
        },
      },
    ];

    const allFoxAccounts = await program.account.fox.all(filters);
    console.log(`Found ${allFoxAccounts.length} fox accounts`);

    const limitedAccounts = allFoxAccounts.slice(0, limit);

    limitedAccounts.forEach(({ publicKey, account }, index) => {
      //console.log(`Processing account ${index + 1}`);
      //console.log(`Public Key: ${publicKey.toBase58()}`);

      const fox = account.fox.toBase58();
      const owner = account.owner.toBase58();
      const tff = account.tff;
      const other = account.other;
      const xp = parseInt(account.xp.toString(), 16);
      const missions = parseInt(account.missions.toString(), 16);
      const multiplier = parseInt(account.multiplier.toString(), 16);
      const mission = account.mission.toBase58();
      const missionIndex = account.missionIndex;
      const missionIndexV2 = account.missionIndexV2;
      const missionAccount = account.missionAccount.toBase58();

    });

    const accountData = limitedAccounts.map(({ publicKey, account }) => ({
        publicKey,
        account: {
          fox: account.fox.toBase58(),
          owner: account.owner.toBase58(),
          tff: account.tff,
          other: account.other,
          xp: parseInt(account.xp.toString(), 16),
          missions: parseInt(account.missions.toString(), 16),
          multiplier: parseInt(account.multiplier.toString(), 16),
          mission: account.mission.toBase58(),
          missionIndex: account.missionIndex,
          missionIndexV2: account.missionIndexV2,
          missionAccount: account.missionAccount.toBase58(),
        }
      }));

    console.log(`Processed ${limitedAccounts.length} accounts`);
      return accountData;
  } catch (error) {
    console.error('Error fetching fox accounts:', error);
    return [];
  }
};

// Function to fetch all fox upgrade accounts with a limit
export const fetchAllFoxUpgrades = async (program: Program<Staking>, limit: number = Infinity):Promise<{ publicKey: PublicKey; account: any }[]> => {
    try {

      const allFoxUpgrades = await program.account.foxUpgrade.all();
      console.log(`Found ${allFoxUpgrades.length} fox upgrade accounts`);
  
      const limitedUpgrades = allFoxUpgrades.slice(0, limit);

      const upgradeData = limitedUpgrades.map(({ publicKey, account }) => ({
        publicKey,
        account: {
        mint: account.mint.toBase58(),
        headTier: account.headTier,
        outfitTier: account.outfitTier,
        currentHeadTier: account.currentHeadTier,
        currentOutfitTier: account.currentOutfitTier,
        headType: account.headType,
        outfitType: account.outfitType,
        headUpgrade: account.headUpgrade,
        outfitUpgrade: account.outfitUpgrade,
        upgraded: account.upgraded,
        bg: account.bg,
        switch: account.switch,
        tail: account.tail,
        tailEquipped: account.tailEquipped,
        }
        }));

        return upgradeData;
    } catch (error) {
      console.error('Error fetching fox upgrade accounts:', error);
      return [];
    }
  };

// Function to fetch all mission accounts
export const fetchAllMissionAccounts = async (program: Program<Staking>, limit: number = Infinity): Promise<{ publicKey: PublicKey; account: any }[]> => {
    try {
      const allMissionAccounts = await program.account.missionAccount.all();
      console.log(`Found ${allMissionAccounts.length} mission accounts`);
  
      const limitedMissionAccounts = allMissionAccounts.slice(0, limit);
  
      const missionAccountData = limitedMissionAccounts.map(({ publicKey, account }) => ({
        publicKey,
        account: {
          bump: account.bump,
          owner: account.owner.toBase58(),
          started: account.started,
          ended: account.ended,
          starttime: parseInt(account.starttime.toString(), 10),
          count: parseInt(account.count.toString(), 10),
          ucount: parseInt(account.ucount.toString(), 10),
          other: account.other,
          v2: account.v2,
          mission: account.mission.toBase58(),
          missionIndex: account.missionIndex,
          denRoom: account.denRoom,
          chestCount: account.chestCount,
          success: account.success,
          denMint: account.denMint.toBase58(),
          consumable: account.consumable.toBase58(),
          missionIndexV2: account.missionIndexV2 !== null && account.missionIndexV2 !== undefined ? account.missionIndexV2 : null,
        },
      }));
            return missionAccountData;
    } catch (error) {
      console.error('Error fetching mission accounts:', error);
      return [];
    }
  };
    
// Function to fetch and log data from an account
export const fetchData = async (program: Program, pda: PublicKey) => {
    console.log("Fetching data...");
    try {
      const account = await program.account.fox.fetch(pda);
      console.log(JSON.stringify(account, null, 2));
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
    }
  };
  
// Function to get the current slot
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

    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json() as { result: number };
    return result.result;
}

// Function to fetch transaction signatures from a slot
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

    const response = await fetch(HELIUS_RPC_URL, {
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

// Function to get the earliest expiry for version 3 missions from Supabase
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

// Function to fetch fox accounts and fox upgrades, then populate the database
export const fetchFoxSnapshots = async (limit: number = Infinity) => {
    try {
      // Fetch fox accounts and fox upgrades
      const foxAccounts = await fetchAllFoxAccounts(missionprogram, limit);
      const foxUpgrades = await fetchAllFoxUpgrades(missionprogram, limit);
      const missionAccounts = await fetchAllMissionAccounts(missionprogram, limit);
  
      // Combine fox accounts and fox upgrades into a snapshot
      const snapshots = combineFoxData(foxAccounts, foxUpgrades, missionAccounts);
        
      // Insert data into the database
      await insertFoxSnapshotsIntoDatabase(snapshots);
  
    } catch (error) {
      console.error('Error fetching fox snapshots:', error);
    }
  };

// Function to combine fox accounts, fox upgrades, and mission accounts
export const combineFoxData = (foxAccounts: any[], foxUpgrades: any[], missionAccounts: any[]) => {
    // Create maps for easy lookup
    const upgradeMap = new Map(foxUpgrades.map(upgrade => [upgrade.account.mint, upgrade])); // Map by mint
    const missionMap = new Map(missionAccounts.map(mission => [mission.publicKey.toBase58(), mission]));

    return foxAccounts.map(account => {
        // Use the fox property as the key for upgrades
        const accountFoxMint = account.account.fox;

        // Use missionAccount directly as it is already in base58 format
        const missionAccountPublicKey = account.account.missionAccount;

        // Retrieve upgrade and mission data
        const upgrade = upgradeMap.get(accountFoxMint) || {};
        const mission = missionMap.get(missionAccountPublicKey) || {};

        // Combine and return data
        const combinedData = {
            ...account,
            upgrade: upgrade.account, // Attach upgrade data
            mission: mission.account, // Attach mission data
        };
        if (mission.account.chestCount > 0 ) {
            console.log('Combined:',combinedData);
        }

        // Return combined data
        return combinedData;
    });
};

// Export the getTransaction function
export async function getTransaction(signature: string): Promise<Transaction | null> {
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

  try {
      const response = await fetch(HELIUS_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      // Log the response status and headers
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      // Check if the response is okay
      if (!response.ok) {
          console.error("Network response was not ok:", response.statusText);
          return null;
      }

      // Log the full response body
      const responseBody = await response.text();
      console.log("Full Response Body:", responseBody);

      const result = JSON.parse(responseBody) as RpcResponse<Transaction>;

      // Check if there's an error in the response
      if (result.error) {
          console.error("Error in RPC response:", result.error);
          return null;
      }

      console.log("Transaction result:", result.result);
      return result.result || null;
  } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
  }
}

export async function getTransactionWithDelay(signature: string, delay: number = 5000): Promise<Transaction | null> {
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTransaction",
    params: [
      signature,
      {
        encoding: "jsonParsed",
        maxSupportedTransactionVersion: 0
      }
    ]
  };

  console.log("Sending payload:", JSON.stringify(payload));

  try {
    await new Promise(resolve => setTimeout(resolve, delay)); // Add a delay before making the API call

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    if (!response.ok) {
      console.error("Network response was not ok:", response.statusText);
      return null;
    }

    const responseBody = await response.text();
    console.log("Full Response Body:", responseBody);

    const result = JSON.parse(responseBody) as RpcResponse<Transaction>;

    if (result.error) {
      console.error("Error in RPC response:", result.error);
      return null;
    }

    console.log("Transaction result:", result.result);
    return result.result || null;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

export async function checkForMissionTrx(signature: string): Promise<boolean> {
    try {
        // Fetch the transaction details using the signature
        const transaction = await getTransactionWithDelay(signature);
        if (transaction) {
            // Extract necessary details from the transaction
            const logMessages = transaction.meta.logMessages;
            const trxTypes = extractTrxTypes(transaction.meta.innerInstructions || []);
            console.log(`Transaction types: ${trxTypes}`);

            // Determine the type of transaction and process accordingly
            if (isEndMissionTransaction(logMessages)) {
                await processEndMission(transaction, supabase, fameLevels);
                return true;
            } else if (isStartMissionTransaction(logMessages)) {
                await processStartMission(transaction, supabase, fameLevels);
                return true;
            } else {
                // Log non-EndMission and non-StartMission transactions
                await insertOtherTransaction(signature, trxTypes);
                return false;
            }
        } else {
            console.log(`Transaction not found for signature: ${signature}`);
            return false;
        }
    } catch (error) {
        console.error(`Error checking transaction type for signature ${signature}:`, error);
        return false;
    }
}