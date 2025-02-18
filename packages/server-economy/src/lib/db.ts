import "dotenv/config";
import { User } from "discord.js";
import { serverEconomySupabase } from "shared/clients";
import {
  PaymentRequest,
  PaymentRequestEntry,
  TransactionEntry,
} from "src/types";

export async function trackTransaction(transaction: TransactionEntry) {
  const { data, error } = await serverEconomySupabase
    .from("transactions")
    .insert([transaction])
    .select();

  if (error) console.error("Error logging transaction", error);

  return data;
}

export async function trackRequest(request: PaymentRequestEntry) {
  return await serverEconomySupabase
    .from("requests")
    .insert([request])
    .select()
    .single();
}

export async function getRequest(requestId: PaymentRequest["id"]) {
  return await serverEconomySupabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();
}

export async function updateRequest(request: Partial<PaymentRequest>) {
  return await serverEconomySupabase
    .from("requests")
    .update(request)
    .eq("id", request.id)
    .select();
}

export async function getAllBalances() {
  return await serverEconomySupabase
    .from("balances")
    .select("user_id, username, balance")
    .order("balance", { ascending: false });
}

export async function getRecentTransactions(userId: User["id"]) {
  return await serverEconomySupabase
    .from("transactions")
    .select("sender_id, receiver_id, amount, type, timestamp")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("timestamp", { ascending: false })
    .limit(10);
}
