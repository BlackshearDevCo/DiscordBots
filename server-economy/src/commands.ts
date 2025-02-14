import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("View your current bank balance."),
  new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user gold.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User getting paid.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Amount to pay").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("bank")
    .setDescription("Displays all users current bank balance."),
  new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Try to rob gold from another user, but don't get caught!")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to rob").setRequired(true)
    ),
];
