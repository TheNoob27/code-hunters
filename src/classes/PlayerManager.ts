import { Client, Collection, Snowflake, User } from "discord.js";
import Player from "./Player";

class PlayerManager {
  cache = new Collection<string, Player>()
  constructor (public client: Client) {}

  async fetchAllPlayers() {
    const list = this.client.db.fetchAllPlayers()
    console.log("fetching", list.length, "players")
    for (const data of list) {
      // console.log(data.userID, data)
      const user = await this.client.users.fetch(data.userID).silence()
      if (!user) continue
      this.cache.set(user.id, new Player(user, data))
    }
  }

  resolve(user: User): Player {
    if (this.cache.has(user.id)) return this.cache.get(user.id)!
    const data = this.client.db.fetchPlayer(user)
    this.cache.set(user.id, new Player(user, data!))
    return this.cache.get(user.id)!
  }
}

export default PlayerManager