export interface RpcResponse<T> {
    jsonrpc: string;
    result: T;
    id: number;
}

export interface SlotResponse {
    result: number;
}

export interface Signature {
    signature: string;
}

export interface Transaction {
    transaction: {
        message: {
            accountKeys: { pubkey: string }[];
            instructions: {
                programId: string;
                data: string;
            }[];
        };
    };
    meta: {
        err: any;
        logMessages: string[];
        innerInstructions: InnerInstruction[];
        preTokenBalances: TokenBalance[];
        postTokenBalances: TokenBalance[];
    };
    blockTime: number;
}

export interface InnerInstruction {
    index: number;
    instructions: Instruction[];
}

export interface Instruction {
    parsed?: {
        info?: {
            owner?: string;
            mint?: string;
            destination?: string; // Added to match your requirement
        };
        type?: string;
    };
    programId: string;
}

export interface TokenBalance {
    accountIndex: number;
    mint: string;
    owner: string;
    uiTokenAmount: {
        amount: string;
        decimals: number;
        uiAmount: number | null;
    };
}
