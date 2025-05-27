import User from "@app-entities/user.js";
import { FindOptionsWhere } from "typeorm";
import { z } from "zod";
import { currency, phone, upload } from "./general.js";

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

export const updateProfile = z.object({
  fullname: z.string(),
  email: z.string().email(),
  phone,
  avatar: upload({
    mime: ["image/jpeg", "image/png", "image/webp"],
    size: 3 * 1024 * 1024,
  })
    .optional()
    .nullable(),
});

export const updatePassword = z.object({
  password: z.string(),
  newPassword: z.string(),
});
