import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("bank")
    .setDescription("View the National Bank of Italian Air Bub"),
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View the All-time race stats"),
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance"),
  new SlashCommandBuilder()
    .setName("bless")
    .setDescription("Give a user coins (admin only)")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to bless").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Bless amount").setRequired(true)
    ),
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
