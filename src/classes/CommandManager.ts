import { Client, Collection, Message } from "discord.js";
import { readdirSync } from "fs"
import { join as resolvePath } from "path";

declare module "discord.js" {
  interface Client {
    commands: CommandManager
  }
}

export interface Command {
  name: string
  client: Client
  run(
    this: Command,
    message: Message,
    args: string[],
    {
      respond: reply,
      isSlash,
    }: { respond: (content: string | { ack: true }, options?: { hidden: boolean }) => Promise<Message | void>; isSlash: boolean }
  ): void
  checkReady: boolean
}

class CommandManager extends Collection<string, Command> {
  constructor(private client: Client) {
    super()
  }

  load() {
    const commands = readdirSync(resolvePath(__dirname, "../commands"))
    commands.forEach(c => {
      const name = c.slice(0, -3)
      console.log("loading", name)
      const { default: run, checkReady = false } = require(`../commands/${c}`)
      this.set(name, { client: this.client, name, run, checkReady })
    })
    console.log("loaded", commands.length, "commands")
  }

  reload(name: string) {
    try {
      delete require.cache[require.resolve(`../commands/${name}`)]
      const { default: run, checkReady = false } = require(`../commands/${name}`)
      this.set(name, { client: this.client, name, run, checkReady })
      return true
    } catch {
      return false
    }
  }
}

export default CommandManager
