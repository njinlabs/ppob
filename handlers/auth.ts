import Admin from "@app-entities/admin.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { adminSign } from "@app-validations/auth.js";
import { verify } from "argon2";
import { Hono } from "hono";
import authLib from "@app-modules/auth.js";
import authMiddleware from "@app-middlewares/auth.js";

const auth = new Hono<App>()
  .post("/", validator("json", adminSign), async (c) => {
    const { email, password } = await c.req.valid("json");

    try {
      const admin = await Admin.findOneByOrFail({
        email: email.toLowerCase(),
      }).catch(() => {
        throw new Error("Unauthorized");
      });

      if (!(await verify(admin.password, password)))
        throw new Error("Unauthorized");

      return c.json({
        data: {
          ...admin.serialize(),
          token: await authLib().use("admin").generate(admin),
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "Unauthorized")
        return c.text((e as Error)?.message, 401);

      throw e;
    }
  })
  .get("/", authMiddleware("admin"), async (c) =>
    c.json({ data: c.var.auth.user!.serialize() })
  )
  .delete("/", authMiddleware("admin"), async (c) => {
    await c.var.auth.remove();

    return c.json({ data: c.var.auth.user!.serialize() });
  });

export default auth;
