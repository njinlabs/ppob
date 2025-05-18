import Product from "@app-entities/product.js";
import Purchase from "@app-entities/purchase.js";
import User from "@app-entities/user.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import verifyBalance from "@app-middlewares/verify-balance.js";
import db from "@app-modules/database.js";
import { App } from "@app-types/app.js";
import { calculateProductPricing } from "@app-utils/pricing.js";
import { addBalance } from "@app-utils/wallet.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData, uuidEntityParam } from "@app-validations/general.js";
import { makePurchase } from "@app-validations/purchase.js";
import currency from "currency.js";
import { Hono } from "hono";
import { Not } from "typeorm";

const purchase = new Hono<App>()
  .use(auth("user"))
  .get("/history", validator("query", metaData), async (c) => {
    return c.json(
      await withMeta(Purchase, await c.req.valid("query"), () => ({
        where: {
          status: Not<"INQUIRY">("INQUIRY"),
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
  .get(
    "/:entity/inquiry",
    validator("param", uuidEntityParam(Purchase, "id")),
    async (c) => {
      const purchase = await c.req.valid("param");

      if (purchase.userId !== c.var.auth.userId)
        return c.json({ message: "Not Allowed" }, 405);

      return c.json({ data: purchase.serialize() });
    }
  )
  .post(
    "/:entity/inquiry",
    validator("param", uuidEntityParam(Purchase, "id")),
    verifyBalance<typeof Purchase>((entity) => entity.total),
    async (c) => {
      const purchase = await c.req.valid("param");

      if (purchase.userId !== c.var.auth.userId)
        return c.json({ message: "Not Allowed" }, 405);

      const data = await db().source.transaction(async (em) => {
        purchase.status = "PENDING";
        await em.getRepository(Purchase).save(purchase);
        await addBalance(em, purchase);

        return purchase.serialize();
      });

      return c.json({ data });
    }
  )
  .get(
    "/:entity",
    validator("param", uuidEntityParam(Purchase, "id")),
    async (c) => {
      const purchase = await c.req.valid("param");

      if (purchase.userId !== c.var.auth.userId)
        return c.json({ message: "Not Allowed" }, 405);

      return c.json({ data: purchase.serialize() });
    }
  )
  .post(
    "/:entity",
    validator("param", uuidEntityParam(Product, "id")),
    validator("json", makePurchase),
    verifyBalance<typeof Product>(async (entity, c) => {
      return currency(
        (await calculateProductPricing(entity, c.var.auth.user! as User)).price
      );
    }),
    async (c) => {
      const data = await db().source.transaction(async (em) => {
        const purchase = await em.getRepository(Purchase).save(
          Purchase.from({
            product: await c.req.valid("param"),
            user: c.var.auth.user as User,
            status: "PENDING",
            details: {},
            customerNumber: await c.req.valid("json").customerNumber,
          })
        );

        await addBalance(em, purchase);

        return purchase.serialize();
      });

      return c.json({ data });
    }
  );

export default purchase;
