import { Hono } from "hono";
import auth from "./auth.js";
import v1 from "./v1/index.js";
import membership from "./membership.js";
import { HTTPException } from "hono/http-exception";
import { TypeORMError } from "typeorm";
import user from "./user.js";
import pricing from "./pricing.js";
import log from "@app-modules/logger.js";
import install from "./install.js";
import product from "./product.js";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono()
  .use("/uploads/*", serveStatic({ root: "./" }))
  .route("/v1", v1)
  .route("/auth", auth)
  .route("/user", user)
  .route("/membership", membership)
  .route("/pricing", pricing)
  .route("/install", install)
  .route("/product", product);

app.onError(async (err, c) => {
  if (err instanceof HTTPException)
    return c.json({ message: err.message }, err.status);

  if (err instanceof TypeORMError && err.name === "EntityNotFoundError") {
    return c.json({ message: "Entity not found" }, 404);
  }

  log().log.error(err);

  return c.json({ message: "Internal error" }, 500);
});

export default app;
