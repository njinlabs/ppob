import Product from "@app-entities/product.js";
import User from "@app-entities/user.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { getBrandByPrefix } from "@app-utils/cell-provider.js";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";

const client = testClient(app);

describe("Product API", async () => {
  const user = (await User.find())[0];
  const userToken = await auth().use("user").generate(user);

  test("Get categories list", async () => {
    const response = await client.v1.product.category.$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Get product list", async () => {
    const provider = await getBrandByPrefix("6281271762774");

    const response = await client.v1.product.$get(
      {
        query: {
          brand: provider.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Get product", async () => {
    const product = (await Product.find({}))[0];
    const response = await client.v1.product[":entity"].$get(
      {
        param: {
          entity: product.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Get brand by phone number", async () => {
    const response = await client.v1.product.brand[":phoneNumber"].$get(
      {
        param: {
          phoneNumber: "6281271762774",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });
});
