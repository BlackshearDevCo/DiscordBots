import "dotenv/config";
import { Client, Events } from "discord.js";
import { awardGold } from "src/lib/db";

export const onMessageReactionAdd = (client: Client): void => {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    // Give users gold for every reaction
    await awardGold(user.id, 5);
  });
};
