import { updateProduct } from "@app-crons/update-product.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import { App } from "@app-types/app.js";
import { Hono } from "hono";

const product = new Hono<App>()
  .use(auth("admin"))
  .post("/force-sync", acl("product:force-sync"), async (c) => {
    await updateProduct().process();

    return c.json({ message: "Product was synced" });
  });

export default product;
