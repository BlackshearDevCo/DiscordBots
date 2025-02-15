import { User } from "discord.js";
import "dotenv/config";
import { supabase } from "src/lib/clients";
import { getUserName } from "src/lib/utils";
import {
  PaymentRequest,
  PaymentRequestEntry,
  TransactionEntry,
} from "src/types";

const STARTING_BALANCE = 10000;

export async function trackTransaction(transaction: TransactionEntry) {
  const { data, error } = await supabase
    .from("transactions")
    .insert([transaction])
    .select();

  if (error) console.error("Error logging transaction", error);

  return data;
}

export async function trackRequest(request: PaymentRequestEntry) {
  return await supabase.from("requests").insert([request]).select().single();
}

export async function getRequest(requestId: PaymentRequest["id"]) {
  return await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();
}

export async function updateRequest(request: Partial<PaymentRequest>) {
  return await supabase
    .from("requests")
    .update(request)
    .eq("id", request.id)
    .select();
}

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

export async function getRecentTransactions(userId: User["id"]) {
  return await supabase
    .from("transactions")
    .select("sender_id, receiver_id, amount, type, timestamp")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("timestamp", { ascending: false })
    .limit(10);
}

export async function transferBalance(
  senderId: string,
  receiverId: string,
  amount: number
) {
  return await supabase.rpc("transfer_balance", {
    sender_id: senderId,
    receiver_id: receiverId,
    amount,
  });
}

export async function awardGold(user: User, amount: number) {
  const { data, error } = await supabase.rpc("increment_balance", {
    _user_id: user.id,
    _amount: amount,
    _username: getUserName(user),
  });

  if (error) console.error("Error earning gold:", error);
  return data;
}

export async function loseGold(userId: string, amount: number) {
  const { data, error } = await supabase.rpc("decrement_balance", {
    _user_id: userId,
    _amount: amount,
  });

  if (error) console.error("Error losing gold:", error);
  return data;
}
