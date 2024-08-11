export function extractFoxId(logMessages) {
    const regex = /name: Fox #(\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return match[1];
        }
    }
    return '';
}
export function extractFoxCollection(logMessages) {
    for (const message of logMessages) {
        if (message.includes('is_faf: true'))
            return 'F&F';
        if (message.includes('is_fff: true'))
            return 'FFF';
        if (message.includes('is_tff: true'))
            return 'TFF';
    }
    return '';
}
export function extractFoxOwner(innerInstructions, isEndMission = false) {
    for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
            if (isEndMission) {
                if (instruction.parsed?.type === 'revoke' && instruction.parsed.info?.owner) {
                    return instruction.parsed.info.owner;
                }
            }
            else {
                if ((instruction.parsed?.type === 'revoke' || instruction.parsed?.type === 'approve') && instruction.parsed.info?.owner) {
                    return instruction.parsed.info.owner;
                }
            }
        }
    }
    return '';
}
export async function extractAddresses(innerInstructions, supabase) {
    let fox_address = null;
    let den_address = null;
    let fox_id = null;
    let fox_collection = null;
    for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
            if (instruction.parsed?.type === 'thawAccount' && instruction.parsed.info?.mint) {
                const mintAddress = instruction.parsed.info.mint;
                console.log(`Found thawAccount with mint address: ${mintAddress}`);
                // Validate if the mint address is a fox or den
                const { data: foxData, error: foxError } = await supabase
                    .from('collections')
                    .select('*')
                    .neq('collection_name', 'Dens')
                    .eq('token_address', mintAddress)
                    .single();
                if (foxError || !foxData) {
                    console.log(`Address ${mintAddress} is not a fox: ${foxError ? foxError.message : 'No data found'}`);
                }
                else {
                    fox_address = mintAddress;
                    fox_id = foxData.name.replace('Fox #', ''); // Assuming the name is in the format 'Fox #ID'
                    fox_collection = foxData.collection_name;
                    console.log(`Validated fox address: ${fox_address}`);
                    continue;
                }
                const { data: denData, error: denError } = await supabase
                    .from('collections')
                    .select('score')
                    .eq('collection_name', 'Dens')
                    .eq('token_address', mintAddress)
                    .single();
                if (denError || !denData) {
                    console.log(`Address ${mintAddress} is not a den: ${denError ? denError.message : 'No data found'}`);
                }
                else {
                    den_address = mintAddress;
                    console.log(`Validated den address: ${den_address}`);
                    continue;
                }
            }
            if (instruction.parsed?.type === 'freezeAccount' && instruction.parsed.info?.mint) {
                const mintAddress = instruction.parsed.info.mint;
                console.log(`Found freezeAccount with mint address: ${mintAddress}`);
                // Validate if the mint address is a fox or den
                const { data: foxData, error: foxError } = await supabase
                    .from('collections')
                    .select('*')
                    .neq('collection_name', 'Dens')
                    .eq('token_address', mintAddress)
                    .single();
                if (foxError || !foxData) {
                    console.log(`Address ${mintAddress} is not a fox: ${foxError ? foxError.message : 'No data found'}`);
                }
                else {
                    fox_address = mintAddress;
                    fox_id = foxData.name.replace('Fox #', ''); // Assuming the name is in the format 'Fox #ID'
                    fox_collection = foxData.collection_name;
                    console.log(`Validated fox address: ${fox_address}`);
                    continue;
                }
                const { data: denData, error: denError } = await supabase
                    .from('collections')
                    .select('score')
                    .eq('collection_name', 'Dens')
                    .eq('token_address', mintAddress)
                    .single();
                if (denError || !denData) {
                    console.log(`Address ${mintAddress} is not a den: ${denError ? denError.message : 'No data found'}`);
                }
                else {
                    den_address = mintAddress;
                    console.log(`Validated den address: ${den_address}`);
                    continue;
                }
            }
        }
    }
    console.log(`Final extracted addresses - Fox: ${fox_address}, Den: ${den_address}, Fox ID: ${fox_id}, Fox Collection: ${fox_collection}`);
    return { fox_address, den_address, fox_id, fox_collection };
}
export function extractMissionResult(logMessages) {
    return !logMessages.some(message => message.includes("User didn't qualify true"));
}
export function extractDenBonus(logMessages) {
    const regex = /(\d+)% den bonus/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
export function extractFameBefore(logMessages) {
    const regex = /FAME before: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
export function extractFameAfter(logMessages) {
    const regex = /FAME after: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
export function extractMissionFame(logMessages) {
    const regex = /Mission FAME: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
export function extractChestsBase(fox_collection) {
    if (fox_collection === 'FFF' || fox_collection === 'F&F') {
        return 4;
    }
    else if (fox_collection === 'TFF') {
        return 1;
    }
    return 0;
}
export function extractTier(logMessages) {
    const regex = /tier: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return { tier: parseInt(match[1], 10), tier_from_log: true };
        }
    }
    return { tier: 0, tier_from_log: false };
}
export function extractTokenBalanceChanges(preTokenBalances, postTokenBalances) {
    return preTokenBalances.map((preBalance, index) => {
        const postBalance = postTokenBalances[index];
        return {
            mint: preBalance.mint,
            owner: preBalance.owner,
            balanceChange: (postBalance.uiTokenAmount.uiAmount || 0) - (preBalance.uiTokenAmount.uiAmount || 0)
        };
    });
}
export function isEndMissionTransaction(logMessages) {
    return logMessages.some(message => message.includes('Instruction: EndMissionv2'));
}
export function isStartMissionTransaction(logMessages) {
    return logMessages.some(message => message.includes('Instruction: StartMission'));
}
export function extractFame(logMessages) {
    const regex = /FAME: (\d+)/;
    for (const message of logMessages) {
        const match = message.match(regex);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 0;
}
/**
 * Extracts the transaction types from the inner instructions.
 * @param innerInstructions - An array of inner instructions.
 * @returns A comma-separated string of transaction types.
 */
export function extractTrxTypes(innerInstructions) {
    const trxTypes = new Set();
    for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
            if (instruction.parsed?.type) {
                trxTypes.add(instruction.parsed.type);
            }
        }
    }
    return Array.from(trxTypes).join(',');
}
