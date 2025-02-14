import "dotenv/config";

import { onReady } from "src/listeners/ready";
import { onInteractionCreate } from "src/listeners/interactionCreate";
import { client } from "src/lib/clients";
import { onVoiceStateUpdate } from "src/listeners/voiceStateUpdate";
import { onMessageCreate } from "src/listeners/messageCreate";
import { onMessageReactionAdd } from "src/listeners/messageReactionAdd";

onReady(client);

onInteractionCreate(client);

onMessageCreate(client);

onMessageReactionAdd(client);

onVoiceStateUpdate(client);

client.login(process.env.TOKEN);
