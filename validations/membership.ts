import { z } from "zod";
import { currency } from "./general.js";
import { pricingTransform } from "./pricing.js";

export const composeMembership = z.object({
  name: z.string(),
  description: z.string(),
  referralLimit: z.number().min(1),
  price: currency(z.number().min(1)),
  pricingId: z.string().uuid().transform(pricingTransform("id")).optional(),
});
