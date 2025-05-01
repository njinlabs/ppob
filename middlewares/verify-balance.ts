import Base from "@app-entities/base.js";
import Wallet from "@app-entities/wallet.js";
import { App } from "@app-types/app.js";
import { calculateFee } from "@app-utils/transform-fee.js";
import currency from "currency.js";
import { Context } from "hono";
import { createMiddleware } from "hono/factory";

export default function verifyBalance<T extends typeof Base>(
  callback: (
    entity: InstanceType<T>,
    c: Context<App>
  ) => currency | Promise<currency>
) {
  return createMiddleware<
    App,
    "/:entity",
    {
      in: {
        param: {
          entity: string;
        };
      };
      out: {
        param: Promise<InstanceType<T>>;
      };
    }
  >(async (c, next) => {
    const wallet = await Wallet.findOneByOrFail({
      userId: c.var.auth.user?.id,
    });
    const entity = await c.req.valid("param");
    const { total } = await calculateFee(await callback(entity, c));

    if (wallet.balance.intValue < total.intValue)
      return c.json({ message: "Insufficient balance" }, 405);

    await next();
  });
}
