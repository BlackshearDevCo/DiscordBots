import { Interaction, MessageFlags } from "discord.js";
import { awardGold, checkBalance, loseGold } from "src/lib/db";
import { getUserName } from "src/lib/utils";

const TARGET_AMOUNT = 500;
const MIN_AMOUNT = 2500;

export async function handleRob(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const target = interaction.options.get("user")?.user;
  if (!target) {
    console.error("Can't find user to rob");
    return interaction.reply({
      content: `Can't find user to rob`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  const targetBalance = await checkBalance(target);

  if (!targetBalance)
    return interaction.reply({
      content: `Error: ${getUserName(target)} has no balance or doesn't exist.`,
      flags: [MessageFlags.Ephemeral],
    });

  if (targetBalance < MIN_AMOUNT)
    return interaction.reply({
      content: `You can't rob someone with less than ${MIN_AMOUNT} coins. **Go eat the rich.**`,
      flags: [MessageFlags.Ephemeral],
    });

  const failChance = 0.3; // 30% chance to fail
  const stolenAmount = Math.floor(Math.random() * (TARGET_AMOUNT - 5 + 1)) + 5; // Steal between TARGET_AMOUNT and 5 gold

  if (Math.random() < failChance) {
    const lostAmount = Math.round(stolenAmount / 2);

    await loseGold(interaction.user.id, lostAmount);

    return interaction.reply(
      `<@${interaction.user.id}> got caught trying to rob <@${target.id}>!` +
        "\n" +
        `They lost ${lostAmount} gold in the process.`
    );
  }

  await awardGold(interaction.user.id, stolenAmount); // Give stolen gold to criminal
  await loseGold(target.id, stolenAmount); // Take stolen gold from target

  interaction.reply({
    content: `You successfully stole **${stolenAmount} coins** from <@${target.id}>! 💰}`,
    flags: [MessageFlags.Ephemeral],
  });
}
