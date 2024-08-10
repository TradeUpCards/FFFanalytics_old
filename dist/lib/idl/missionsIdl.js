export const IDL = {
    version: "0.1.0",
    name: "staking",
    instructions: [
        {
            name: "initMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "reward",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "id",
                    type: "u64",
                },
                {
                    name: "timelock",
                    type: "u64",
                },
                {
                    name: "amount",
                    type: "u64",
                },
                {
                    name: "xp",
                    type: "u64",
                },
                {
                    name: "lockstart",
                    type: "u64",
                },
                {
                    name: "lockend",
                    type: "u64",
                },
                {
                    name: "xpreward",
                    type: "u64",
                },
                {
                    name: "other",
                    type: "bool",
                },
                {
                    name: "limit",
                    type: "u64",
                },
                {
                    name: "root",
                    type: {
                        array: ["u8", 32],
                    },
                },
                {
                    name: "room",
                    type: "publicKey",
                },
                {
                    name: "edition",
                    type: "bool",
                },
                {
                    name: "maxxp",
                    type: "u64",
                },
                {
                    name: "version",
                    type: "u8",
                },
            ],
        },
        {
            name: "updateMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "id",
                    type: "u64",
                },
                {
                    name: "timelock",
                    type: "u64",
                },
                {
                    name: "amount",
                    type: "u64",
                },
                {
                    name: "limit",
                    type: "u64",
                },
                {
                    name: "xp",
                    type: "u64",
                },
                {
                    name: "lockstart",
                    type: "u64",
                },
                {
                    name: "lockend",
                    type: "u64",
                },
                {
                    name: "xpreward",
                    type: "u64",
                },
                {
                    name: "other",
                    type: "bool",
                },
                {
                    name: "end",
                    type: "bool",
                },
                {
                    name: "root",
                    type: {
                        array: ["u8", 32],
                    },
                },
                {
                    name: "room",
                    type: "publicKey",
                },
                {
                    name: "edition",
                    type: "bool",
                },
                {
                    name: "reward",
                    type: "publicKey",
                },
                {
                    name: "maxxp",
                    type: "u64",
                },
            ],
        },
        {
            name: "initFox",
            accounts: [
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "foxBump",
                    type: "u8",
                },
            ],
        },
        {
            name: "depositRewards",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rewardAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "reward",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mainAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "associatedTokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "authBump",
                    type: "u8",
                },
                {
                    name: "amount",
                    type: "u64",
                },
            ],
        },
        {
            name: "initMissionAccount",
            accounts: [
                {
                    name: "key",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mission",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "missionBump",
                    type: "u8",
                },
                {
                    name: "missionIndex",
                    type: "u16",
                },
            ],
        },
        {
            name: "startMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "fromAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "authBump",
                    type: "u8",
                },
                {
                    name: "index",
                    type: "u64",
                },
                {
                    name: "multiplier",
                    type: "u64",
                },
                {
                    name: "proof",
                    type: {
                        vec: {
                            array: ["u8", 32],
                        },
                    },
                },
            ],
        },
        {
            name: "startMissionRoom",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "fromAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "room",
                    isMut: true,
                    isSigner: false,
                    docs: [
                        "Only check mint on legacy missions, new missions will check against a full list of mints",
                    ],
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "authBump",
                    type: "u8",
                },
            ],
        },
        {
            name: "startMissionLoan",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "authBump",
                    type: "u8",
                },
                {
                    name: "index",
                    type: "u64",
                },
                {
                    name: "multiplier",
                    type: "u64",
                },
                {
                    name: "proof",
                    type: {
                        vec: {
                            array: ["u8", 32],
                        },
                    },
                },
            ],
        },
        {
            name: "startGroupMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "groupMissionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "fromAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "authBump",
                    type: "u8",
                },
                {
                    name: "missionBump",
                    type: "u8",
                },
                {
                    name: "index",
                    type: "u64",
                },
                {
                    name: "multiplier",
                    type: "u64",
                },
                {
                    name: "proof",
                    type: {
                        vec: {
                            array: ["u8", 32],
                        },
                    },
                },
            ],
        },
        {
            name: "succeedMission",
            accounts: [
                {
                    name: "auth",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "setMissionAccount",
            accounts: [
                {
                    name: "auth",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "missionAccount",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "toAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "associatedTokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endMissionv2",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "toAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxUpgrade",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endMissionAuth",
            accounts: [
                {
                    name: "auth",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "toAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxUpgrade",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endMissionLoan",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxUpgrade",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endMissionBorrower",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "borrower",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "lender",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxUpgrade",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "endGroupMission",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "groupMissionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "toAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "claimGroupReward",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rewardAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "userRewardAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "groupMissionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "reward",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "associatedTokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "claimReward",
            accounts: [
                {
                    name: "mission",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "authority",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rewardAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "userRewardAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "missionAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "reward",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "buyFame",
            accounts: [
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxyAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxy",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "fame",
                    type: "u64",
                },
            ],
        },
        {
            name: "redeemFame",
            accounts: [
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "redeemAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "redeem",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "count",
                    type: "u64",
                },
            ],
        },
        {
            name: "loanFox",
            accounts: [
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "fromAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "loanBump",
                    type: "u8",
                },
                {
                    name: "price",
                    type: "u64",
                },
            ],
        },
        {
            name: "cancelLoan",
            accounts: [
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "fromAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "metadata",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "metaplexAcc",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "masterEdition",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: "borrowFox",
            accounts: [
                {
                    name: "loanAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "borrower",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "borrowerFoxyAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "ownerFoxyAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxy",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "associatedTokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "rent",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "price",
                    type: "u64",
                },
            ],
        },
        {
            name: "initUpgrade",
            accounts: [
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: "systemProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "bump",
                    type: "u8",
                },
            ],
        },
        {
            name: "upgradeFoxRequest",
            accounts: [
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxyAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxy",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
            ],
            args: [
                {
                    name: "head",
                    type: "bool",
                },
                {
                    name: "outfit",
                    type: "bool",
                },
                {
                    name: "variant",
                    type: "u8",
                },
            ],
        },
        {
            name: "upgradeFox",
            accounts: [
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "signer",
                    isMut: true,
                    isSigner: true,
                },
            ],
            args: [],
        },
        {
            name: "switchFoxRequest",
            accounts: [
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "fox",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "foxyAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxy",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
            ],
            args: [
                {
                    name: "bg",
                    type: "u8",
                },
                {
                    name: "outfit",
                    type: "u8",
                },
                {
                    name: "head",
                    type: "u8",
                },
                {
                    name: "headType",
                    type: "u8",
                },
                {
                    name: "outfitType",
                    type: "u8",
                },
                {
                    name: "tail",
                    type: "bool",
                },
            ],
        },
        {
            name: "switchFox",
            accounts: [
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "signer",
                    isMut: true,
                    isSigner: true,
                },
            ],
            args: [],
        },
        {
            name: "fameSucc",
            accounts: [
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: "sourceFox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "destFox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "sourceFoxUpgrade",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "sourceFoxAccount",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "destFoxAccount",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: "fame",
                    type: "u64",
                },
            ],
        },
        {
            name: "redeemGem",
            accounts: [
                {
                    name: "fox",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "foxUpgrade",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "mint",
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: "tokenAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "redeemAccount",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "redeem",
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: "owner",
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: "tokenProgram",
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [],
        },
    ],
    accounts: [
        {
            name: "mission",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "bump",
                        type: "u8",
                    },
                    {
                        name: "authority",
                        type: "publicKey",
                    },
                    {
                        name: "reward",
                        type: "publicKey",
                    },
                    {
                        name: "amount",
                        type: "u64",
                    },
                    {
                        name: "id",
                        type: "u64",
                    },
                    {
                        name: "timelock",
                        type: "u64",
                    },
                    {
                        name: "count",
                        type: "u64",
                    },
                    {
                        name: "needother",
                        type: "bool",
                    },
                    {
                        name: "limit",
                        type: "u64",
                    },
                    {
                        name: "xp",
                        type: "u64",
                    },
                    {
                        name: "xpreward",
                        type: "u64",
                    },
                    {
                        name: "lockstart",
                        type: "u64",
                    },
                    {
                        name: "lockend",
                        type: "u64",
                    },
                    {
                        name: "end",
                        type: "bool",
                    },
                    {
                        name: "root",
                        docs: ["The 256-bit merkle root."],
                        type: {
                            array: ["u8", 32],
                        },
                    },
                    {
                        name: "started",
                        type: "u64",
                    },
                    {
                        name: "room",
                        type: "publicKey",
                    },
                    {
                        name: "edition",
                        type: "bool",
                    },
                    {
                        name: "maxxp",
                        type: "u64",
                    },
                    {
                        name: "version",
                        type: "u8",
                    },
                    {
                        name: "foxCount",
                        type: "u64",
                    },
                ],
            },
        },
        {
            name: "missionAccount",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "bump",
                        type: "u8",
                    },
                    {
                        name: "owner",
                        type: "publicKey",
                    },
                    {
                        name: "started",
                        type: "bool",
                    },
                    {
                        name: "ended",
                        type: "bool",
                    },
                    {
                        name: "starttime",
                        type: "u64",
                    },
                    {
                        name: "count",
                        type: "u64",
                    },
                    {
                        name: "ucount",
                        type: "u64",
                    },
                    {
                        name: "other",
                        type: "bool",
                    },
                    {
                        name: "v2",
                        type: "bool",
                    },
                    {
                        name: "mission",
                        type: "publicKey",
                    },
                    {
                        name: "missionIndex",
                        type: "u8",
                    },
                    {
                        name: "denRoom",
                        type: "bool",
                    },
                    {
                        name: "chestCount",
                        type: "u8",
                    },
                    {
                        name: "success",
                        type: "bool",
                    },
                    {
                        name: "denMint",
                        type: "publicKey",
                    },
                    {
                        name: "consumable",
                        type: "publicKey",
                    },
                    {
                        name: "missionIndexV2",
                        type: {
                            option: "u16",
                        },
                    },
                ],
            },
        },
        {
            name: "fox",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "fox",
                        type: "publicKey",
                    },
                    {
                        name: "owner",
                        type: "publicKey",
                    },
                    {
                        name: "tff",
                        type: "bool",
                    },
                    {
                        name: "other",
                        type: "bool",
                    },
                    {
                        name: "xp",
                        type: "u64",
                    },
                    {
                        name: "missions",
                        type: "u64",
                    },
                    {
                        name: "multiplier",
                        type: "u64",
                    },
                    {
                        name: "mission",
                        type: "publicKey",
                    },
                    {
                        name: "missionIndex",
                        type: "u8",
                    },
                    {
                        name: "missionIndexV2",
                        type: {
                            option: "u16",
                        },
                    },
                    {
                        name: "missionAccount",
                        type: "publicKey",
                    },
                ],
            },
        },
        {
            name: "loanAccount",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "bump",
                        type: "u8",
                    },
                    {
                        name: "owner",
                        type: "publicKey",
                    },
                    {
                        name: "borrower",
                        type: "publicKey",
                    },
                    {
                        name: "mint",
                        type: "publicKey",
                    },
                    {
                        name: "price",
                        type: "u64",
                    },
                    {
                        name: "borrowed",
                        type: "u64",
                    },
                    {
                        name: "start",
                        type: "u64",
                    },
                    {
                        name: "mission",
                        type: "publicKey",
                    },
                    {
                        name: "end",
                        type: "bool",
                    },
                ],
            },
        },
        {
            name: "foxUpgrade",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "mint",
                        type: "publicKey",
                    },
                    {
                        name: "headTier",
                        type: "u8",
                    },
                    {
                        name: "outfitTier",
                        type: "u8",
                    },
                    {
                        name: "currentHeadTier",
                        type: "u8",
                    },
                    {
                        name: "currentOutfitTier",
                        type: "u8",
                    },
                    {
                        name: "headType",
                        type: "u8",
                    },
                    {
                        name: "outfitType",
                        type: "u8",
                    },
                    {
                        name: "headUpgrade",
                        type: "bool",
                    },
                    {
                        name: "outfitUpgrade",
                        type: "bool",
                    },
                    {
                        name: "upgraded",
                        type: "bool",
                    },
                    {
                        name: "bg",
                        type: "u8",
                    },
                    {
                        name: "switch",
                        type: "bool",
                    },
                    {
                        name: "tail",
                        type: "bool",
                    },
                    {
                        name: "tailEquipped",
                        type: "bool",
                    },
                ],
            },
        },
    ],
    errors: [
        {
            code: 6000,
            name: "IncorrectOwner",
            msg: "Invalid owner account",
        },
        {
            code: 6001,
            name: "FoxLocked",
            msg: "Fox is locked",
        },
        {
            code: 6002,
            name: "FoxNotStaked",
            msg: "Fox not staked",
        },
        {
            code: 6003,
            name: "FoxNotFound",
            msg: "Fox not found",
        },
        {
            code: 6004,
            name: "NoReward",
            msg: "No reward",
        },
        {
            code: 6005,
            name: "InvalidReward",
            msg: "Invalid reward account",
        },
        {
            code: 6006,
            name: "InvalidXP",
            msg: "No XP",
        },
        {
            code: 6007,
            name: "InvalidNFT",
            msg: "Invalid NFT",
        },
        {
            code: 6008,
            name: "ClaimReward",
            msg: "Claim Reward",
        },
        {
            code: 6009,
            name: "MissionInactive",
            msg: "Mission Inactive",
        },
        {
            code: 6010,
            name: "MissionActive",
            msg: "Mission Active",
        },
        {
            code: 6011,
            name: "FoxesActive",
            msg: "Foxes Active",
        },
        {
            code: 6012,
            name: "NoOther",
            msg: "No Other allowed",
        },
        {
            code: 6013,
            name: "InvalidOther",
            msg: "Invalid Other",
        },
        {
            code: 6014,
            name: "OtherStaked",
            msg: "Other already staked",
        },
        {
            code: 6015,
            name: "FoxesStaked",
            msg: "Foxes already staked",
        },
        {
            code: 6016,
            name: "InvalidProof",
            msg: "Invalid proof",
        },
        {
            code: 6017,
            name: "InvalidMetadata",
            msg: "Invalid Metadata",
        },
        {
            code: 6018,
            name: "NoCancelLoan",
            msg: "Can't cancel loan",
        },
        {
            code: 6019,
            name: "BorrowedAlready",
            msg: "Fox borrowed already",
        },
        {
            code: 6020,
            name: "FameExceeded",
            msg: "Fame level exceeded",
        },
        {
            code: 6021,
            name: "InvalidUpgrade",
            msg: "InvalidUpgrade",
        },
        {
            code: 6022,
            name: "InvalidFox",
            msg: "Invalid Source Fox",
        },
        {
            code: 6023,
            name: "InsufficientFAME",
            msg: "Insufficient FAME",
        },
        {
            code: 6024,
            name: "InvalidPrintAccounts",
            msg: "Invalid Print Accounts",
        },
        {
            code: 6025,
            name: "InvalidPrice",
            msg: "Invalid Price",
        },
        {
            code: 6026,
            name: "InvalidMissionVersion",
            msg: "Invalid mission version",
        },
        {
            code: 6027,
            name: "MissionDidNotSucceed",
            msg: "Mission did not succeed",
        },
    ],
};
