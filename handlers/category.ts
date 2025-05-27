import Category from "@app-entities/category.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData } from "@app-validations/general.js";
import { Hono } from "hono";

const category = new Hono<App>()
  .use(auth("admin"))
  .get("/", acl("brand:list"), validator("query", metaData), async (c) => {
    return c.json(await withMeta(Category, await c.req.valid("query")));
  });

export default category;
