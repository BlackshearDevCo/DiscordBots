import { Interaction } from "discord.js";
import { getAllStats } from "src/lib/db";

export const handleStats = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { data, error } = await getAllStats();

  if (error) {
    console.error("There was an error fetching the leaderboard.", error);
    return interaction.reply("There was an error fetching the leaderboard.");
  }

  // Format the leaderboard into a readable message
  const leaderboardMessage = data
    .map(
      (user, index) =>
        `#${index + 1} ${user.username}: ${user.wins} wins, ${
          user.losses
        } losses`
    )
    .join("\n");

  if (!leaderboardMessage)
    return interaction.reply("No leaderboard data found.");

  await interaction.reply(`**User Stats**:\n${leaderboardMessage}`);
};
