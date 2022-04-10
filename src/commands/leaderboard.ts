import { Command } from "../classes/CommandManager";

export default (function code(message, args, { respond }) {
  const player = this.client.players.resolve(message.author)
  const ordered = this.client.players.cache.array().filter(p => p.ready).sort((a, b) => b.bounty - a.bounty)
  const list = ordered.first(10)
  const place = ordered.indexOf(player) + 1
  return respond(`
    >>> __Bounty Leaderboard__
    ${list.map((p, i) => `${i + 1}: ${p.user.tag}${p.user.bot ? " :robot:" : ""} - ${p.bounty.toCurrency()}`).join("\n")}
    ${place <= 10 ? "" : `...\n${place}: ${message.author.tag} - ${player.bounty.toCurrency()}`}
  `.stripIndents())
}) as Command["run"]