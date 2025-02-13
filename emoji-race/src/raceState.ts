import { RaceState } from "src/types";

let raceState: RaceState = {
  raceActive: false,
  bets: {},
  selectedRacers: [],
};

function updateRaceState(newRaceState: Partial<RaceState>) {
  raceState = {
    ...raceState,
    ...newRaceState,
  };
}

function getCurrentRaceState() {
  return raceState;
}

export { updateRaceState, getCurrentRaceState };
