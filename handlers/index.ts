import log from "@app-modules/logger.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { TypeORMError } from "typeorm";
import auth from "./auth.js";
import brand from "./brand.js";
import category from "./category.js";
import install from "./install.js";
import membership from "./membership.js";
import pricing from "./pricing.js";
import product from "./product.js";
import user from "./user.js";
import v1 from "./v1/index.js";

const app = new Hono()
  .use(cors())
  .use("/uploads/*", serveStatic({ root: "./" }))
  .route("/v1", v1)
  .route("/auth", auth)
  .route("/user", user)
  .route("/membership", membership)
  .route("/pricing", pricing)
  .route("/install", install)
  .route("/product", product)
  .route("/brand", brand)
  .route("/category", category);

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
