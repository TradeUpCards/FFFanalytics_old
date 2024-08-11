import fs from 'fs';
import path from 'path';

// Adjusted path to access the file from the root of your project
const fameLevelsFilePath = path.join(process.cwd(), 'public', 'data', 'fame_levels.json');

async function readFameLevels(): Promise<Record<number, number>> {
  return new Promise<Record<number, number>>((resolve, reject) => {
    fs.readFile(fameLevelsFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log('data', JSON.parse(data));
        resolve(JSON.parse(data));
      }
    });
  });
}

export { readFameLevels };
