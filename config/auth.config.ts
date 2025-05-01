import AdminToken from "@app-entities/admin-token.js";
import Admin from "@app-entities/admin.js";
import UserToken from "@app-entities/user-token.js";
import User from "@app-entities/user.js";
import { createConfig } from "@app-utils/auth.js";

export default createConfig({
  guards: {
    admin: {
      user: Admin,
      token: AdminToken,
    },
    user: {
      user: User,
      token: UserToken,
    },
  },
  defaultGuard: "user",
});
