import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View your current bank balance"),
  new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User getting paid")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Amount to pay").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("bank")
    .setDescription("Displays all users current bank balance"),
];
