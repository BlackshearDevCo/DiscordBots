import { Interaction, PermissionsBitField } from "discord.js";
import { updateBalance } from "src/lib/db";

export const handleBless = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  if (
    !(interaction.member?.permissions as Readonly<PermissionsBitField>)?.has(
      "Administrator"
    )
  ) {
    return interaction.reply({
      content: "You need admin permissions to use this command.",
    });
  }

  const targetUser = interaction.options.get("user")?.user;
  const targetAmount = interaction.options.get("amount")?.value as number;

  if (!targetUser) {
    await interaction.reply(`Can't find user`);
    return;
  }

  await updateBalance(targetUser.id, targetAmount);
  await interaction.reply(
    `${targetUser}, you have been blessed with ${targetAmount} coins!`
  );
};
