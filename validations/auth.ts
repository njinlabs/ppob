import User from "@app-entities/user.js";
import { FindOneOptions } from "typeorm";
import { z } from "zod";
import { phone, unique } from "./general.js";
import { userTransform } from "./user.js";

export const adminSign = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userSign = z.object({
  email: z.string(),
  password: z.string(),
});

export const userRegister = unique(
  z.object({
    fullname: z.string(),
    email: z.string().email(),
    phone,
    password: z.string(),
  }),
  User,
  (value) => {
    let options: FindOneOptions<User> = {
      where: [
        {
          email: value.email.toLowerCase(),
          phone: value.phone,
        },
      ],
    };

    return options;
  }
).and(
  z.object({
    referredBy: z.string().transform(userTransform("referralCode")).optional(),
  })
);
