import { Interaction } from "discord.js";
import { trackTransaction, transferBalance } from "src/lib/db";

export async function handlePay(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const senderId = interaction.user.id;
  const receiverId = interaction.options.get("user")?.user?.id as string;
  const amount = interaction.options.get("amount")?.value as number;

  const { error } = await transferBalance(senderId, receiverId, amount);
  await trackTransaction({
    sender_id: senderId,
    receiver_id: receiverId,
    amount,
    type: "payment",
  });

  if (error) console.error("Error transferring gold:", error);
  await interaction.reply(
    `<@${interaction.user.id}> paid ${amount} gold to <@${receiverId}>`
  );
}
