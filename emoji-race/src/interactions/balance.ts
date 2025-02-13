import { Interaction } from "discord.js";
import { getBalance } from "src/lib/utils";

export const handleBalance = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const balance = await getBalance(interaction.user.id);
  await interaction.reply(`${interaction.user}, you have ${balance} coins.`);
};
