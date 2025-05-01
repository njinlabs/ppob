import aclConfig from "@app-config/acl.config.js";
import { type ControlAvailable, type ControlItem } from "@app-types/acl.js";

export function createConfig<
  Keys extends string,
  Item extends Record<Keys, ControlItem>
>(config: Item) {
  return config;
}

export function toList(
  allowed: typeof aclConfig = aclConfig
): ControlAvailable[] {
  return Object.keys(allowed).reduce((carry: ControlAvailable[], item) => {
    for (const list of allowed[item as keyof typeof allowed] || []) {
      carry.push(`${item}:${list}` as ControlAvailable);
    }

    return carry;
  }, [] as ControlAvailable[]);
}
