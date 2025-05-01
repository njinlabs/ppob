import User from "@app-entities/user.js";
import authMiddleware from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import authLib from "@app-modules/auth.js";
import { App } from "@app-types/app.js";
import { userRegister, userSign } from "@app-validations/auth.js";
import { verify } from "argon2";
import { Hono } from "hono";

const auth = new Hono<App>()
  .post("/register", validator("json", userRegister), async (c) => {
    const { password: plainPassword, ...data } = await c.req.valid("json");

    const user = await User.from({
      ...data,
      plainPassword,
    }).save();

    return c.json({
      data: {
        ...user.serialize(),
        token: await authLib().use("user").generate(user),
      },
    });
  })
  .post("/login", validator("json", userSign), async (c) => {
    const { email, password } = await c.req.valid("json");

    try {
      const user = await User.findOneOrFail({
        where: [{ email: email.toLowerCase() }, { phone: email }],
      }).catch(() => {
        throw new Error("Unauthorized");
      });

      if (!(await verify(user.password, password)))
        throw new Error("Unauthorized");

      return c.json({
        data: {
          ...user.serialize(),
          token: await authLib().use("user").generate(user),
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "Unauthorized")
        return c.text((e as Error)?.message, 401);

      throw e;
    }
  })
  .get("/check-token", authMiddleware("user"), async (c) =>
    c.json({ data: c.var.auth.user?.serialize() })
  )
  .delete("/logout", authMiddleware("user"), async (c) => {
    await c.var.auth.remove();

    return c.json({
      data: c.var.auth.user?.serialize(),
    });
  });

export default auth;
