import { Interaction, MessageFlags } from "discord.js";
import { getRecentTransactions } from "src/lib/db";
import { Transaction } from "src/types";

export const handleTransactions = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { data, error } = await getRecentTransactions(interaction.user.id);

  if (error) {
    console.error("Error fetching recent transactions:", error);
    return interaction.reply(
      "Error fetching recent transactions. Try again in a few minutes."
    );
  }

  // Format the transactions into a readable message
  const transactionsMessage = data
    .map(
      ({
        sender_id,
        receiver_id,
        amount,
        type,
        timestamp,
      }: Transaction): string => {
        const time = `<t:${Math.floor(
          new Date(timestamp).getTime() / 1000
        )}:R>`;
        const receiver = receiver_id ? `<@${receiver_id}>` : "";
        const sender = sender_id ? `<@${sender_id}>` : "";

        const receiving = receiver_id === interaction.user.id;

        switch (type) {
          case "earn":
            return `- 🟢 You earned **${amount}** gold! (${time})`;

          case "rob":
            // You robbed another another user
            if (receiving && sender_id)
              return `- 💰 You robbed **${sender}** for **${amount}** gold. (${time})`;

            // You lost money trying to rob a user
            if (receiving && !sender_id)
              return `- 🚫 You lost **${amount}** gold trying to rob someone. (${time})`;

            // Another user robbed you
            return `- 🕵️ **${amount}** gold mysteriously disappeared from your account... (${time})`;

          case "lose":
            return `- 🔴 You lost **${amount}** gold. (${time})`;

          case "payment":
            // User paid you
            if (receiving)
              return `- 💸 **${sender}** paid you **${amount}** gold! (${time})`;

            // You paid user
            return `- 💸 You paid **${receiver}** **${amount}** gold! (${time})`;
        }
      }
    )
    .join("\n");

  // If no balances were found
  if (!transactionsMessage) return interaction.reply("No recent transactions.");

  // Send the formatted balances to the channel
  return await interaction.reply({
    content: transactionsMessage,
    flags: [MessageFlags.Ephemeral],
  });
};
