import Purchase from "@app-entities/purchase.js";
import app from "@app-handlers/index.js";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { createHmac } from "node:crypto";

const client = testClient(app);

describe("Webhook API", async () => {
  const purchase = (await Purchase.find({}))[0];

  test("Send webhook event", async () => {
    const body = {
      data: {
        ref_id: purchase.ref,
        status: "Sukses",
      },
    };

    const signature = createHmac("sha1", process.env.WEBHOOK_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest("hex");

    const response = await client.v1.webhook.$post(
      {
        json: body,
      },
      {
        headers: {
          "X-Hub-Signature": `sha1=${signature}`,
        },
      }
    );

    expect(response.status).toBe(200);

    await purchase.reload();
    expect(purchase.status).toBe("SUCCESS");
  });
});
