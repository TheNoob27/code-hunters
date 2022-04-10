import { Command } from "../classes/CommandManager"

export default (function (message, args, { respond }) {
  // i'm lazy kekapega
  return respond([...this.client.commands.values()].map(p => p.name).join(", "))
}) as Command["run"]