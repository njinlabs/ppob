import { createConfig } from "@app-utils/acl.js";

export default createConfig({
  membership: ["write", "read"],
  user: ["topup", "list"],
  pricing: ["write", "read"],
  product: ["force-sync", "list"],
  brand: ["change-image", "list"],
  category: ["list"],
} as const);
