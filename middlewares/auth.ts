import authConfig from "@app-config/auth.config.js";
import { App } from "@app-types/app.js";
import { Context } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import authLib from "@app-modules/auth.js";

export default function auth(guard: keyof typeof authConfig.guards) {
  return bearerAuth({
    verifyToken: async (token, c: Context<App>) => {
      try {
        const valid = await authLib().use(guard).validate(token);
        c.set("auth", valid);
        return true;
      } catch (e) {
        return false;
      }
    },
    noAuthenticationHeaderMessage: "Authentication required",
    invalidAuthenticationHeaderMessage: "Authentication invalid",
    invalidTokenMessage: "Unauthorized",
  });
}
