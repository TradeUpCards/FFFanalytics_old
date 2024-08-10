import { register } from 'ts-node';
// Register ts-node for ES modules
register({
    compilerOptions: {
        module: 'ESNext',
        target: 'ES2020',
    },
});
// Import and run your script
import('./fetchAndDecodeAccounts')
    .then(module => {
    // If the module exports a default function or entry point, call it here
})
    .catch(err => {
    console.error(err);
    process.exit(1);
});
