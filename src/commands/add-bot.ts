import { Command } from "../classes/CommandManager";

export default (function code(message, args, { respond }) {
  const player = this.client.players.resolve(message.author)
  if (player.bounty < 100)
    return respond("It costs $100 to add a bot and you don't have a bounty of $100 yet!", { hidden: true })
  const bots = this.client.users.cache.filter(u => u.bot && !this.client.players.cache.has(u.id))
  if (!bots.size) return respond("There are currently no more bots available to spawn in!")
  player.profit -= 100
  player.save(["profit"])
  const bot = this.client.players.resolve(bots.random()!)
  // bots are temporary and die per restart
  bot.code = Math.round(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  bot.profit += Math.floor(Math.random() * 10)
  bot.save(["profit"])
  return respond(`Successfully spawned in a bot: ${bot.user}!`)
}) as Command["run"]

export const checkReady = true