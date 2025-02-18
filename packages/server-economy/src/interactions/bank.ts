import { Interaction } from "discord.js";
import { getAllBalances } from "src/lib/db";

export const handleBank = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { data, error } = await getAllBalances();

  if (error) {
    console.error("Error fetching all balances:", error);
    return interaction.reply(
      "Error fetching all balances. Try again in a few minutes."
    );
  }

  // Format the balances into a readable message
  const balanceMessage = data
    .map((user) => `${user.username}: ${user.balance} gold`)
    .join("\n");

  // If no balances were found
  if (!balanceMessage) return interaction.reply("No user balances found.");

  // Send the formatted balances to the channel
  return await interaction.reply(`**User Balances**:\n${balanceMessage}`);
};
