import { supabase } from "./supabaseClient.js";    
import { fameLevels } from '../utils/readFameLevels'; // Adjust the path as needed
import { determineFameLevel } from './determineFameLevel.js'; // Import your fame level determination function
import { timeStamp } from "console";

export async function insertOtherTransaction(
    signature: string,
    trxTypes: string
): Promise<void> {
    try {
        // Insert data without upsert, assuming 'signature' is a primary key or unique constraint
        const { error } = await supabase
            .from('other_transactions')
            .insert([{ signature, trx_type: trxTypes }]);

        if (error) {
            if (error.code === '23505') { // Unique violation error code
                console.log(`Signature ${signature} already exists, skipping insertion.`);
            } else {
                console.error('Error inserting other transaction:', error.message);
            }
        }
    } catch (error) {
        console.error('Error inserting other transaction:', (error as Error).message);
    }
}

// Function to insert a signature into the failed_transactions table
export async function insertFailedTransaction(
    signature: string
): Promise<void> {
    try {
        // Insert data into failed_transactions
        const { error } = await supabase
            .from('failed_transactions')
            .insert([{ signature }]);

        if (error) {
            if (error.code === '23505') { // Unique violation error code
                console.log(`Signature ${signature} already exists in failed_transactions, skipping insertion.`);
            } else {
                console.error('Error inserting failed transaction:', error.message);
            }
        }
    } catch (error) {
        console.error('Error inserting failed transaction:', (error as Error).message);
    }
}

// Function to calculate the tier based on the provided logic
const calculateTier = (fox: any, fameLevels: any) => {
  // Determine the fame level
  const fameLevel = determineFameLevel(fox.xp, fameLevels);
    if (fox.attributeByName.Edition != null) {
      if (fox.foxLevel >= 80) return 3;
      if (fox.foxLevel >= 65) return 2;
      if (fox.foxLevel >= 40) return 1;
      return 0;
    }
  
    // Only one upgrade needed in T3 to be considered a T3 fox
    if (fox.headTier === 3 || fox.outfitTier === 3) {
      return 3;
    }
  
    // Need both upgrades to be considered T1/T2 fox
    return Math.min(fox.headTier ?? 0, fox.outfitTier ?? 0);
  };
  
// Function to insert combined data into the database
export const insertFoxSnapshotsIntoDatabase = async (snapshots: any[]) => {
    try {
      for (const snapshot of snapshots) {
        // Determine the tier for the snapshot (optional)
        // const tier = calculateTier(snapshot, fameLevels);
        // snapshot.tier = tier;
  
        // Prepare the data for insertion, with defaults for missing values
        const foxdata = {
          publicKey: snapshot.publicKey || 'N/A', // Default to 'N/A' if undefined
          fox: snapshot.account?.fox || 'unknown', // Default to 'unknown' if undefined
          owner: snapshot.account?.owner || 'unknown',
          tff: snapshot.account?.tff || false,
          other: snapshot.account?.other || false,
          xp: snapshot.account?.xp || 0,
          missions: snapshot.account?.missions || 0,
          multiplier: snapshot.account?.multiplier || 0,
          mission: snapshot.account?.mission || 'N/A',
          missionIndex: snapshot.account?.missionIndex || 0,
          missionIndexV2: snapshot.account?.missionIndexV2 || 0,
          missionAccount: snapshot.account?.missionAccount || 'N/A',
          mint: snapshot.upgrade?.mint || 'N/A', // Default to 'N/A' if undefined
          headTier: snapshot.upgrade?.headTier || 0,
          outfitTier: snapshot.upgrade?.outfitTier || 0,
          currentHeadTier: snapshot.upgrade?.currentHeadTier || 0,
          currentOutfitTier: snapshot.upgrade?.currentOutfitTier || 0,
          headType: snapshot.upgrade?.headType || 'unknown',
          outfitType: snapshot.upgrade?.outfitType || 'unknown',
          headUpgrade: snapshot.upgrade?.headUpgrade || false,
          outfitUpgrade: snapshot.upgrade?.outfitUpgrade || false,
          upgraded: snapshot.upgrade?.upgraded || false,
          bg: snapshot.upgrade?.bg || 'none',
          switch: snapshot.upgrade?.switch || false,
          tail: snapshot.upgrade?.tail || 'none',
          tailEquipped: snapshot.upgrade?.tailEquipped || false,
          timeStamp: new Date().getTime(),
          tier: 0, // Placeholder, replace with actual tier calculation if needed
          chestCount: snapshot.mission?.chestCount || 0,
          success: snapshot.mission?.success || false
        };
  
        // Upsert the data into the database
        const { data, error } = await supabase
          .from('fox_snapshots')
          .upsert(foxdata);
  
        if (error) {
          console.error('Error inserting fox snapshot into database:', error);
        } else {
          //console.log('Inserted fox snapshot into database:', foxdata);
        }
      }
    } catch (error) {
      console.error('Error processing snapshots:', error);
    }
  };
  