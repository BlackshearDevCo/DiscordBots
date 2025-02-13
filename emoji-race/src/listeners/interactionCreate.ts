import { Client, Events, Interaction } from "discord.js";
import { CommandName } from "src/types";
import { handleBalance } from "src/interactions/balance";
import { handleBless } from "src/interactions/bless";
import { handleBet } from "src/interactions/bet";
import { handleRace } from "src/interactions/race";
import { handleBank } from "src/interactions/bank";
import { handleStats } from "src/interactions/stats";

export const onInteractionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    switch (interaction.commandName as CommandName) {
      case "balance":
        handleBalance(interaction);
        break;

      case "bless":
        handleBless(interaction);
        break;

      case "bet":
        handleBet(interaction);
        break;

      case "bank":
        handleBank(interaction);
        break;

      case "stats":
        handleStats(interaction);
        break;

      case "race":
        handleRace(interaction);
        break;

      default: {
        await interaction.reply("Invalid command.");
        break;
      }
    }
  });
};
