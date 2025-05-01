import { zValidator } from "@hono/zod-validator";
import { ValidationTargets } from "hono";
import { ZodSchema } from "zod";

export default function validator<
  T extends ZodSchema,
  Target extends keyof ValidationTargets
>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      if (
        result.error.issues.find(
          (el) => el.code === "custom" && el.message === "Not Found"
        )
      ) {
        return c.json(
          {
            message: "Entity not found",
          },
          404
        );
      }

      return c.json(
        {
          message: "Validation failed",
          details: result.error.issues,
        },
        422
      );
    }
  });
}
