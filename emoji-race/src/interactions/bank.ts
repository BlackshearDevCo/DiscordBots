import { Interaction } from "discord.js";
import { getAllBalances } from "src/lib/db";

export const handleBank = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  // Fetch all user balances from the Supabase database
  const { data, error } = await getAllBalances();

  if (error) {
    console.error("Error fetching all balances:", error);
    return interaction.reply("There was an error fetching the balances.");
  }

  // Format the balances into a readable message
  const balanceMessage = data
    .map(
      (user) => `<@${user.user_id}>: ${user.balance} coins` // Formatting as user mention and balance
    )
    .join("\n");

  // If no balances were found
  if (!balanceMessage) {
    return interaction.reply("No user balances found.");
  }

  // Send the formatted balances to the channel
  await interaction.reply(`**User Balances**:\n${balanceMessage}`);
};
