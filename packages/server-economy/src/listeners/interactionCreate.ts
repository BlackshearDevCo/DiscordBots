import {
  ButtonInteraction,
  CacheType,
  Client,
  Events,
  Interaction,
  MessageFlags,
} from "discord.js";
import { handleBalance } from "src/interactions/balance";
import { handleBank } from "src/interactions/bank";
import { handleDailyReward } from "src/interactions/dailyReward";
import { handleGamble } from "src/interactions/gamble";
import { handlePay } from "src/interactions/pay";
import {
  handleApproveRequest,
  handleDenyRequest,
  handleRequest,
} from "src/interactions/request";
import { handleRob } from "src/interactions/rob";
import { handleTransactions } from "src/interactions/transactions";
import { getButtonInteractionCustomId } from "src/lib/utils";
import { CommandName } from "src/types";

export const onInteractionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isButton()) await handleButtonInteractions(interaction);

    if (!interaction.isCommand()) return;

    switch (interaction.commandName as CommandName) {
      case "balance":
        handleBalance(interaction);
        break;

      case "pay":
        handlePay(interaction);
        break;

      case "request":
        handleRequest(interaction);
        break;

      case "bank":
        handleBank(interaction);
        break;

      case "rob":
        handleRob(interaction);
        break;

      case "transactions":
        handleTransactions(interaction);
        break;

      case "daily":
        handleDailyReward(interaction);
        break;

      case "gamble":
        handleGamble(interaction);
        break;

      default: {
        await interaction.reply("Invalid command.");
        break;
      }
    }
  });
};

async function handleButtonInteractions(
  interaction: ButtonInteraction<CacheType>
) {
  const { action } = getButtonInteractionCustomId(interaction);

  switch (action) {
    case "approve_request":
      handleApproveRequest(interaction);
      break;

    case "deny_request":
      handleDenyRequest(interaction);
      break;

    default:
      await interaction.reply({
        content: "Invalid action.",
        flags: [MessageFlags.Ephemeral],
      });
      break;
  }
}
