import PricingPackage from "@app-entities/pricing-package.js";
import PricingRule from "@app-entities/pricing-rule.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import db from "@app-modules/database.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData, uuidEntityParam } from "@app-validations/general.js";
import { composePricing } from "@app-validations/pricing.js";
import { Hono } from "hono";
import { Not } from "typeorm";

const pricing = new Hono()
  .use(auth("admin"))
  .patch(
    "/:entity/default",
    acl("pricing:write"),
    validator("param", uuidEntityParam(PricingPackage, "id")),
    async (c) => {
      const pricing = await c.req.valid("param");

      const data = await db().source.transaction(async (em) => {
        await em.getRepository(PricingPackage).update(
          {
            id: Not(pricing.id),
          },
          {
            isDefault: false,
          }
        );

        pricing.isDefault = !pricing.isDefault;
        await em.getRepository(PricingPackage).save(pricing);

        return pricing.serialize();
      });

      return c.json({ data });
    }
  )
  .get(
    "/:entity",
    acl("pricing:read"),
    validator("param", uuidEntityParam(PricingPackage, "id")),
    async (c) => {
      const pricing = await c.req.valid("param");
      pricing.sortRules();

      return c.json({ data: pricing.serialize() });
    }
  )
  .delete(
    "/:entity",
    acl("pricing:write"),
    validator("param", uuidEntityParam(PricingPackage, "id")),
    async (c) => {
      const pricing = await (await c.req.valid("param")).remove();

      return c.json({ data: pricing.serialize() });
    }
  )
  .put(
    "/:entity",
    acl("pricing:write"),
    validator("param", uuidEntityParam(PricingPackage, "id")),
    validator("json", composePricing),
    async (c) => {
      const pricingPackage = await c.req.valid("param");
      const { rules, ...data } = await c.req.valid("json");
      const pricingRules = rules.map((item, index) =>
        PricingRule.from({ ...item, sort: index })
      );

      await db().source.getRepository(PricingRule).remove(pricingPackage.rules);
      await pricingPackage.assign({ ...data, rules: pricingRules }).save();

      return c.json({ data: pricingPackage.serialize() });
    }
  )
  .post(
    "/",
    acl("pricing:write"),
    validator("json", composePricing),
    async (c) => {
      const { rules, ...data } = await c.req.valid("json");
      const pricingRules = rules.map((item, index) =>
        PricingRule.from({ ...item, sort: index })
      );

      const pricingPackage = await PricingPackage.from({
        ...data,
        rules: pricingRules,
      }).save();

      return c.json({ data: pricingPackage.serialize() });
    }
  )
  .get("/", acl("pricing:read"), validator("query", metaData), async (c) =>
    c.json(await withMeta(PricingPackage, await c.req.valid("query")))
  );

export default pricing;
