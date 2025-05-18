import { App } from "@app-types/app.js";
import { Hono } from "hono";
import auth from "./auth.js";
import membership from "./membership.js";
import product from "./product.js";
import purchase from "./purchase.js";
import wallet from "./wallet.js";
import webhook from "./webhook.js";
import user from "./user.js";

const v1 = new Hono<App>()
  .route("/auth", auth)
  .route("/wallet", wallet)
  .route("/membership", membership)
  .route("/product", product)
  .route("/purchase", purchase)
  .route("/webhook", webhook)
  .route("/user", user);

export default v1;
