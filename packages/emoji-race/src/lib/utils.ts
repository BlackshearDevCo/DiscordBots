import { Positions, Racers } from "src/types";
import { Guild } from "discord.js";
import { DEFAULT_RACERS, TRACK_LENGTH } from "src/constants";
import { getCurrentRaceState } from "src/raceState";
import { awardGold } from "shared/db";

export function getAvailableEmojis(guild: Guild) {
  const guildEmojis = guild.emojis.cache
    .filter((emoji) => !emoji.animated)
    .map((emoji) => emoji.toString());
  if (!guildEmojis.length) return DEFAULT_RACERS;
  return guildEmojis;
}

export function renderTrack(
  racers: Racers,
  positions: Positions,
  trackLength: number = TRACK_LENGTH
) {
  return racers
    .map((emoji) => {
      const pos = Math.min(positions[emoji], trackLength);
      return "⬛".repeat(pos) + emoji + "⬛".repeat(trackLength - pos) + "🏁";
    })
    .join("\n");
}

export function getMovement() {
  const potentialMoves = [1, 2, 3];
  const weights = [0.4, 0.35, 0.25];

  for (let i = 0; i < potentialMoves.length; i++) {
    // Checks random value to be below weighted value to determine potential move
    // Higher moves are less likely
    if (Math.random() < weights[i]) return potentialMoves[i];
  }

  // Fallback if all potential moves fail
  return 1;
}

// Returns winner, settling tiebreaker if necessary
export function determineWinner(winners: Racers, positions: Positions) {
  let maxDistance = Math.max(...winners.map((racer) => positions[racer]));
  let topCandidates = winners.filter(
    (racer) => positions[racer] === maxDistance
  );

  if (topCandidates.length === 1) return topCandidates[0];
  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}

// Potential refactor for performance: Combine with getLosingBets
export function getWinningBets(winningEmoji: string) {
  const { bets } = getCurrentRaceState();
  const winningBets = Object.entries(bets).filter(
    ([_, bet]) => bet.emoji === winningEmoji
  );
  return winningBets;
}

// Potential refactor for performance: Combine with getWinningBets
export function getLosingBets(winningEmoji: string) {
  const { bets } = getCurrentRaceState();

  const losingBets = Object.entries(bets).filter(
    ([_, bet]) => bet.emoji !== winningEmoji
  );
  return losingBets;
}

export async function distributeWinnings(winner: string) {
  const winningBets = getWinningBets(winner);
  const { bets } = getCurrentRaceState();

  if (winningBets.length === 0)
    return "No one bet on the winning emoji! The house wins. 🎰";

  const totalBetPool = Object.values(bets).reduce(
    (sum, bet) => sum + bet.amount,
    0
  );
  const totalWinningBet = winningBets.reduce(
    (sum, [_, bet]) => sum + bet.amount,
    0
  );

  let payoutText = "**Payouts:**\n";
  for (let [userId, bet] of winningBets) {
    let userShare = (bet.amount / totalWinningBet) * totalBetPool;
    await awardGold(bet.user, userShare);
    payoutText += `<@${userId}> wins ${Math.floor(userShare)} coins!\n`;
  }
  return payoutText;
}
