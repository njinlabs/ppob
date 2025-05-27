import User from "@app-entities/user.js";
import WalletLedger from "@app-entities/wallet-ledger.js";
import Wallet from "@app-entities/wallet.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData } from "@app-validations/general.js";
import { Hono } from "hono";

const wallet = new Hono<App>()
  .use(auth("user"))
  .get("/history", validator("query", metaData), async (c) => {
    return c.json(
      await withMeta(WalletLedger, await c.req.valid("query"), () => ({
        where: {
          wallet: {
            userId: c.var.auth.user!.id,
          },
        },
        order: {
          createdAt: "DESC",
        },
      }))
    );
  })
  .get("/", async (c) => {
    const wallet = await Wallet.findOneByOrFail({
      userId: c.var.auth.user!.id,
    });

    return c.json({ data: wallet.serialize() });
  });

export default wallet;
