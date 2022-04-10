import { Command } from "../classes/CommandManager"

export default (function (message, args, { respond }) {
  const player = this.client.players.resolve(message.author)
  const place =
    [...this.client.players.cache.values()]
      .sort((a, b) => b.bounty - a.bounty)
      .indexOf(player) + 1
  return respond(
    `Your bounty is ${player.bounty.toCurrency()}. You are #${place} on the leaderboard.`,
  )
} as Command["run"])

export const checkReady = true
