import Admin from "@app-entities/admin.js";
import User from "@app-entities/user.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { faker } from "@faker-js/faker";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";

const client = testClient(app);

describe("User", async () => {
  const token = await auth()
    .use("admin")
    .generate((await Admin.find())[0]);

  test("User list", async () => {
    const response = await client.user.$get(
      {
        query: {},
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Direct topup to user", async () => {
    const user = (await User.find({ relations: { wallet: true } }))[0];

    const response = await client.user[":entity"].topup.$post(
      {
        param: {
          entity: user.id,
        },
        json: {
          amount: faker.number.int({ min: 1000000, max: 5000000 }),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });
});
