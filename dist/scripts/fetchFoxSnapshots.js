import { fetchFoxSnapshots } from '../utils/solanaUtils.js'; // Import from your utils
// Define the limit for the number of foxes to fetch
const LIMIT = 10;
// Function to fetch and log fox snapshots
const fetchAndLogFoxSnapshots = async (limit = Infinity) => {
    try {
        // Fetch fox snapshots with the given limit
        const snapshots = await fetchFoxSnapshots(limit);
        // Log or handle the snapshots as needed
        console.log('Fetched Fox Snapshots:', snapshots);
        // Optionally process the snapshots or insert them into the database
        // For example: await insertFoxSnapshotsIntoDatabase(snapshots);
    }
    catch (error) {
        console.error('Error fetching fox snapshots:', error);
    }
};
// Call the function to fetch and log fox snapshots
fetchAndLogFoxSnapshots();
