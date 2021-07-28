import { Command } from "../classes/CommandManager";

export default (async function code(message, [newCode], { respond, isSlash }) {
  if (!isSlash) return
  const player = this.client.players.resolve(message.author)
  newCode = newCode?.padStart(2, "0")
  if (newCode && !/^\d{2}$/.test(newCode)) return respond("Please provide a valid code.", { hidden: true })
  if (newCode) {
    const isNew = !player.ready
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
  return respond(`Your code is \`${player.code}\`.`, { hidden: true })
}) as Command["run"]