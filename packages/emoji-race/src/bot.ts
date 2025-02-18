import "dotenv/config";

import { onReady } from "src/listeners/ready";
import { onInteractionCreate } from "src/listeners/interactionCreate";
import { client } from "src/lib/clients";

onReady(client);

onInteractionCreate(client);

client.login(process.env.TOKEN);
