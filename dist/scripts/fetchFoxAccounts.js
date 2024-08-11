import { missionprogram, fetchAllFoxAccounts } from '../utils/solanaUtils.js'; // Import from solanaUtils
// Fetch and log all fox accounts
const fetchFoxAccounts = async (limit = Infinity) => {
    await fetchAllFoxAccounts(missionprogram, limit);
};
// Call the function to fetch and log fox accounts
fetchFoxAccounts(10); // Process only the first 10 accounts
