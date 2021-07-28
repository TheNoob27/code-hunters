import { Command } from "../classes/CommandManager";

export default (function code(message, args, { respond }) {
  // i'm lazy kekapega
  return respond(this.client.commands.array().map(p => p.name).join(", "))
}) as Command["run"]