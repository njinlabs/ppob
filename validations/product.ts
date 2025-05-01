import { z } from "zod";

export const productFilter = z
  .object({
    brand: z.string().uuid().optional(),
    category: z.string().uuid().optional(),
  })
  .optional();
