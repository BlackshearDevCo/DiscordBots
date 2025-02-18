import { Interaction, MessageFlags } from "discord.js";
import { checkBalance } from "shared/db";

export async function handleBalance(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const balance = await checkBalance(interaction.user);
  await interaction.reply({
    content: `<@${interaction.user.id}>, you have ${balance} gold.`,
    flags: [MessageFlags.Ephemeral],
  });
}
