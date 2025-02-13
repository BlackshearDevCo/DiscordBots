import { UserId } from "src/types";
import { supabase } from "src/lib/clients";
import { STARTING_BALANCE } from "src/constants";
import { getBalance, getLosingBets, getWinningBets } from "src/lib/utils";

export async function getUserBalance(userId: UserId) {
  const { data, error } = await supabase
    .from("balances")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // If no rows found, create a new row with the starting balance
      const { error: insertError } = await supabase
        .from("balances")
        .insert([{ user_id: userId, balance: STARTING_BALANCE }])
        .select();

      if (insertError) {
        console.error("Error inserting new user balance:", insertError);
        return STARTING_BALANCE;
      }

      return STARTING_BALANCE; // Return the default starting balance
    } else {
      // Log any other errors
      console.error("Error fetching balance:", error);
      return STARTING_BALANCE;
    }
  }

  return data.balance || STARTING_BALANCE;
}

export async function getAllBalances() {
  return await supabase.from("balances").select("user_id, balance");
}

export async function updateBalance(userId: UserId, amount: number) {
  const userBalance = await getBalance(userId);

  const { error } = await supabase
    .from("balances")
    .upsert([{ user_id: userId, balance: Math.max(userBalance + amount, 0) }], {
      onConflict: "user_id",
    });

  if (error) {
    console.error("Error updating balance:", error);
  }
}

export async function updateUserStatsLeaderboard(winner: string) {
  const winningBets = getWinningBets(winner);
  const losingBets = getLosingBets(winner);

  winningBets.forEach(([userId]) => {
    updateUserStats(userId, true);
  });

  losingBets.forEach(([userId]) => {
    updateUserStats(userId, false);
  });
}

async function updateUserStats(userId: UserId, isWin: boolean) {
  const userStatsData = await getUserStats(userId);

  const { error } = await supabase.from("user_stats").upsert(
    [
      {
        user_id: userId,
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

async function getUserStats(userId: UserId) {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // If no rows found, create a new row with the starting stats
      const { data: insertData, error: insertError } = await supabase
        .from("user_stats")
        .insert([{ user_id: userId, wins: 0, losses: 0 }])
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
  return await supabase
    .from("user_stats")
    .select("user_id, wins, losses")
    .order("wins", { ascending: false }); // Sort by wins (descending)
}
