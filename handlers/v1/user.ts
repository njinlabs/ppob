import User from "@app-entities/user.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { updateProfile } from "@app-validations/user.js";
import { Hono } from "hono";

const user = new Hono<App>()
  .use(auth("user"))
  .put("/", validator("form", updateProfile), async (c) => {
    const user: User = Object.assign(
      c.var.auth.user! as User,
      await c.req.valid("form")
    );
    await user.save();

    return c.json({ data: user.serialize() });
  });

export default user;
