import { Command } from "../classes/CommandManager"

const cooldown: Record<string, number> = {}
export default (function (message, [code], { respond }) {
  const player = this.client.players.resolve(message.author)
  if (cooldown[player.id] > Date.now()) return respond(`You're on a cooldown! You can guess a code again in ${((cooldown[player.id] - Date.now()) / 1000).toFixed(1)}s.`)
  if (!code) return respond("Please provide a code.", { hidden: true })
  code = code.padStart(2, "0")
  if (!/^\d{2}$/.test(code)) return respond("Please provide a valid code.", { hidden: true })
  if (player.bounty < 1) return respond("It costs $1 to make a guess and you don't have a bounty of $1 yet!", { hidden: true })
  const holders = this.client.players.cache.filter(p => p.code === code)
  if (holders.has(player.id)) return respond("You almost guessed your own code you idiot, luckily I stopped you before you ruined the economy. Quick— change your code before someone claims your bounty!")
  if (!player.claim(code)) {
    cooldown[player.id] = Date.now() + Math.min(600_000, 1000 * (2 ** (player.incorrectGuesses - 3)))
    return respond("No-one had that code.")
  }
  if (cooldown[player.id]) delete cooldown[player.id]
  holders.each(p => this.client.players.cache.delete(p.id))
  return respond(
    holders.has(player.id)
      ? `You just guessed your own code, GG. ${
          holders.size > 1
            ? `You also guessed the code of ${holders
                .filter(p => p.id !== player.id)
                .map(p => p.user)
                .join(", ")}. `
            : ""
        }Now the economy has lost ${player.bounty.toCurrency()}. `
      : `Successfully guessed the code of ${holders.size === 1 ? "a player" : `${holders.size} players`} - ${holders
          .map(p => p.user)
          .join(", ")}! ${holders.size > 1 ? "Altogether they" : "They"} give you ${holders
          .reduce((n, p) => p.bounty + n, 0)
          .toCurrency()}! ${
          player.streak >= 3
            ? `For guessing codes correct ${player.streak} times in a row, you earn an extra ${(
                10 *
                (player.streak - 2)
              ).toCurrency()}!`
            : ""
        }`
  )
}) as Command["run"]

export const checkReady = true
