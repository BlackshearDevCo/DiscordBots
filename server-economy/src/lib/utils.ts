import { ButtonInteraction, CacheType, User } from "discord.js";

export function getUserName(user: User) {
  return user.globalName || user.username;
}

export function getButtonInteractionCustomId(
  interaction: ButtonInteraction<CacheType>
) {
  const [action, requestId] = interaction.customId.split("-");
  return { action, requestId };
}
