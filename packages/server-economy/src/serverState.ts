import { ServerState } from "src/types";

let serverState: ServerState = {
  voiceChannelEntries: {},
  robCooldowns: {},
  dailyRewardCooldown: {},
  gambleCooldown: {},
};

function updateServerState(newServerState: Partial<ServerState>) {
  serverState = {
    ...serverState,
    ...newServerState,
  };
}

function getCurrentServerState() {
  return serverState;
}

export { updateServerState, getCurrentServerState };
