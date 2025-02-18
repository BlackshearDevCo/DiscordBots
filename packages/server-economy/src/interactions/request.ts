import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  EmbedBuilder,
  Interaction,
  MessageFlags,
} from "discord.js";
import {
  getRequest,
  trackRequest,
  trackTransaction,
  updateRequest,
} from "src/lib/db";
import { checkBalance, transferBalance } from "shared/db";
import { getButtonInteractionCustomId } from "src/lib/utils";
import { PaymentRequest } from "src/types";

export async function handleRequest(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const requesterId = interaction.user.id;
  const recipientId = interaction.options.get("user")?.user?.id as string;
  const amount = interaction.options.get("amount")?.value as number;

  // Insert request into database
  const { data, error } = await trackRequest({
    requester_id: requesterId,
    recipient_id: recipientId,
    amount,
    status: "pending",
  });

  if (error) {
    console.error("Error creating request:", error);
    return interaction.reply({
      content: "Failed to create request. Try again later.",
      ephemeral: true,
    });
  }

  const requestId: number = data.id;

  // Create buttons
  const approveButton = new ButtonBuilder()
    .setCustomId(`approve_request-${requestId}`)
    .setLabel("Approve")
    .setStyle(ButtonStyle.Success);

  const denyButton = new ButtonBuilder()
    .setCustomId(`deny_request-${requestId}`)
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    approveButton,
    denyButton
  );

  // Send request message
  const embed = new EmbedBuilder()
    .setTitle("Gold Request")
    .setDescription(
      `<@${requesterId}> is requesting **${amount}** gold from you.`
    )
    .setColor(0xf1c40f);

  await interaction.reply({
    content: `<@${recipientId}>, you have a gold request!`,
    components: [row],
    embeds: [embed],
  });
}

async function handleRequestData(
  requestId: string,
  interaction: ButtonInteraction<CacheType>
) {
  const { data: request, error: requestError } = await getRequest(
    parseInt(requestId)
  );

  if (requestError || !request) {
    interaction.reply({
      content: "This request no longer exists.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  if (interaction.user.id !== request.recipient_id) {
    interaction.reply({
      content: "This request is not for you!",
      flags: [MessageFlags.Ephemeral],
    });
  }

  return request as PaymentRequest;
}

export async function handleApproveRequest(
  interaction: ButtonInteraction<CacheType>
) {
  const { requestId } = getButtonInteractionCustomId(interaction);
  const request = await handleRequestData(requestId, interaction);
  if (!request) return;

  const { requester_id, recipient_id, amount } = request;

  const balance = checkBalance(interaction.user);

  if (!balance)
    return interaction.reply({
      content: "You don't have enough gold to approve this request!",
      flags: [MessageFlags.Ephemeral],
    });

  const { error: transferError } = await transferBalance(
    recipient_id,
    requester_id,
    amount
  );
  if (transferError) {
    console.error("Error transferring gold:", transferError);
    return interaction.reply({
      content: "Error transferring gold. Try again later.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  await trackTransaction({
    sender_id: recipient_id,
    receiver_id: requester_id,
    amount,
    type: "payment",
  });

  const { error: updateError } = await updateRequest({
    id: parseInt(requestId),
    paid_at: new Date().toISOString(),
    status: "paid",
  });

  if (updateError) {
    console.error("Error updating request:", updateError);
    return interaction.reply({
      content: "Error updating request. Try again later.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("Gold Request Approved")
    .setDescription(
      `<@${recipient_id}> approved a request for **${amount}** gold to <@${requester_id}>.`
    )
    .setColor(0x00ff00);

  await interaction.update({
    content: "Request approved!",
    components: [],
    embeds: [embed],
  });
}

export async function handleDenyRequest(
  interaction: ButtonInteraction<CacheType>
) {
  const { requestId } = getButtonInteractionCustomId(interaction);
  const request = await handleRequestData(requestId, interaction);
  if (!request) return;

  const { requester_id, recipient_id, amount } = request;

  const { error: updateError } = await updateRequest({
    id: parseInt(requestId),
    status: "denied",
  });

  if (updateError) {
    console.error("Error updating request:", updateError);
    return interaction.reply({
      content: "Error updating request. Try again later.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  // Send denial message
  const embed = new EmbedBuilder()
    .setTitle("Gold Request Denied")
    .setDescription(
      `<@${recipient_id}> denied the request from <@${requester_id}> for **${amount}** gold.`
    )
    .setColor(0xff0000);

  await interaction.update({
    content: "Request denied!",
    components: [],
    embeds: [embed],
  });
}
