import Admin from "@app-entities/admin.js";
import Brand from "@app-entities/brand.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import makeImage from "../file.js";

const client = testClient(app);

describe("Brand API", async () => {
  const token = await auth()
    .use("admin")
    .generate((await Admin.find())[0]);

  test("Update product image", async () => {
    const product = (await Brand.find({}))[0];
    const response = await client.brand[":entity"].image.$put(
      {
        param: {
          entity: product.id,
        },
        form: {
          image: await makeImage(),
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
