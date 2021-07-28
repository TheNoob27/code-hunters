import { Snowflake } from "discord-api-types"
import { Command } from "../classes/CommandManager"

// i'm lazy, let's use existing methods to confirm
const confirming: Snowflake[] = []
export default (async function code(message, [newCode], { respond, isSlash }) {
  if (!isSlash) return
  const player = this.client.players.resolve(message.author)
  newCode = newCode?.padStart(2, "0")
  if (newCode && !/^\d{2}$/.test(newCode)) return respond("Please provide a valid code.", { hidden: true })
  if (newCode) {
    const isNew = !player.ready
    if (!isNew) {
      if (!confirming.includes(message.author.id))
        return (
          confirming.push(message.author.id),
          respond(
            "Are you sure you want to change your code for $1,000? Run this command with the code again to confirm, or just run `/code`.",
            { hidden: true }
          )
        )
      confirming.remove(message.author.id)
      if (player.bounty < 1000)
        return respond("It costs $1,000 to change your code and you don't have a bounty of $1,000 yet!", {
          hidden: true,
        })
      player.profit -= 1000
    }
    player.code = newCode
    // this.client.db.update(player.id, { code: newCode })
    if (!isNew) await message.channel.send(`${message.author} just changed their code!`)
    return respond(
      `Successfully ${isNew ? "set" : "changed"} your code to \`${player.code}\`. ${
        isNew
          ? "You're now in the game! Other players will try and guess this code to claim your bounty, which rises by $1 every minute, so the longer you survive the more you're worth. You can guess codes with the `guess` command."
          : ""
      }`,
      { hidden: true }
    )
  }
  if (confirming.includes(message.author.id))
    return confirming.remove(message.author.id), respond(`Your code change request has been cancelled.`)
  return respond(`Your code is \`${player.code}\`.`, { hidden: true })
} as Command["run"])
