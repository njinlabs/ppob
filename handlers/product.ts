import { updateProduct } from "@app-crons/update-product.js";
import Product from "@app-entities/product.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { upload, uuidEntityParam } from "@app-validations/general.js";
import { Hono } from "hono";
import { z } from "zod";

const product = new Hono<App>()
  .use(auth("admin"))
  .post("/force-sync", acl("product:force-sync"), async (c) => {
    await updateProduct().process();

    return c.json({ message: "Product was synced" });
  })
  .put(
    "/:entity/image",
    acl("product:update-image"),
    validator("param", uuidEntityParam(Product, "id")),
    validator(
      "form",
      z.object({
        image: upload({
          mime: ["image/jpeg", "image/png", "image/webp"],
          size: 3 * 1024 * 1024,
        }),
      })
    ),
    async (c) => {
      const { image } = await c.req.valid("form");
      const product = await c.req.valid("param");

      product.image = image;
      await product.save();

      return c.json({ data: product.serialize() });
    }
  );

export default product;
