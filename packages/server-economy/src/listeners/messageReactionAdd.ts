import "dotenv/config";
import { Client, Events, User } from "discord.js";
import { trackTransaction } from "src/lib/db";
import { awardGold } from "shared/db";

export const onMessageReactionAdd = (client: Client): void => {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    const amount = 5;
    if (reaction.partial || user.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
        await user.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    // Give users gold for every reaction
    await awardGold(user as User, amount);
    await trackTransaction({
      receiver_id: user.id,
      amount: amount,
      type: "earn",
    });
  });
};
