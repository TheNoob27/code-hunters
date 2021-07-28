import { Command } from "../classes/CommandManager";

export default (function code(message, args, { respond }) {
  const player = this.client.players.resolve(message.author)
  if (player.bounty < 50)
    return respond("It costs $50 to add a bot and you don't have a bounty of $50 yet!", { hidden: true })
  const ready = this.client.players.cache.filter(p => p.id !== message.author.id && p.ready)
  if (ready.size <= 1) return respond("No-one else is playing!")
  player.profit -= 50
  player.save(["profit"])
  const num = [...new Set(ready.random().code.split("").map(Number))]
  const numbers = [...new Set([...10].shuffle().concat(num).reverse())].slice(0, 5).shuffle()
  return respond(`Your 5 numbers are: \`${numbers.join("")}\`. Select the right two to reveal someone's code.`)
}) as Command["run"]

export const checkReady = true