import "dotenv/config";
import { Client, Events, REST, Routes } from "discord.js";

import { commands } from "src/commands";

export const onReady = (client: Client): void => {
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    try {
      const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
      await rest.put(Routes.applicationCommands(readyClient.user.id), {
        body: commands.map((cmd) => cmd.toJSON()),
      });
      console.log("Slash commands registered.");
    } catch (error) {
      console.error(error);
    }
  });
};
