export interface RaceState {
  raceActive: boolean;
  bets: {
    [key: string]: Bet;
  };
  selectedRacers: Racers; // TODO: Update
}

export type Racers = Array<string>;

export type Positions = { [key: string]: number };

export interface Bet {
  emoji: string;
  amount: number;
}

export type UserId = string;

export type CommandName =
  | "bank"
  | "stats"
  | "balance"
  | "bless"
  | "race"
  | "bet";
