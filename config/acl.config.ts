import { createConfig } from "@app-utils/acl.js";

export default createConfig({
  membership: ["write", "read"],
  user: ["topup"],
  pricing: ["write", "read"],
  product: ["force-sync"],
  brand: ["change-image"],
} as const);
