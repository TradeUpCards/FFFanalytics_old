import fs from 'fs';
import path from 'path';

// Adjust the path to access the file from the root of your project
const fameLevelsFilePath = path.join(process.cwd(), 'public', 'data', 'fame_levels.json');

// Synchronous read of the JSON file
const fameLevels: Record<number, number> = JSON.parse(fs.readFileSync(fameLevelsFilePath, 'utf8'));

// Export the loaded fameLevels
export { fameLevels };
