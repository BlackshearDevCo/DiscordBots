import { Interaction, MessageFlags } from "discord.js";
import { transferBalance } from "shared/db";
import { trackTransaction } from "src/lib/db";

export async function handlePay(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const senderId = interaction.user.id;
  const receiverId = interaction.options.get("user")?.user?.id as string;
  const amount = interaction.options.get("amount")?.value as number;

  const { error } = await transferBalance(senderId, receiverId, amount);
  if (error) {
    console.error("Error transferring gold:", error);
    return interaction.reply({
      content: "Error transferring gold. Try again later.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  await trackTransaction({
    sender_id: senderId,
    receiver_id: receiverId,
    amount,
    type: "payment",
  });
  await interaction.reply(
    `<@${interaction.user.id}> paid ${amount} gold to <@${receiverId}>`
  );
}
