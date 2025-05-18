import "dotenv/config";
import "reflect-metadata";
import app from "@app-handlers/index.js";
import log from "@app-modules/logger.js";
import server from "@app-modules/server.js";
import bootstrap from "@app-utils/bootstrap.js";
import { updateProduct } from "@app-crons/update-product.js";

bootstrap(["Log", "Database", "Upload", "Auth", "Digiflazz", "Server", "Cron"])
  .then(() => {
    updateProduct().process();
    server().start(app);
  })
  .catch((e) => {
    log().log.error((e as Error).message);
    process.exit(1);
  });
