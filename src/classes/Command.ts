interface CommandData {
  name: string,

}
class Command {
  name: CommandData["name"]
  constructor({ name }: CommandData) {
    this.name = name
  }
}