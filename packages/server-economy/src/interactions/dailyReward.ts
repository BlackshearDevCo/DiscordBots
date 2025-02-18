import { Interaction, MessageFlags } from "discord.js";
import { awardGold } from "shared/db";
import { trackTransaction } from "src/lib/db";
import { getCurrentServerState, updateServerState } from "src/serverState";

const DAILY_REWARD = 1000;

export async function handleDailyReward(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const userId = interaction.user.id;
  const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

  // Handle daily cooldown
  const { dailyRewardCooldown } = getCurrentServerState();
  const lastClaim = dailyRewardCooldown[userId];

  if (lastClaim === today) {
    return interaction.reply({
      content: `🕒 You've already claimed your daily reward today! Come back tomorrow.`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  updateServerState({
    dailyRewardCooldown: {
      ...dailyRewardCooldown,
      [userId]: today,
    },
  });

  await awardGold(interaction.user, DAILY_REWARD);
  await trackTransaction({
    receiver_id: userId,
    amount: DAILY_REWARD,
    type: "earn",
  });
  await interaction.reply({
    content: `🎁 You claimed your daily reward of **${DAILY_REWARD} coins**!`,
    flags: [MessageFlags.Ephemeral],
  });
}
