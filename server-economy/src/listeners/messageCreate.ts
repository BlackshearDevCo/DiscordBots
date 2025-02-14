import "dotenv/config";
import { Client, Events } from "discord.js";
import { awardGold } from "src/lib/db";

export const onMessageCreate = (client: Client): void => {
  client.on(Events.MessageCreate, async (message) => {
    // Give users gold for every message they send
    await awardGold(message.author.id, 15);
  });
};
