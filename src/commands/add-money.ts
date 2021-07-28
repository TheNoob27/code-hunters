import { Snowflake } from "discord.js";
import { Command } from "../classes/CommandManager";

export default (async function code(message, [userID, money], { respond }) {
  if (message.author.id !== "342421078066593803") return
  const user = await this.client.users.fetch(userID as Snowflake).silence()
  if (!user) return respond("Couldn't find that user.")
  const player = this.client.players.resolve(user)
  const add = +money || 0
  player.profit += add
  player.save(["profit"])
  if (user.bot && !player.code)
    player.code = Math.round(Math.random() * 100)
      .toString()
      .padStart(2, "0")
  return respond(`Successfully added ${add.toCurrency()} to ${user}.`)
}) as Command["run"]