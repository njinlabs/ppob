import { z } from "zod";
import { currency } from "./general.js";

export const composeMembership = z.object({
  name: z.string(),
  referralLimit: z.number().min(1),
  price: currency(z.number().min(1)),
});
