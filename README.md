# gears-ws

This package adds [ws](https://www.npmjs.com/package/ws) bindings to [Gears](https://www.npmjs.com/package/@enitoni/gears).

## Client usage

```ts
import { Adapter, Bot, CommandBuilder } from "@enitoni/gears-ws/client"
import { matchPrefixes } from "@enitoni/gears"

const adapter = new Adapter({
  path: "ws://localhost:1337"
})

const command = new CommandBuilder()
  .match(matchPrefixes("!test"))
  .use(context => {
    const { message } = context

    return message.reply("Got your message!")
  })
  .done()

const bot = new Bot({
  adapter,
  commands: [command]
})

bot.start().then(() => {
  // bot is running, log something here if you want
})
```

## Server usage

Server usage is the same, except for a few differences:

```ts
import { Adapter, Bot, CommandBuilder } from "@enitoni/gears-ws/server"
import { matchPrefixes } from "@enitoni/gears"

const adapter = new Adapter({
  port: 1337
})

const command = new CommandBuilder()
  .match(matchPrefixes("!test"))
  .use(context => {
    const { message } = context

    return message.reply("Got your message!")
  })
  .done()

const bot = new Bot({
  adapter,
  commands: [command]
})

bot.start().then(() => {
  // bot is running, log something here if you want
})
```

If you wish to get the socket from the message, you can access it via `message.socket`
