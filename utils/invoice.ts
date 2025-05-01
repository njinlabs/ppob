import Base from "@app-entities/base.js";
import { DateTime } from "luxon";
import { FindOptionsWhere, MoreThanOrEqual } from "typeorm";

export async function generateInvoice<
  T extends typeof Base,
  K extends keyof FindOptionsWhere<InstanceType<T>>
>(format: string, model: T, key: K) {
  const transformFormat = (number: number) =>
    format
      .replace(/%date:([^%]+)%/g, (_, format) => {
        return DateTime.now().toFormat(format);
      })
      .replace(/%0+%/g, (match) => {
        const zeroCount = match.length - 2;
        return number.toString().padStart(zeroCount, "0");
      });

  let number =
    (await model.count({
      where: {
        createdAt: MoreThanOrEqual(DateTime.now().startOf("day")),
      },
    })) + 1;

  while (
    Boolean(
      await model.count({
        where: {
          [key]: transformFormat(number),
        },
      })
    )
  ) {
    number++;
  }

  return transformFormat(number);
}
