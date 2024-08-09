export enum EProcessState {
    IDLE = "IDLE",
    PROCESSING = "PROCESSING",
    BUSY = "BUSY",
    FAILURE = "FAILURE"
}

export type Settings = {
    dailyCipher: boolean;
    dailyClaim: boolean;
    dailyCombo: boolean;
    dailyMiniGame: boolean;
    reinvestPassiveIncome: boolean;
    useBoosts: boolean;
    tapPercent: "0" | "0.1" | "0.2"| "0.3" | "0.4"| "0.5" | "0.6"| "0.7" | "0.8" | "0.9" | "1"
}
