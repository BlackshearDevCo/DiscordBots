import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Client, GatewayIntentBits, Partials } from "discord.js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!,
  {
    global: {
      headers: {
        "X-Client-Info": "discord-bot",
        Prefer: `current_setting('discord.bot_id', true) = '${process.env.BOT_ID}'`,
      },
    },
  }
);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
