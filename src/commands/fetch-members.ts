import { Command } from "../classes/CommandManager"

export default (async function (message, args, { respond }) {
  if (!message.guild) return
  await message.guild.members.fetch()
  return respond(`Successfully fetched ${message.guild.members.cache.size}/${message.guild.memberCount} members!`)
}) as Command["run"]