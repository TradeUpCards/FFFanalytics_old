export function rarityToValue(rarity) {
    const rarityValues = {
        'Common': 1,
        'Uncommon': 2,
        'Rare': 3,
        'Epic': 4
    };
    return rarityValues[rarity] || 0;
}
