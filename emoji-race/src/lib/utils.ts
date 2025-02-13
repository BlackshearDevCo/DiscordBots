import { Positions, Racers, UserId } from "src/types";
import { getUserBalance, updateBalance } from "src/lib/db";
import { Guild } from "discord.js";
import { DEFAULT_RACERS, TRACK_LENGTH } from "src/constants";
import { raceState } from "src/raceState";

export async function getBalance(userId: UserId) {
  return getUserBalance(userId);
}

export function getAvailableEmojis(guild: Guild) {
  const guildEmojis = guild.emojis.cache
    .filter((emoji) => !emoji.animated)
    .map((emoji) => emoji.toString());
  if (!guildEmojis.length) return DEFAULT_RACERS;
  return guildEmojis;
}

export function renderTrack(racers: Racers, positions: Positions) {
  return racers
    .map((emoji) => {
      const pos = Math.min(positions[emoji], TRACK_LENGTH);
      return "⬛".repeat(pos) + emoji + "⬛".repeat(TRACK_LENGTH - pos) + "🏁";
    })
    .join("\n");
}

export function getMovement() {
  const moves = [1, 2, 3];
  const weights = [0.4, 0.35, 0.25];
  let random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < moves.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return moves[i];
    }
  }
  return 1;
}

export function handleTiebreaker(winners: Racers, positions: Positions) {
  let maxDistance = Math.max(...winners.map((racer) => positions[racer]));
  let topCandidates = winners.filter(
    (racer) => positions[racer] === maxDistance
  );
  if (topCandidates.length === 1) {
    return topCandidates[0];
  }
  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}

export function getWinningBets(winningEmoji: string) {
  const { bets } = raceState;
  const winningBets = Object.entries(bets).filter(
    ([_, bet]) => bet.emoji === winningEmoji
  );

  return winningBets;
}

export function getLosingBets(winningEmoji: string) {
  const { bets } = raceState;
  const losingBets = Object.entries(bets).filter(
    ([_, bet]) => bet.emoji !== winningEmoji
  );

  return losingBets;
}

export async function distributeWinnings(winner: string) {
  const winningBets = getWinningBets(winner);

  const { bets } = raceState;

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
    await updateBalance(userId, userShare);
    payoutText += `<@${userId}> wins ${Math.floor(userShare)} coins!\n`;
  }
  return payoutText;
}
