import fs from 'fs';
import path from 'path';
const fameLevelsFilePath = path.join('src', 'data', 'fame_levels.json');
async function readFameLevels() {
    return new Promise((resolve, reject) => {
        fs.readFile(fameLevelsFilePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });
}
export { readFameLevels };
