import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// URL for the missions JSON
const MISSIONS_URL = 'https://dens.famousfoxes.com/missions.json';
async function fetchMissions() {
    try {
        const response = await fetch(MISSIONS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch missions data: ${response.statusText}`);
        }
        const missions = await response.json();
        const parsedMissions = missions.map((mission) => ({
            id: mission.id,
            name: mission.name,
            banner: mission.banner,
            lore: mission.lore,
            version: mission.version || 1,
            minxp: mission.minxp,
            xp: mission.xp,
            reward: mission.reward,
            total: mission.total,
            address: mission.address,
            opentime: mission.openTime ?? 0,
            expiry: mission.expiry,
            endtime: mission.endTime ?? 0,
            slots: mission.slots || [],
            traitbonuses: mission.traitBonuses?.map((tb) => ({
                setname: tb.setName,
                trait: tb.trait,
                category: tb.category,
                bonuspct: tb.bonusPct
            })) || [],
            other: mission.other || {}
        }));
        for (const missionData of parsedMissions) {
            console.log('Preparing to insert mission:', JSON.stringify(missionData, null, 2)); // Debugging log
            const { data, error } = await supabase
                .from('missions')
                .upsert([missionData], { onConflict: 'id' });
            if (error) {
                console.error('Error inserting mission data:', JSON.stringify(missionData, null, 2));
                console.error('Supabase error:', error);
            }
            else {
                console.log('Inserted mission data successfully:', data);
            }
        }
        console.log('All missions data inserted successfully');
    }
    catch (error) {
        console.error('Error fetching and inserting missions data:', error);
    }
}
fetchMissions();
