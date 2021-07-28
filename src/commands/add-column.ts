import { Command } from "../classes/CommandManager";

export default (function code(message, [column], { respond }) {
  if (message.author.id !== "342421078066593803") return
  this.client.db.db.prepare(`ALTER TABLE players ADD COLUMN ${column}`)
  respond("done", { hidden: true })
}) as Command["run"]