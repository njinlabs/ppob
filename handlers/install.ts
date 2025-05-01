import Admin from "@app-entities/admin.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { toList } from "@app-utils/acl.js";
import axios, { AxiosError } from "axios";
import { Hono } from "hono";
import { z } from "zod";

const install = new Hono<App>()
  .get("/", async (c) => {
    if (await Admin.count())
      return c.json({ message: "Already installed" }, 403);

    return c.json({ message: "Installment ready" }, 200);
  })
  .post(
    "/",
    validator(
      "json",
      z.object({
        admin: z.object({
          fullname: z.string(),
          email: z.string(),
          password: z.string(),
        }),
      })
    ),
    async (c) => {
      const {
        admin: { password, ...admin },
      } = await c.req.valid("json");

      return c.json({
        data: {
          admin: (
            await Admin.from({
              ...admin,
              controls: toList(),
              plainPassword: password,
            }).save()
          ).serialize(),
        },
      });
    }
  );

export default install;
