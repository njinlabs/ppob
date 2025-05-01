import User from "@app-entities/user.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";

const client = testClient(app);

describe("Wallet", async () => {
  const token = await auth()
    .use("user")
    .generate((await User.find())[0]);

  test("Load wallet", async () => {
    const response = await client.v1.wallet.$get(
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(response.status).toBe(200);
  });

  test("Read user wallet transaction histories", async () => {
    const response = await client.v1.wallet.history.$get(
      { query: {} },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    const { data } = await response.json();
    expect(data).toBeArray();
    expect(data.length).toBeGreaterThan(0);
  });
});
