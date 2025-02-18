import "dotenv/config";
import { Client, Events, VoiceState } from "discord.js";
import { getCurrentServerState, updateServerState } from "src/serverState";
import { trackTransaction } from "src/lib/db";
import { awardGold } from "shared/db";

export const onVoiceStateUpdate = (client: Client): void => {
  client.on(
    Events.VoiceStateUpdate,
    async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
      const oldChannelId = oldVoiceState.channelId;
      const newChannelId = newVoiceState.channelId;
      const userId = newVoiceState.member?.user.id;
      const { voiceChannelEntries } = getCurrentServerState();

      // User joins voice channel
      if (userId && newChannelId && !oldChannelId) {
        updateServerState({
          voiceChannelEntries: {
            ...voiceChannelEntries,
            [newChannelId]: {
              ...voiceChannelEntries[newChannelId],
              [userId]: Date.now(), // store joined timestamp
            },
          },
        });
      }

      // User leaving voice channel
      if (userId && !newChannelId && oldChannelId) {
        const currentTimeStamp = Date.now();

        const payment = await processCallPayment(
          currentTimeStamp,
          voiceChannelEntries[oldChannelId][userId]
        );

        if (payment) {
          await awardGold(newVoiceState.member.user, payment);
          await trackTransaction({
            receiver_id: userId,
            amount: payment,
            type: "earn",
          });
        }

        const newVoiceChannelEntries = Object.fromEntries(
          Object.entries(voiceChannelEntries[oldChannelId]).filter(
            ([uId]) => uId !== userId
          )
        );

        updateServerState({
          voiceChannelEntries: {
            ...voiceChannelEntries,
            [oldChannelId]: newVoiceChannelEntries,
          },
        });
      }

      // Optional: Check if other users joined call and increase gold for all by multiplier
    }
  );
};

async function processCallPayment(
  joinTimestamp: number,
  leaveTimestamp: number
) {
  const payRatePerMinute = 25;

  const minutesJoined = Math.round((joinTimestamp - leaveTimestamp) / 60000);

  // Calculate duration in minutes (rounded)
  const durationMinutes = Math.max(1, minutesJoined);
  const earnedGold = durationMinutes * payRatePerMinute;

  // At least 1 min
  return durationMinutes > 0 ? earnedGold : 0;
}
