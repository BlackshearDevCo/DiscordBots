import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View the All-time race stats"),
  new SlashCommandBuilder()
    .setName("race")
    .setDescription("Start a new race")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("Time in seconds before the race starts")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Place a bet on a racer")
    .addStringOption((option) =>
      option.setName("emoji").setDescription("Racer emoji").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Bet amount").setRequired(true)
    ),
];
