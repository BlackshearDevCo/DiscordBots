import "dotenv/config";
import { Client, Events } from "discord.js";
import { trackTransaction } from "src/lib/db";
import { awardGold } from "shared/db";

export const onMessageCreate = (client: Client): void => {
  client.on(Events.MessageCreate, async (message) => {
    const amount = 15;
    // Give users gold for every message they send
    await awardGold(message.author, amount);
    await trackTransaction({
      receiver_id: message.author.id,
      amount: amount,
      type: "earn",
    });
  });
};
