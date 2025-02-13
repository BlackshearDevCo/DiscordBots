import { Interaction, PermissionsBitField } from "discord.js";
import { updateBalance } from "src/lib/db";

export const handleBless = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const isAdministrator = !(
    interaction.member?.permissions as Readonly<PermissionsBitField>
  )?.has("Administrator");

  // Not admin
  if (isAdministrator) {
    return interaction.reply({
      content: "You need admin permissions to use this command.",
    });
  }

  const targetUser = interaction.options.get("user")?.user;
  const targetAmount = interaction.options.get("amount")?.value as number;

  // Should never reach here, but guard in case no user found
  if (!targetUser) return await interaction.reply(`Can't find user`);

  await updateBalance(targetUser.id, targetAmount);
  await interaction.reply(
    `${targetUser}, you have been blessed with ${targetAmount} coins!`
  );
};
