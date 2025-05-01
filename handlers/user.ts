import TopUp from "@app-entities/topup.js";
import User from "@app-entities/user.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import db from "@app-modules/database.js";
import { App } from "@app-types/app.js";
import { addBalance } from "@app-utils/wallet.js";
import { uuidEntityParam } from "@app-validations/general.js";
import { userTopUp } from "@app-validations/user.js";
import { Hono } from "hono";

const user = new Hono<App>()
  .use(auth("admin"))
  .post(
    "/:entity/topup",
    acl("user:topup"),
    validator("param", uuidEntityParam(User, "id")),
    validator("json", userTopUp),
    async (c) => {
      const user = await c.req.valid("param");
      const { amount } = await c.req.valid("json");

      const data = await db().source.transaction(async (em) => {
        const topup = await TopUp.from({
          amount,
          detail: {
            confirmedBy: {
              id: c.var.auth.user!.id,
              name: c.var.auth.user!.fullname,
            },
          },
          method: "DIRECT ADMIN",
          status: "SUCCEED",
          fees: [],
          user,
        }).save();

        await addBalance(em, topup);

        return topup.serialize();
      });

      return c.json({ data });
    }
  );

export default user;
