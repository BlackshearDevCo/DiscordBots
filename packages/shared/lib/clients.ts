import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const serverEconomySupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!
);
