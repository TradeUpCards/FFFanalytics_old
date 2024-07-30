export function rarityToValue(rarity: string): number {
    const rarityValues: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Epic': 4
    };
    return rarityValues[rarity] || 0;
  }
  