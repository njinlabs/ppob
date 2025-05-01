import db from "@app-modules/database.js";
import bootstrap from "@app-utils/bootstrap.js";
import { afterAll, beforeAll } from "bun:test";

const gracefullStop = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });

beforeAll(async () => {
  await bootstrap(["Log", "Database", "Auth", "Digiflazz", "Server"]);
});

afterAll(async () => {
  await gracefullStop();
  await db().countAll();
  await db().source.dropDatabase();
  await db().source.destroy();
});
