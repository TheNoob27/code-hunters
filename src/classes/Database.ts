import Sqlite, { Database as SqliteDatabase } from "better-sqlite3"
import { resolve as resolvePath } from "path"
import { Client, Collection, UserResolvable, Snowflake } from "discord.js";

declare module "discord.js" {
  interface Client {
    db: Database
  }
}

export interface PlayerData {
  userID: Snowflake
  code?: string
  createdTimestamp?: number
  prefix?: string
  profit?: number
  streak?: number
  guessed?: number
}

class Database {
  db: SqliteDatabase = new Sqlite(resolvePath(__dirname, "../../bot.sqlite"))
  cache: Collection<string, PlayerData> = new Collection()
  constructor(public client: Client) {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS players (
        userID TEXT NOT NULL PRIMARY KEY,
        code TEXT,
        createdTimestamp INTEGER,
        prefix TEXT,
        profit INTEGER,
        streak INTEGER,
        guessed INTEGER
      )
    `).run()
  }

  fetchPlayer(user: UserResolvable): PlayerData | null {
    const id = this.client.users.resolveId(user)
    if (!id) return null
    if (this.cache.has(id)) return this.cache.get(id)!
    const data = this.db.prepare(`SELECT * FROM players WHERE userID = ?`).get(id)
    if (data) return this.cache.set(id, data), data
    this.db.prepare(`INSERT INTO players (userID, prefix) VALUES (?, ';')`).run(id)
    return { userID: id, prefix: ";" }
  }

  fetchAllPlayers(): PlayerData[] {
    return this.db.prepare(`SELECT * FROM players WHERE code IS NOT NULL`).all()
  }
  
  update(user: UserResolvable, data: Optional<Omit<PlayerData, "userID">>): PlayerData {
    const id = this.client.users.resolveId(user)!
    console.log("updating", id, data)
    this.db.prepare(`UPDATE players SET ${Object.keys(data).map(k => `${k} = @${k}`)} WHERE userID = ?`).run(data, id)
    if (!this.cache.has(id)) return this.fetchPlayer(id)!
    return Object.assign(this.cache.get(id), data)
  }
  
  delete(id: string): void {
    this.db.prepare("DELETE FROM players WHERE userID = ?").run(id)
  }
}

export default Database