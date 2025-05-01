import User from "@app-entities/user.js";
import { FindOptionsWhere } from "typeorm";
import { z } from "zod";
import { currency } from "./general.js";

export const userTransform =
  <T extends keyof FindOptionsWhere<User>>(field: T) =>
  async (value: FindOptionsWhere<User>[T], ctx: z.RefinementCtx) => {
    const user = await User.findOneBy({ [field]: value });

    if (!user) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not Found",
      });

      return z.NEVER;
    }

    return user;
  };

export const userTopUp = z.object({
  amount: currency(z.number().min(1)),
});
