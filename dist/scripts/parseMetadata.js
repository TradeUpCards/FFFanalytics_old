import { rarityToValue } from '../utils/rarityToValue';
import { determineFameLevel } from '../utils/determineFameLevel';
async function parseMetadata(metadataList, collectionName, traitRarities, fameLevels) {
    const parsedData = [];
    for (const metadata of metadataList) {
        const attributes = Array.isArray(metadata.content.metadata.attributes)
            ? metadata.content.metadata.attributes.reduce((acc, attribute) => {
                acc[attribute.trait_type] = attribute.value;
                return acc;
            }, {})
            : {};
        // Determine FAME level (placeholder XP as it's not in metadata)
        const xp = 0;
        const fameLevel = determineFameLevel(xp, fameLevels);
        // Calculate trait rarities
        const headRarityValue = rarityToValue(traitRarities[`${attributes.Head}_Head`] || 'Unknown');
        const outfitRarityValue = rarityToValue(traitRarities[`${attributes.Outfit}_Outfit`] || 'Unknown');
        const mouthRarityValue = rarityToValue(traitRarities[`${attributes.Mouth}_Mouth`] || 'Unknown');
        const eyesRarityValue = rarityToValue(traitRarities[`${attributes.Eyes}_Eyes`] || 'Unknown');
        const sumTraitRarities = headRarityValue + outfitRarityValue + mouthRarityValue + eyesRarityValue;
        const commonData = {
            collection_name: collectionName,
            token_address: metadata.id || '', // Ensure id exists
            name: metadata.content.metadata.name || '',
            description: metadata.content.metadata.description || '',
            symbol: metadata.content.metadata.symbol || '',
            owner: metadata.ownership?.owner || '',
            image_url: metadata.content?.links?.image || '',
            json_uri: metadata.content?.json_uri || '',
            xp
        };
        const densData = {
            power: Math.floor((attributes.Score || 0) / 10),
            score: attributes.Score || 0,
            fame_level: 0,
            // Map Interior attributes
            interior_1: attributes['Interior 1'] || '',
            interior_2: attributes['Interior 2'] || '',
            interior_3: attributes['Interior 3'] || '',
            interior_4: attributes['Interior 4'] || '',
            interior_5: attributes['Interior 5'] || '',
            interior_6: attributes['Interior 6'] || '',
            exterior: attributes.Exterior || '',
            object_1: attributes['Object 1'] || '',
            rarity: attributes.Rarity || '',
            location: attributes.Location || '',
            sublocation: attributes.Sublocation || '',
            subname: attributes.Name || ''
        };
        const nonDensData = {
            power: Math.floor(fameLevel * sumTraitRarities),
            score: sumTraitRarities,
            fame_level: fameLevel,
            head_rarity: traitRarities[`${attributes.Head}_Head`] || '',
            outfit_rarity: traitRarities[`${attributes.Outfit}_Outfit`] || '',
            mouth_rarity: traitRarities[`${attributes.Mouth}_Mouth`] || '',
            eyes_rarity: traitRarities[`${attributes.Eyes}_Eyes`] || ''
        };
        const baseData = {
            ...commonData,
            ...(collectionName === 'Dens' ? densData : nonDensData)
        };
        parsedData.push(baseData);
    }
    return parsedData;
}
export { parseMetadata };
