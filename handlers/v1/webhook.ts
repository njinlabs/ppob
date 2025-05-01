import Purchase from "@app-entities/purchase.js";
import { App } from "@app-types/app.js";
import { Hono } from "hono";
import { createHmac } from "node:crypto";

const webhook = new Hono<App>().post("/", async (c) => {
  const requestSignature = c.req.header("X-Hub-Signature");

  if (!requestSignature) return c.json({ message: "Webhook ping succeed" });

  const signature = createHmac("sha1", process.env.WEBHOOK_SECRET_KEY!)
    .update(await c.req.text())
    .digest("hex");

  if (`sha1=${signature}` === requestSignature) {
    const request =
      (await c.req.json<
        Partial<{
          data: {
            ref_id?: string;
            status?: "Pending" | "Sukses" | "Gagal";
          };
        }>
      >()) || {};

    if (request.data?.ref_id && request.data.status) {
      const {
        data: { ref_id: ref, status },
      } = request;

      await (
        await Purchase.findOneAndAssign(
          {
            ref,
          },
          {
            status:
              status === "Gagal"
                ? "FAILED"
                : status === "Sukses"
                ? "SUCCESS"
                : "PENDING",
          }
        )
      ).save();
    }
  } else {
    return c.json({ message: "Webhook key invalid" }, 401);
  }

  return c.json({ message: "Webhook Received" });
});

export default webhook;
