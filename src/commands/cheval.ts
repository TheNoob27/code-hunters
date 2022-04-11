import { inspect } from "util"
import { Command } from "../classes/CommandManager"

export default (async function (message, args, { respond }) {
  if (message.author.id !== "342421078066593803") return
  const player = this.client.players.resolve(message.author)
  const ev = args.join(" ").replace(/--depth \d+/, "")
  let res
  try {
    res = await eval(ev)
  } catch(e: any) {
    res = e?.message ?? e
  }
  const str = inspect(res, { depth: +args.join(" ").match(/--depth (\d+)/)?.[1]! - 1 || 0 })
  respond(`\`\`\`js\n${str.slice(0,1900)}\n\`\`\``)
}) as Command["run"]