import { AuthGuard } from "@app-types/auth.js";

export function createConfig<
  Keys extends string,
  Guards extends Record<Keys, AuthGuard>
>(config: { guards: Guards; defaultGuard: keyof Guards }) {
  return config;
}
