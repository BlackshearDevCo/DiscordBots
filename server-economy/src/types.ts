export type CommandName = "balance" | "pay" | "bank" | "rob";

export type ServerState = {
  voiceChannelEntries: {
    [channelId: string]: {
      [userId: string]: number; // timestamp
    };
  };
};
