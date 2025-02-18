import { Interaction, MessageFlags } from "discord.js";
import { awardGold, checkBalance, loseGold } from "shared/db";
import { getCurrentServerState, updateServerState } from "src/serverState";

const GAMBLE_COOLDOWN = 60 * 1000; // 60 seconds in milliseconds

export const handleGamble = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { gambleCooldown } = getCurrentServerState();

  const user = interaction.user;
  const wager = interaction.options.get("amount")?.value as number;

  const lastUsed = gambleCooldown[user.id];
  const timeLeft = GAMBLE_COOLDOWN - (Date.now() - lastUsed);

  if (timeLeft > 0) {
    const seconds = Math.ceil(timeLeft / 1000);
    return interaction.reply({
      content: `⏳ You must wait **${seconds}s** before gambling again!`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  // Catch for incorrect wager amount
  if (!wager || wager <= 0) {
    return await interaction.reply({
      content: "You must bet a positive amount!",
      flags: [MessageFlags.Ephemeral],
    });
  }

  // Get user balance
  const balance = await checkBalance(user);

  if (!balance || balance < wager) {
    return await interaction.reply({
      content: "You don't have enough coins to gamble that much!",
      flags: [MessageFlags.Ephemeral],
    });
  }

  // **Determine Outcome**
  const roll = Math.random() * 100; // Random number between 0-100
  const { message, multiplier } = getWagerResult(roll, wager);

  // Calculate balance change
  const profit = Math.round(wager * multiplier) - wager;

  if (multiplier === 0) {
    await loseGold(user.id, Math.abs(profit));
  } else {
    await awardGold(user, profit);
  }

  // Set cooldown
  updateServerState({
    gambleCooldown: {
      ...gambleCooldown,
      [user.id]: Date.now(),
    },
  });

  return await interaction.reply({
    content: message,
    flags: [MessageFlags.Ephemeral],
  });
};

const getWagerResult = (roll: number, wager: number) => {
  if (roll < 55) {
    // 55% chance
    // Loss
    return { message: `💀 You **lost** ${wager} coins...`, multiplier: 0 };
  } else if (roll < 85) {
    // 30% chance
    const multiplier = 1.5; // Win 1.5x
    return {
      message: `🎉 You **won** ${Math.round(wager * multiplier)} coins!`,
      multiplier,
    };
  } else if (roll < 95) {
    // 10% chance
    const multiplier = 2; // Win 2x
    return {
      message: `🔥 You **won** ${wager * multiplier} coins!`,
      multiplier,
    };
  } else {
    // 5% chance
    const multiplier = 3; // Win 3x
    return {
      message: `🎰 **JACKPOT!** You **won** ${wager * multiplier} coins! 🎊`,
      multiplier,
    };
  }
};
