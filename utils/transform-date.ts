import { Transform, Type } from "class-transformer";
import { DateTime } from "luxon";
import { ValueTransformer } from "typeorm";

export const transformDate: ValueTransformer = {
  to(value?: DateTime) {
    return value ? value.toJSDate() : undefined;
  },
  from(value?: Date | DateTime) {
    return value
      ? value instanceof DateTime
        ? value
        : DateTime.fromJSDate(value)
      : null;
  },
};

export function TransformDate() {
  return function (target: object, propertyKey: string | symbol): void {
    Type(() => DateTime)(target, propertyKey);

    Transform(
      ({ value }: { value?: DateTime }) => (value ? value.toISO() : null),
      { toPlainOnly: true }
    )(target, propertyKey);
  };
}
