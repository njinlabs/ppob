import Admin from "@app-entities/admin.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";

const client = testClient(app);

describe("Category API", async () => {
  const token = await auth()
    .use("admin")
    .generate((await Admin.find())[0]);

  test("Read category list", async () => {
    const response = await client.category.$get(
      {
        query: {
          page: "1",
          perPage: "200",
          search: "",
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
