import * as Gears from "@enitoni/gears"
import * as ws from "ws"
import WebSocket = require("ws")

export type AdapterOptions = {
  path: string
} & ws.ClientOptions

export type Message = {
  content: ws.Data
  reply: (content: ws.Data) => ws.Data
}

export class ClientWrapper {
  private _socket?: WebSocket

  constructor(
    private options: AdapterOptions,
    private hooks: Gears.AdapterHooks<Message>
  ) {}

  public connect() {
    const { path, ...rest } = this.options

    this._socket = new WebSocket(path, rest)
    this.attach(this._socket)
  }

  public reconnect() {
    this.unattach(this._socket!)
    this.connect()
  }

  public send(message: ws.Data) {
    this.socket.send(message)
  }

  private unattach(socket: WebSocket) {
    const { hooks } = this

    socket.off("open", hooks.ready)
    socket.off("error", hooks.error)
    socket.off("message", this.handleMessage)
    socket.off("close", this.handleDisconnect)
  }

  private handleMessage = (content: ws.Data) => {
    const { hooks } = this

    const reply = (content: ws.Data) => {
      this.send(content)
      return content
    }

    hooks.message({ content, reply })
  }

  private handleDisconnect = () => {
    const { hooks } = this

    hooks.unready()
    this.reconnect()
  }

  private attach(socket: WebSocket) {
    const { hooks } = this

    socket.on("open", hooks.ready)
    socket.on("error", hooks.error)
    socket.on("message", this.handleMessage)
    socket.on("close", this.handleDisconnect)
  }

  public get socket() {
    if (!this._socket) {
      throw new Error("Can't get socket before connecting")
    }

    return this._socket
  }
}

export class Adapter extends Gears.ClientAdapter<Message, ClientWrapper, AdapterOptions> {
  protected register(options: AdapterOptions, hooks: Gears.AdapterHooks<Message>) {
    const client = new ClientWrapper(options, hooks)

    return {
      client,
      methods: {
        start: async () => {
          client.connect()
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
