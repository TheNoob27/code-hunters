import { Command } from "../classes/CommandManager"

export default (function (message, args, { respond }) {
  return respond(
    `There are ${this.client.players.cache.size} players including ${
      this.client.players.cache.filter(p => p.user.bot).size
    } bots.`
  )
}) as Command["run"]