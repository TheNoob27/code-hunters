import { Client, Message, Options, User } from "discord.js"
import CommandManager from "./classes/CommandManager"
import Database from "./classes/Database"
import PlayerManager from "./classes/PlayerManager"
import dotenv from "dotenv"
import "./global"
import path from "path"

const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_MESSAGES",
  ],
  allowedMentions: { parse: ["users"] },
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    // ChannelManager: 5,
  }),
})
client.db = new Database(client)
client.players = new PlayerManager(client)
client.commands = new CommandManager(client)
client.commands.load()

client.on("ready", async () => {
  console.log("Code Hunters is ready!")
  console.time("fetching all players")
  await client.players.fetchAllPlayers()
  console.timeEnd("fetching all players")
})
client.on("messageCreate", message => {
  if (message.author.bot) return
  const { prefix } = client.db.fetchPlayer(message.author)!
  if (message.content.match(new RegExp(`^<@!?${client.user!.id}>$`))) {
    const economy = client.players.cache.reduce((t, p) => t + p.bounty, 0)
    const player = client.players.resolve(message.author)
    return void message.channel.send(
      `
      __**Code Hunters**__ ${
        !player.ready
          ? `
            Welcome to Code Hunters!
            The game works by everyone getting a code and trying to guess everyone else's code to claim their bounty. A player's bounty rises by the second, so the longer you survive the greater your bounty will be!
            Set your code with \`/code [code]\` to start the game, and run \`${prefix}help\` or \`/help\` to see all commands.
            `
          : ""
      }
      The economy is ${economy > 100_000 ? "booming" : "growing"} - a total of ${economy.toCurrency()}!
      ${
        player.ready
          ? `
            **Your Bounty**: ${player.bounty.toCurrency()}
            **Guess Streak**: ${player.streak}
            **Codes Guessed**: ${player.guessed}
            **Code Created**: <t:${Math.round(player.createdTimestamp! / 1000)}:R>
            `
          : ""
      }
      `.stripIndents()
    )
  }

  if (!message.content.startsWith(prefix!)) return
  const [cmd, ...args] = message.content.slice(prefix!.length).trim().split(/ +/)
  const command = client.commands.get(cmd)
  if (!command) return
  if (command.checkReady && !client.players.resolve(message.author).ready)
    return void message.channel.send(
      `You haven't started the game yet! Set your code with \`/code [code]\` to start the game.`
    )
  try {
    const c = command.run(message, args, {
      respond: (content: string | { ack: true }) => {
        return message.channel.send(content as string)
      },
      isSlash: false,
    }) as unknown
    if (c instanceof Promise) c.catch(console.error)
  } catch (e) {
    console.error(e)
  }
})

client.on("interactionCreate", interaction => {
  if (!interaction.isCommand()) return 
  console.log("recieved interaction /"+interaction.commandName)
  const command = client.commands.get(interaction.commandName)!
  ;(interaction as any).author = interaction.user
  if (command.checkReady && !client.players.resolve(interaction.user).ready)
    return void interaction.reply({
      content: `You haven't started the game yet! Set your code with \`/code [code]\` to start the game.`,
      ephemeral: true,
    })
  try {
    const c = command.run(
      interaction as unknown as Message,
      interaction.options.data.map(o => String(o.value)),
      {
        respond: (content: string | { ack: true }, options?: { hidden: boolean }) => {
          console.log("replying")
          if (typeof content !== "string") {
            return content.ack && interaction.deferReply()
          }
          return interaction.reply({ content, ephemeral: options?.hidden })
        },
        isSlash: true,
      }
    ) as unknown
    if (c instanceof Promise) c.catch(console.error)
  } catch (e) {
    console.error(e)
  }
})

dotenv.config({ path: path.join(__dirname, "../.env") })

client.login(process.env.TOKEN).then(() => console.log("Logged in as", client.user!.tag))