import { Interaction } from "discord.js";
import { getAllStats } from "src/lib/db";

export const handleStats = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { data, error } = await getAllStats();

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return interaction.reply("There was an error fetching the leaderboard.");
  }

  // Format the leaderboard into a readable message
  const leaderboardMessage = data
    .map(
      (user, index) =>
        `#${index + 1} <@${user.user_id}>: ${user.wins} wins, ${
          user.losses
        } losses`
    )
    .join("\n");

  if (!leaderboardMessage) {
    return interaction.reply("No leaderboard data found.");
  }

  // Send the formatted leaderboard to the channel
  await interaction.reply(`**User Stats**:\n${leaderboardMessage}`);
};
