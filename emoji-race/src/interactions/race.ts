import { DMChannel, Interaction, TextChannel } from "discord.js";
import { DEFAULT_WAIT_LENGTH, RACER_COUNT, TRACK_LENGTH } from "src/constants";
import { updateUserStatsLeaderboard } from "src/lib/db";
import {
  distributeWinnings,
  getAvailableEmojis,
  getMovement,
  determineWinner,
  renderTrack,
} from "src/lib/utils";
import { getCurrentRaceState, updateRaceState } from "src/raceState";
import { Positions, Racers } from "src/types";

const ONE_SECOND = 1000;

// TODO: !!!IMPORTANT!!! Refactor please please please
export const handleRace = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  // Cast typing since not all interaction channels have `send` method, but any interaction that reaches here should
  const channel = interaction.channel as TextChannel | DMChannel | null;

  if (getCurrentRaceState().raceActive)
    return interaction.reply("A race is already in progress!");
  if (!interaction.guild)
    return interaction.reply("Guild not found. Try again in a few minutes.");

  const waitAmount = interaction.options.get("time")?.value as number;
  const selectedRacers: Racers = getAvailableEmojis(interaction.guild)
    .sort(() => 0.5 - Math.random())
    .slice(0, RACER_COUNT);

  // Set active race state
  updateRaceState({
    raceActive: true,
    bets: {},
    selectedRacers,
  });

  let countdown = waitAmount || DEFAULT_WAIT_LENGTH;
  const countdownMessage = await interaction.reply(
    getCountdownMessageText(countdown)
  );

  // Update countdown message every second
  let countDownInterval = setInterval(async () => {
    countdown -= 1;
    await countdownMessage.edit(getCountdownMessageText(countdown));
  }, ONE_SECOND);

  // Set race to start after countdown finishes
  setTimeout(async () => {
    let positions: Positions = selectedRacers.reduce(
      (acc, emoji) => ({ ...acc, [emoji]: 0 }),
      {}
    );

    clearInterval(countDownInterval);
    let raceMessage = await channel?.send(
      renderTrack(selectedRacers, positions)
    );

    // Redundancy. Should never reach here.
    if (!raceMessage)
      return channel?.send(`Something went wrong. Try again in a few minutes.`);

    let interval = setInterval(async () => {
      for (let racer of selectedRacers) {
        positions[racer] += getMovement();
      }

      // When racer(s) reach the end of the track...
      if (Math.max(...Object.values(positions)) >= TRACK_LENGTH) {
        clearInterval(interval);

        let winners = selectedRacers.filter(
          (racer) => positions[racer] >= TRACK_LENGTH
        );

        let winner = determineWinner(winners, positions);
        let payoutText = await distributeWinnings(winner);

        await raceMessage.edit(renderTrack(selectedRacers, positions));

        // Reset race state
        updateRaceState({ raceActive: false, selectedRacers: [], bets: {} });
        updateUserStatsLeaderboard(winner);

        return channel?.send(
          `🏆 The race is over! Winner: ${winner}\n\n${payoutText}`
        );
      }

      await raceMessage.edit(renderTrack(selectedRacers, positions));
    }, ONE_SECOND);
  }, (countdown + 1) * ONE_SECOND); // Add 1 second to countdown so race doesn't start as soon as it hits zero, gives padding time which feels more natural
};

const getCountdownMessageText = (timeLeft: number) => {
  const { selectedRacers } = getCurrentRaceState();

  return `🏁 The race is starting! Competitors: ${selectedRacers.join(
    " "
  )}\nPlace your bets with \`/bet <emoji> <amount>\`! You have ${timeLeft} seconds.`;
};
