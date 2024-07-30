import fs from 'fs';
import path from 'path';

const fameLevelsFilePath = path.join('src', 'data', 'fame_levels.json');

async function readFameLevels(): Promise<Record<number, number>> {
  return new Promise<Record<number, number>>((resolve, reject) => {
    fs.readFile(fameLevelsFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

export { readFameLevels };
