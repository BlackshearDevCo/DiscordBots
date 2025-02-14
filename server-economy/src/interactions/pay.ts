import { Interaction } from "discord.js";
import { supabase } from "src/lib/clients";

export async function handlePay(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const senderId = interaction.user.id;
  const receiverId = interaction.options.get("user")?.user?.id;
  const amount = interaction.options.get("amount")?.value;

  const { error } = await supabase.rpc("transfer_balance", {
    sender_id: senderId,
    receiver_id: receiverId,
    amount,
  });

  if (error) console.error("Error transferring coins:", error);
  await interaction.reply(
    `<@${interaction.user.id}> paid ${amount} gold to <@${receiverId}>`
  );
}
