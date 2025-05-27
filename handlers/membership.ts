import Membership from "@app-entities/membership.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData, uuidEntityParam } from "@app-validations/general.js";
import { composeMembership } from "@app-validations/membership.js";
import { Hono } from "hono";

const membershipEntityParam = uuidEntityParam(Membership, "id");

const membership = new Hono<App>()
  .use(auth("admin"))
  .put(
    "/:entity",
    acl("membership:write"),
    validator("param", membershipEntityParam),
    validator("json", composeMembership),
    async (c) => {
      const { pricingId: pricing, ...data } = await c.req.valid("json");
      const membership = (await c.req.valid("param")).assign(data);

      if (pricing) {
        membership.pricingId = pricing.id;
      }

      await membership.save();

      return c.json({ data: membership.serialize() });
    }
  )
  .delete(
    "/:entity",
    acl("membership:write"),
    validator("param", membershipEntityParam),
    async (c) => {
      const membership = await (await c.req.valid("param")).remove();

      return c.json({ data: membership.serialize() });
    }
  )
  .get(
    "/:entity",
    acl("membership:read"),
    validator("param", membershipEntityParam),
    async (c) => c.json({ data: await c.req.valid("param").serialize() })
  )
  .get("/", acl("membership:read"), validator("query", metaData), async (c) => {
    return c.json(await withMeta(Membership, await c.req.valid("query")));
  })
  .post(
    "/",
    acl("membership:write"),
    validator("json", composeMembership),
    async (c) => {
      const { pricingId: pricing, ...data } = await c.req.valid("json");
      const membership = Membership.from(data);

      if (pricing) {
        membership.pricingId = pricing.id;
      }

      await membership.save();

      return c.json({ data: membership.serialize() });
    }
  );

export default membership;
