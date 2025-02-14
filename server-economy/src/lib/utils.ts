import { User } from "discord.js";

export function getUserName(user: User) {
  return user.globalName || user.username;
}
