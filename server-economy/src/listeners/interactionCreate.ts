import { Client, Events, Interaction } from "discord.js";
import { handleBalance } from "src/interactions/balance";
import { handleBank } from "src/interactions/bank";
import { handlePay } from "src/interactions/pay";
import { CommandName } from "src/types";

export const onInteractionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    switch (interaction.commandName as CommandName) {
      case "balance":
        handleBalance(interaction);
        break;

      case "pay":
        handlePay(interaction);
        break;

      case "bank": {
        handleBank(interaction);
        break;
      }

      // daily (get a daily reward)

      // gamble? (just gamble your money and see if you win/lose)

      // steal (try to steal money from other users, but risk getting caught)

      // invest (simple, invest money and receive return at a later point)

      // giveaway (users can enter to win gold)

      // lottery

      default: {
        await interaction.reply("Invalid command.");
        break;
      }
    }
  });
};
