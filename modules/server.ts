import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import log from "./logger.js";

export class Server {
  private static instance: Server;
  private port!: number;
  private app!: Hono;

  private constructor() {
    this.port = Number(process.env.PORT ?? 3000);
  }

  public static getInstance() {
    if (!Server.instance) throw new Error("Server not booted yet");

    return Server.instance;
  }

  public static boot() {
    Server.instance = new Server();
  }

  public getApp() {
    return this.app;
  }

  public start(app: Hono) {
    this.app = app;
    serve({ fetch: this.app.fetch, port: this.port }, () => {
      log().log.info(`Running on PORT ${this.port}`);
    });
  }
}

const server = Server.getInstance;
export default server;
