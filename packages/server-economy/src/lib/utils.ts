import { ButtonInteraction, CacheType } from "discord.js";

export function getButtonInteractionCustomId(
  interaction: ButtonInteraction<CacheType>
) {
  const [action, requestId] = interaction.customId.split("-");
  return { action, requestId };
}
