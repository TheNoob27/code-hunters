import type { Client, User } from "discord.js"
import { PlayerData } from "./Database"
import PlayerManager from "./PlayerManager"

declare module "discord.js" {
  interface Client {
    players: PlayerManager
  }
}

class Player {
  private _code = "" //: `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0}` = ""
  client: Client
  createdTimestamp: number | null = null
  profit = 0
  endTimestamp: number | null = null
  guessed = 0
  streak = 0

  constructor(public user: User, data: PlayerData) {
    this.client = user.client
    Object.defineProperty(this, "client", { value: this.client })
    this.user = user
    if (data.code) this._code = data.code
    if (data.createdTimestamp) this.createdTimestamp = data.createdTimestamp
  }

  get code() {
    return this._code
  }

  set code(v) {
    this._code = v
    const data: Optional<PlayerData> = { code: v }
    if (!this.createdTimestamp) data.createdTimestamp = this.createdTimestamp = Date.now()
    if (!this.user.bot) this.client.db.update(this.id, data)
  }

  get ready(): boolean {
    return this.createdTimestamp != null
  }

  get id() {
    return this.user.id
  }

  get bounty() {
    return (
      (this.createdTimestamp ? +(((this.endTimestamp || Date.now()) - this.createdTimestamp) / 60000).toFixed(2) : 0) +
      this.profit
    )
  }

  claim(code: string) {
    this.profit -= 1
    const holders = this.client.players.cache.filter(p => p.code === code)
    if (!holders.size) {
      this.streak = 0
      this.save(["profit", "streak"])
      return false
    }
    if (++this.streak >= 3) this.profit += 10 * (this.streak - 3)
    holders.each(holder => holder.end(this))
    this.profit += holders.reduce((n, h) => n + h.bounty, 0)
    this.guessed += holders.size
    this.save(["profit", "streak", "guessed"])
    return true
  }

  end(guesser: Player) {
    this.endTimestamp = Date.now()
    this.client.db.delete(this.id)
    this.user.send(`Your code got guessed by ${guesser.user}! You had a bounty of ${this.bounty.toCurrency()}, well done!`).silence()
  }

  save(keys: (keyof Player)[]) {
    if (this.user.bot) return
    this.client.db.update(this.user, Object.assign({}, ...keys.map(k => ({ [k]: this[k] }))))
  }
}

export default Player