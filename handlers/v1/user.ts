import UserToken from "@app-entities/user-token.js";
import User from "@app-entities/user.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { updatePassword, updateProfile } from "@app-validations/user.js";
import { verify } from "argon2";
import { Hono } from "hono";

const user = new Hono<App>()
  .use(auth("user"))
  .put("/password", validator("json", updatePassword), async (c) => {
    const { password, newPassword } = await c.req.valid("json");
    const user = c.var.auth.user! as User;

    if (!(await verify(user.password, password)))
      return c.json({ message: "Unauthorized" }, 401);

    user.plainPassword = newPassword;
    await user.save();

    await UserToken.delete({ userId: user.id });
    return c.json({ data: user.serialize() });
  })
  .put("/", validator("form", updateProfile), async (c) => {
    const user: User = Object.assign(
      c.var.auth.user! as User,
      await c.req.valid("form")
    );
    await user.save();

    return c.json({ data: user.serialize() });
  });

export default user;
