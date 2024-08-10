import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, setProvider } from '@project-serum/anchor';
import { IDL, Staking } from '../lib/idl/missionsIdl.js'; // Update the path if necessary
import { SimpleWallet } from '../utils/solanaUtils.js';
import dotenv from 'dotenv';
dotenv.config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const PROGRAM_ID = new PublicKey(process.env.SOLANA_PROGRAM_ID || '6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9');

const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

// Create a Keypair and NodeWallet instance
const keypair = Keypair.generate();
const wallet = new SimpleWallet(keypair);

// Create an Anchor provider
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});

// Set the provider as the default provider
setProvider(provider);

// Create the program instance
const program = new Program(IDL as Idl, PROGRAM_ID) as unknown as Program<Staking>;

// Fetch all fox accounts
const fetchAllFoxAccounts = async () => {
  try {
    // Assuming this method fetches all fox accounts
    const allFoxAccounts = await program.account.fox.all();

    console.log(`Found ${allFoxAccounts.length} fox accounts`);

    allFoxAccounts.forEach(({ publicKey, account }) => {
      console.log(`Public Key: ${publicKey.toBase58()}`);
      // Assuming `account` is the object returned from your program
        const fox = account.fox.toBase58();
        const owner = account.owner.toBase58();
        const tff = account.tff;
        const other = account.other;
        const xp = parseInt(account.xp, 16);
        const missions = parseInt(account.missions, 16);
        const multiplier = parseInt(account.multiplier, 16);
        const mission = account.mission.toBase58();
        const missionIndex = account.missionIndex;
        const missionIndexV2 = account.missionIndexV2;
        const missionAccount = account.missionAccount.toBase58();
        


        // Use these values in your application
        console.log('Fox:', fox);
        console.log('Owner:', owner);
        console.log('TFF:', tff);
        console.log('Other:', other);
        console.log('XP:', xp);
        console.log('Missions:', missions);
        console.log('Multiplier:', multiplier);
        console.log('Mission:', mission);
        console.log('Mission Index:', missionIndex);
        console.log('Mission Index V2:', missionIndexV2);
        console.log('Mission Account:', missionAccount);
    });
  } catch (error) {
    console.error('Error fetching fox accounts:', error);
  }
};

// Call the function to fetch and log all fox accounts
fetchAllFoxAccounts();
