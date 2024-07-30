import { fetchCollectionMetadata } from './fetchMetadata.js';
import { parseMetadata } from './parseMetadata.js';
import { saveToSupabase } from './saveToSupabase.js';
import { readTraitRarities } from '../utils/readTraitRarities.js';
import { readFameLevels } from '../utils/readFameLevels.js';

async function main() {
    const traitRarities = await readTraitRarities();
    const fameLevels = await readFameLevels();
    const collections: ("FFF" | "TFF" | "Dens" | "F&F")[] = ['FFF', 'TFF', 'Dens', 'F&F'];
    for (const collection of collections) {
        console.log(`Fetching metadata for ${collection}...`);
        const metadata = await fetchCollectionMetadata(collection);
        console.log(`Parsing metadata for ${collection}...`);
        const parsedData = await parseMetadata(metadata, collection, traitRarities, fameLevels);
        await saveToSupabase(parsedData);
        console.log(`Metadata for ${collection} saved.`);
    }
}

main().catch(console.error);
