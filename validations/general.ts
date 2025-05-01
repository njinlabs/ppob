import Base from "@app-entities/base.js";
import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { z, ZodEffects, ZodNumber, ZodObject, ZodString, ZodType } from "zod";
import currencyLib from "currency.js";

export const unique = <Entity extends typeof Base, T>(
  validation: ZodType<T>,
  entity: Entity,
  field:
    | keyof InstanceType<Entity>
    | ((value: T) => FindOneOptions<InstanceType<Entity>>),
  allowCondition?: (value: T, result: InstanceType<Entity>) => Boolean
) => {
  return validation.refine(
    async (value) => {
      let options: FindOneOptions<InstanceType<Entity>> = {};

      if (typeof field === "string") {
        options = {
          where: {
            [field]: value,
          } as FindOptionsWhere<InstanceType<Entity>>,
        };
      } else {
        options = (field as (value: T) => FindOneOptions<InstanceType<Entity>>)(
          value
        );
      }

      if (!options.where) return true;

      const data = await entity.findOne(options as FindOneOptions<Base>);

      if (!data) return true;
      return allowCondition
        ? allowCondition(value, data as InstanceType<Entity>)
        : false;
    },
    {
      message: "Must a unique value",
    }
  );
};

export const phone = z.string().regex(/^[1-9]\d{7,14}$/, {
  message: "Value is not a valid mobile phone number",
});

export const currency = (value: ZodNumber) =>
  value.transform((value) => currencyLib(value));

export const uuidEntityParam = <
  M extends typeof Base,
  T extends keyof FindOptionsWhere<InstanceType<M>>
>(
  model: M,
  field: T,
  callback: (validation: ZodString) => ZodString = (validation) => validation
) =>
  z
    .object({
      entity: callback(z.string().uuid()),
    })
    .transform(async ({ entity: value }, ctx: z.RefinementCtx) => {
      const entity = await model.findOneBy({ [field]: value });

      if (!entity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not Found",
        });

        return z.NEVER;
      }

      return entity as InstanceType<M>;
    });

export const metaData = z.object({
  perPage: z.coerce.number().min(1).max(200).optional().default(50),
  page: z.coerce.number().min(1).optional().default(1),
  search: z.string().optional(),
});
