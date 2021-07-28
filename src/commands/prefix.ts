import { Command } from "../classes/CommandManager";

export default (function code(message, args, { respond }) {
  const prefix = args.join(" ") === "none" ? "" : args.join(" ")
  const { prefix: p } = this.client.db.fetchPlayer(message.author)!
  if (!args.length) return respond(`Your prefix is \`${p || " "}\`.`)
  this.client.db.update(message.author, { prefix })
  return respond(`Successfully set your prefix to \`${prefix || " "}\`.`)
}) as Command["run"]