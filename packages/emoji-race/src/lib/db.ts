import { emojiRaceSupabase } from "src/lib/clients";
import { getLosingBets, getWinningBets } from "src/lib/utils";
import { User } from "discord.js";
import { getUserName } from "shared/utils";

export async function updateUserStatsLeaderboard(winner: string) {
  const winningBets = getWinningBets(winner);
  const losingBets = getLosingBets(winner);

  winningBets.forEach(([_, { user }]) => {
    updateUserStats(user, true);
  });

  losingBets.forEach(([_, { user }]) => {
    updateUserStats(user, false);
  });
}

async function updateUserStats(user: User, isWin: boolean) {
  const userStatsData = await getUserStats(user);
  const username = getUserName(user);

  const { error } = await emojiRaceSupabase.from("user_stats").upsert(
    [
      {
        user_id: user.id,
        username,
        wins: isWin ? userStatsData.wins + 1 : userStatsData.wins,
        losses: isWin ? userStatsData.losses : userStatsData.losses + 1,
      },
    ],
    {
      onConflict: "user_id", // Ensures it updates the user if they already exist
    }
  );

  if (error) {
    console.error("Error updating user stats:", error);
  }
}

async function getUserStats(user: User) {
  const { data, error } = await emojiRaceSupabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();
  const username = getUserName(user);

  if (error) {
    if (error.code === "PGRST116") {
      // If no rows found, create a new row with the starting stats
      const { data: insertData, error: insertError } = await emojiRaceSupabase
        .from("user_stats")
        .insert([{ user_id: user.id, username, wins: 0, losses: 0 }])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting new user stats:", insertError);
      }

      return insertData;
    } else {
      // Log any other errors
      console.error("Error fetching balance:", error);
    }
  }

  // If stats data exists, return it
  return data;
}

export async function getAllStats() {
  return await emojiRaceSupabase
    .from("user_stats")
    .select("user_id, username, wins, losses")
    .order("wins", { ascending: false }); // Sort by wins (descending)
}
