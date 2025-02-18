import { Interaction, MessageFlags } from "discord.js";
import { trackTransaction } from "src/lib/db";
import { checkBalance, loseGold, transferBalance } from "shared/db";
import { getCurrentServerState, updateServerState } from "src/serverState";
import { getUserName } from "shared/utils";

const TARGET_AMOUNT = 500;
const MIN_AMOUNT = 2500;
const STEAL_COOLDOWN = 10 * 60 * 1000; // 5 minutes in milliseconds

export async function handleRob(interaction: Interaction) {
  if (!interaction.isCommand()) return;
  const userId = interaction.user.id;

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
      content: `You can't rob someone with less than ${MIN_AMOUNT} gold. **Go eat the rich.**`,
      flags: [MessageFlags.Ephemeral],
    });

  const failChance = 0.3; // 30% chance to fail
  const stolenAmount = Math.floor(Math.random() * (TARGET_AMOUNT - 5 + 1)) + 5; // Steal between TARGET_AMOUNT and 5 gold

  // Handle rob cooldown
  const { robCooldowns } = getCurrentServerState();
  const lastUsed = robCooldowns[userId];
  const timeLeft = STEAL_COOLDOWN - (Date.now() - lastUsed);

  if (timeLeft > 0) {
    const minutes = Math.ceil(timeLeft / 60000);
    return interaction.reply({
      content: `You must wait ${minutes} more minute(s) before stealing again!`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  updateServerState({
    robCooldowns: {
      ...robCooldowns,
      [userId]: Date.now(),
    },
  });

  // Handle random chance at failing rob event
  if (Math.random() < failChance) {
    const lostAmount = Math.round(stolenAmount / 2);

    await loseGold(userId, lostAmount);
    await trackTransaction({
      receiver_id: userId,
      amount: lostAmount,
      type: "rob",
    });

    return interaction.reply(
      `<@${userId}> got caught trying to rob <@${target.id}>!` +
        "\n" +
        `They lost ${lostAmount} gold in the process.`
    );
  }

  await transferBalance(target.id, interaction.user.id, stolenAmount);
  await trackTransaction({
    sender_id: target.id,
    receiver_id: userId,
    amount: stolenAmount,
    type: "rob",
  });

  interaction.reply({
    content: `You successfully stole **${stolenAmount} gold** from <@${target.id}>! 💰}`,
    flags: [MessageFlags.Ephemeral],
  });
}
