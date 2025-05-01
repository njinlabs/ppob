import { type ControlAvailable } from "@app-types/acl.js";
import { App } from "@app-types/app.js";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export default function acl(...actions: ControlAvailable[]) {
  return async (c: Context<App>, next: Next) => {
    const parsedUserConrolList = (
      c.var.auth.user as { controls?: ControlAvailable[] } | undefined
    )?.controls;

    if (!actions.find((el) => parsedUserConrolList?.includes(el)))
      throw new HTTPException(403, {
        message: "Action is not allowed",
      });

    await next();
  };
}
