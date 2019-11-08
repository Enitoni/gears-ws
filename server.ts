import * as Gears from "@enitoni/gears"
import * as ws from "ws"
import WebSocket = require("ws")

export type AdapterOptions = ws.ServerOptions

export type Message = {
  content: ws.Data
  socket: WebSocket
  reply: (content: ws.Data) => ws.Data
}

export class ClientWrapper {
  private _server?: ws.Server

  constructor(
    private options: AdapterOptions,
    private hooks: Gears.AdapterHooks<Message>
  ) {}

  private handleConnection = (socket: WebSocket) => {
    const reply = (content: ws.Data) => {
      socket.send(content)
      return content
    }

    const handleMessage = (content: ws.Data) => {
      this.hooks.message({ content, reply, socket })
    }

    socket.on("message", handleMessage)
    socket.on("error", this.hooks.error)

    socket.on("close", () => {
      socket.removeAllListeners()
    })
  }

  public start() {
    const server = (this._server = new ws.Server(this.options))

    server.on("connection", this.handleConnection)
    server.on("error", this.hooks.error)

    this.hooks.ready()
  }

  public get server() {
    if (!this._server) {
      throw new Error("Can't get server before starting")
    }

    return this._server
  }
}

export class Adapter extends Gears.ClientAdapter<Message, ClientWrapper, AdapterOptions> {
  protected register(options: AdapterOptions, hooks: Gears.AdapterHooks<Message>) {
    const client = new ClientWrapper(options, hooks)

    return {
      client,
      methods: {
        start: async () => {
          client.start()
        },
        getMessageContent: (message: Message) => message.content.toString()
      }
    }
  }
}

export type Context<S = unknown> = Gears.Context<S, Message, ClientWrapper>
export type Matcher<S extends object = {}> = Gears.Matcher<S, Message, ClientWrapper>
export type Middleware<S = unknown> = Gears.Middleware<S, Message, ClientWrapper>

export declare class Command<D = unknown> extends Gears.Command<
  Message,
  ClientWrapper,
  D
> {}

export declare class CommandGroup<D = unknown> extends Gears.CommandGroup<
  Message,
  ClientWrapper,
  D
> {}

export declare class CommandBuilder<D = unknown> extends Gears.CommandBuilder<
  Message,
  ClientWrapper,
  D
> {}

export declare class CommandGroupBuilder<D = unknown> extends Gears.CommandGroupBuilder<
  Message,
  ClientWrapper,
  D
> {}

export declare class Service extends Gears.Service<Message, ClientWrapper> {}
export declare class Bot extends Gears.Bot<Message, ClientWrapper> {}

exports.Command = Gears.Command
exports.CommandGroup = Gears.CommandGroup
exports.CommandBuilder = Gears.CommandBuilder
exports.CommandGroupBuilder = Gears.CommandGroupBuilder
exports.Service = Gears.Service
exports.Bot = Gears.Bot
