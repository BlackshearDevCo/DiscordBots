import { User } from "discord.js";
import "dotenv/config";
import { supabase } from "src/lib/clients";
import { getUserName } from "src/lib/utils";

const STARTING_BALANCE = 10000;

export async function checkBalance(user: User): Promise<number | null> {
  const { data, error } = await supabase
    .from("balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      const username = getUserName(user);

      const { error: insertError } = await supabase
        .from("balances")
        .insert([{ user_id: user.id, username, balance: STARTING_BALANCE }])
        .select();

      if (insertError) {
        console.error("Error inserting new user balance:", insertError);
      }

      return STARTING_BALANCE;
    }

    console.error("Error fetching balance:", error);
    return null;
  }

  return data.balance;
}

export async function getAllBalances() {
  return await supabase
    .from("balances")
    .select("user_id, username, balance")
    .order("balance", { ascending: false });
}

export async function awardGold(userId: string, amount: number) {
  const { data, error } = await supabase.rpc("increment_balance", {
    _user_id: userId,
    _amount: amount,
  });

  if (error) console.error("Error earning coins:", error);
  return data;
}

export async function loseGold(userId: string, amount: number) {
  const { data, error } = await supabase.rpc("decrement_balance", {
    _user_id: userId,
    _amount: amount,
  });

  if (error) console.error("Error losing coins:", error);
  return data;
}
