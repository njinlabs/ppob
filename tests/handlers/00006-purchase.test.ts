import Product from "@app-entities/product.js";
import User from "@app-entities/user.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { describe, expect, test } from "bun:test";
import currency from "currency.js";
import { testClient } from "hono/testing";
import { MoreThan } from "typeorm";

const client = testClient(app);

describe("Purchase API", async () => {
  const user = (
    await User.find({
      where: {
        wallet: {
          balance: MoreThan(currency(0)),
        },
      },
      relations: {
        wallet: true,
      },
    })
  )[0];

  const userToken = await auth().use("user").generate(user);

  test("Make purchase", async () => {
    const product = (await Product.find({}))[0];

    const response = await client.v1.purchase[":entity"].$post(
      {
        param: {
          entity: product.id,
        },
        json: {
          customerNumber: "081271762774",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    const balanceExpected = user.wallet.balance.subtract(
      currency((await response.json()).data.total)
    );

    await user.wallet.reload();
    expect(user.wallet.balance.value).toBe(balanceExpected.value);
  });

  test("Read user purchase transaction histories", async () => {
    const response = await client.v1.purchase.history.$get(
      { query: {} },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);

    const { data } = await response.json();
    expect(data).toBeArray();
    expect(data.length).toBeGreaterThan(0);
  });
});
