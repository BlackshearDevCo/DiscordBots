import { Client, Events, Interaction } from "discord.js";
import { handleBalance } from "src/interactions/balance";
import { handleBank } from "src/interactions/bank";
import { handlePay } from "src/interactions/pay";
import { handleRob } from "src/interactions/steal";
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

      case "bank":
        handleBank(interaction);
        break;

      case "rob":
        handleRob(interaction);
        break;

      default: {
        await interaction.reply("Invalid command.");
        break;
      }
    }
  });
};
