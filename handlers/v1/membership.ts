import MembershipPayment from "@app-entities/membership-payment.js";
import Membership from "@app-entities/membership.js";
import User from "@app-entities/user.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import verifyBalance from "@app-middlewares/verify-balance.js";
import db from "@app-modules/database.js";
import { App } from "@app-types/app.js";
import { addBalance } from "@app-utils/wallet.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData, uuidEntityParam } from "@app-validations/general.js";
import { Hono } from "hono";

const membership = new Hono<App>()
  .use(auth("user"))
  .get("/my", async (c) => {
    const membership = await (c.var.auth.user! as User).membership;

    return c.json({ data: membership });
  })
  .get("/history", validator("query", metaData), async (c) => {
    return c.json(
      await withMeta(MembershipPayment, await c.req.valid("query"), () => ({
        where: {
          user: {
            id: c.var.auth.user?.id,
          },
        },
        order: {
          createdAt: "DESC",
        },
      }))
    );
  })
  .post(
    "/:entity",
    validator("param", uuidEntityParam(Membership, "id")),
    verifyBalance<typeof Membership>((entity) => entity.price),
    async (c) => {
      const data = await db().source.transaction(async (em) => {
        const membershipPayment = await MembershipPayment.from({
          membership: await c.req.valid("param"),
          user: c.var.auth.user as User,
        }).save();

        await addBalance(em, membershipPayment);

        return membershipPayment.serialize();
      });

      return c.json({ data });
    }
  );

export default membership;
