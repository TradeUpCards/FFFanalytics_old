import { fetchCollectionMetadata } from './fetchMetadata';
import { parseMetadata } from './parseMetadata';
import { saveToSupabase } from './saveToSupabase';
import { readTraitRarities } from '../utils/readTraitRarities';
import { readFameLevels } from '../utils/readFameLevels';
async function main() {
    const traitRarities = await readTraitRarities();
    const fameLevels = await readFameLevels();
    const collections = ['FFF', 'TFF', 'Dens', 'F&F'];
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
