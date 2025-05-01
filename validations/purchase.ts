import { z } from "zod";

export const makePurchase = z.object({
  customerNumber: z.string(),
});
