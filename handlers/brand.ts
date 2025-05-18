import Brand from "@app-entities/brand.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { upload, uuidEntityParam } from "@app-validations/general.js";
import { Hono } from "hono";
import { z } from "zod";

const brand = new Hono<App>().use(auth("admin")).put(
  "/:entity/image",
  acl("brand:change-image"),
  validator("param", uuidEntityParam(Brand, "id")),
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
    const brand = await c.req.valid("param");

    brand.image = image;
    await brand.save();

    return c.json({ data: brand.serialize() });
  }
);

export default brand;
