export type CommandName = "balance" | "pay" | "bank" | "rob" | "transactions";

export type ServerState = {
  voiceChannelEntries: {
    [channelId: string]: {
      [userId: string]: number; // timestamp
    };
  };
};

export interface TransactionEntry {
  sender_id?: string;
  receiver_id?: string;
  amount: number;
  type: TransactionType;
}

export interface Transaction {
  sender_id?: string;
  receiver_id?: string;
  amount: number;
  type: TransactionType;
  timestamp: string;
}

export type TransactionType = "payment" | "rob" | "earn" | "lose";
