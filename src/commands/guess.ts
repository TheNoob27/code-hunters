import { Command } from "../classes/CommandManager";

export default (function code(message, [code], { respond }) {
  const player = this.client.players.resolve(message.author)
  if (!code) return respond("Please provide a code.", { hidden: true })
  code = code.padStart(2, "0")
  if (!/^\d{2}$/.test(code)) return respond("Please provide a valid code.", { hidden: true })
  if (player.bounty < 1) return respond("It costs $1 to make a guess and you don't have a bounty of $1 yet!", { hidden: true })
  if (!player.claim(code)) return respond("No-one had that code.")
  const holders = this.client.players.cache.filter(p => p.code === code)
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
        }Now the economy has lost ${holders.reduce((n, p) => p.bounty + n, 0).toCurrency()}. `
      : `Successfully guessed the code of ${holders.size === 1 ? "a player" : `${holders.size} players`} - ${holders
          .map(p => p.user)
          .join(", ")}! ${holders.size > 1 ? "Altogether they" : "They"} give you ${holders
          .reduce((n, p) => p.bounty + n, 0)
          .toCurrency()}! ${
          player.streak >= 3
            ? `For guessing codes correct ${player.streak} times in a row, you earn an extra ${(
                10 *
                (player.streak - 3)
              ).toCurrency()}!`
            : ""
        }`
  )
}) as Command["run"]

export const checkReady = true