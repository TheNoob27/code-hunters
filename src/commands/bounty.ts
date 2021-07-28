import { Command } from "../classes/CommandManager"

export default (function bounty(message, args, { respond }) {
  const player = this.client.players.resolve(message.author)
  const place =
    this.client.players.cache
      .array()
      .sort((a, b) => b.bounty - a.bounty)
      .indexOf(player) + 1
  return respond(
    `Your bounty is ${player.bounty.toCurrency()}. You are #${place} on the leaderboard.`,
    // { hidden: true }
  )
} as Command["run"])

export const checkReady = true
