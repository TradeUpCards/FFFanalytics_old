import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

const csvFilePath = path.resolve('src', 'data', 'FFF_trait_rarity.csv');

async function readTraitRarities(): Promise<Record<string, string>> {
  const rarities: { [key: string]: string } = {};

  return new Promise<{ [key: string]: string }>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const trait = row['Trait'];
        const type = row['Type'];
        const rarity = row['Rarity'];
        rarities[`${trait}_${type}`] = rarity;
      })
      .on('end', () => {
        resolve(rarities);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export { readTraitRarities };
