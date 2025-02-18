import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Client, GatewayIntentBits } from "discord.js";

export const emojiRaceSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!
);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});
