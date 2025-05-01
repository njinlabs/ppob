import { Logger, pino } from "pino";

export class Log {
  private static instance: Log;
  public log: Logger;

  private constructor() {
    this.log = pino(
      pino.transport({
        targets: [
          {
            target: "pino/file",
            options: {
              destination: "./app.log",
            },
          },
        ],
      })
    );
  }

  public static getInstance() {
    if (!Log.instance) throw new Error("Logger not booted yet");

    return Log.instance;
  }

  public static async boot() {
    Log.instance = new Log();
  }
}

const log = Log.getInstance;
export default log;
