import aclConfig from "@app-config/acl.config.js";

export type ControlItem<List extends string = any> = Array<List>;

export type ControlAvailable = {
  [K in keyof typeof aclConfig]: `${K &
    string}:${(typeof aclConfig)[K][number]}`;
}[keyof typeof aclConfig];

export type ControlList = {
  [key in keyof typeof aclConfig]: Array<(typeof aclConfig)[key][number]>;
};
