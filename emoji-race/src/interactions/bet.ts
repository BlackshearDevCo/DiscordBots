import { Interaction } from "discord.js";
import { updateBalance } from "src/lib/db";
import { getBalance } from "src/lib/utils";

import { getCurrentRaceState, updateRaceState } from "src/raceState";

export const handleBet = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { raceActive, selectedRacers, bets } = getCurrentRaceState();

  if (!raceActive)
    return interaction.reply("There's no active race! Start one with `/race`.");

  const emoji = interaction.options.get("emoji")?.value as string;
  const betAmount = interaction.options.get("amount")?.value as number;

  // Emoji isn't a competing in the race or invalid emoji
  if (!selectedRacers.includes(emoji.trim())) {
    return interaction.reply({
      content: "Invalid racer emoji!",
    });
  }

  // Invalid bet amount
  if (betAmount <= 0) {
    return interaction.reply({
      content: "Bet must be greater than zero!",
    });
  }

  // Bet already placed
  if (bets[interaction.user.id]) {
    return interaction.reply({
      content: "You already placed a bet!",
    });
  }

  // User doesn't have enough money for their bet amount
  const userBalance = await getBalance(interaction.user.id);
  if (userBalance < betAmount) {
    return interaction.reply({
      content: `You don't have enough coins for that bet! Your balance is ${userBalance} coins`,
    });
  }

  await updateBalance(interaction.user, -betAmount);
  updateRaceState({
    bets: {
      ...bets,
      [interaction.user.id]: {
        emoji,
        amount: betAmount,
        user: interaction.user,
      },
    },
  });

  await interaction.reply(
    `${interaction.user} placed a bet of ${betAmount} on ${emoji}!`
  );
};
