import * as modules from "@app-modules/index.js";

export default async function bootstrap(runs: (keyof typeof modules)[]) {
  for (const module of runs) {
    await modules[module].boot();
  }
}
