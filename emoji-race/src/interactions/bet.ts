import { Interaction } from "discord.js";
import { updateBalance } from "src/lib/db";
import { getBalance } from "src/lib/utils";

import { raceState, updateRaceState } from "src/raceState";

export const handleBet = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { raceActive, selectedRacers, bets } = raceState;

  if (!raceActive)
    return interaction.reply("There's no active race! Start one with `/race`.");
  const emoji = interaction.options.get("emoji")?.value as string;
  const betAmount = interaction.options.get("amount")?.value as number;

  if (!selectedRacers.includes(emoji.trim())) {
    return interaction.reply({
      content: "Invalid racer emoji!",
    });
  }

  if (betAmount <= 0) {
    return interaction.reply({
      content: "Bet must be greater than zero!",
    });
  }

  if (bets[interaction.user.id]) {
    return interaction.reply({
      content: "You already placed a bet!",
    });
  }
  const userBalance = await getBalance(interaction.user.id);
  if (userBalance < betAmount) {
    return interaction.reply({
      content: `You don't have enough coins for that bet! Your balance is ${userBalance} coins`,
    });
  }

  await updateBalance(interaction.user.id, -betAmount);
  updateRaceState({
    bets: {
      ...bets,
      [interaction.user.id]: { emoji, amount: betAmount },
    },
  });

  await interaction.reply(
    `${interaction.user} placed a bet of ${betAmount} on ${emoji}!`
  );
};
