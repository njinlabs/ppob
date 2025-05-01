import Base from "@app-entities/base.js";
import { metaData } from "@app-validations/general.js";
import { type FindManyOptions } from "typeorm";
import z from "zod";

export async function withMeta<Entity extends typeof Base>(
  model: Entity,
  meta: z.infer<typeof metaData>,
  callback?: (
    meta: z.infer<typeof metaData>
  ) => FindManyOptions<InstanceType<Entity>>
) {
  const { perPage, page } = meta;
  const options: FindManyOptions<InstanceType<Entity>> = callback
    ? callback(meta)
    : {};

  const data = await model.find({
    ...(options as FindManyOptions<Base>),
    take: perPage,
    skip: (page - 1) * perPage,
  });
  const dataCount = await model.count(options as FindManyOptions<Base>);

  return {
    data: data.map((item) => item.serialize()),
    meta: {
      pagination: {
        page,
        perPage,
        totalItems: dataCount,
        totalPages: Math.ceil(dataCount / perPage),
      },
    },
  };
}
