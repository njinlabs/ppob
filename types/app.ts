import authConfig from "@app-config/auth.config.js";

export type App = {
  Variables: {
    auth: InstanceType<
      (typeof authConfig)["guards"][keyof (typeof authConfig)["guards"]]["token"]
    >;
  };
};
