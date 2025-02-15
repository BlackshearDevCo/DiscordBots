import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Client, GatewayIntentBits } from "discord.js";

export const serverEconomySupabaseClient = createClient(
  process.env.SERVER_ECONOMY_SUPABASE_URL!,
  process.env.SERVER_ECONOMY_SUPABASE_API_KEY!
);

export const emojiRaceSupabaseClient = createClient(
  process.env.EMOJI_RACE_SUPABASE_URL!,
  process.env.EMOJI_RACE_SUPABASE_API_KEY!
);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});
