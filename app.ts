import app from "@app-handlers/index.js";
import log from "@app-modules/logger.js";
import server from "@app-modules/server.js";
import bootstrap from "@app-utils/bootstrap.js";
import "reflect-metadata";

bootstrap(["Log", "Database", "Auth", "Digiflazz", "Server", "Cron"])
  .then(() => {
    server().start(app);
  })
  .catch((e) => {
    log().log.error((e as Error).message);
    process.exit(1);
  });
