import { Interaction } from "discord.js";
import { checkBalance } from "src/lib/db";

export async function handleBalance(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const balance = await checkBalance(interaction.user);
  await interaction.reply(
    `<@${interaction.user.id}>, you have ${balance} gold.`
  );
}
