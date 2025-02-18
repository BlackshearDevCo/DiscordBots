export type CommandName =
  | "balance"
  | "pay"
  | "bank"
  | "rob"
  | "transactions"
  | "request"
  | "daily"
  | "gamble";

export type ServerState = {
  voiceChannelEntries: {
    [channelId: string]: {
      [userId: string]: number; // timestamp
    };
  };
  robCooldowns: {
    [userId: string]: number; // timestamp
  };
  dailyRewardCooldown: {
    [userId: string]: string; // date string (YYYY-MM-DD)
  };
  gambleCooldown: {
    [userId: string]: number; // timestamp
  };
};

export type PaymentRequestStatus = "pending" | "expired" | "paid" | "denied";

export interface PaymentRequestEntry {
  requester_id: string;
  recipient_id: string;
  amount: number;
  status: PaymentRequestStatus;
}

export interface PaymentRequest extends PaymentRequestEntry {
  id: number;
  paid_at: string;
  created_at: string;
}

export type TransactionType = "payment" | "rob" | "earn" | "lose" | "gamble";

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
