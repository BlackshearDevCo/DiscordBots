import { User } from "discord.js";

export interface RaceState {
  raceActive: boolean;
  bets: {
    [key: string]: Bet;
  };
  selectedRacers: Racers;
}

export type Racers = Array<string>;

export type Positions = { [key: string]: number };

export interface Bet {
  emoji: string;
  amount: number;
  user: User;
}

export type UserId = string;

export type CommandName = "stats" | "race" | "bet";
