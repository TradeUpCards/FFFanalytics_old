export function determineFameLevel(xp, fameLevels) {
    let level = 1;
    for (const [lvl, requiredXP] of Object.entries(fameLevels).sort((a, b) => Number(a[1]) - Number(b[1]))) {
        if (xp >= Number(requiredXP)) {
            level = Number(lvl);
        }
        else {
            break;
        }
    }
    return level;
}
