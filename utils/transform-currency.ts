import { Transform, Type } from "class-transformer";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import { ValueTransformer } from "typeorm";

export const transformCurrency: ValueTransformer = {
  to(value?: currency) {
    return value ? value.value.toFixed(2) : undefined;
  },
  from(value?: string | currency) {
    return value
      ? value instanceof currency
        ? value
        : currencyWrap(value)
      : null;
  },
};

export function TransformCurrency() {
  return function (target: object, propertyKey: string | symbol): void {
    Type(() => currency)(target, propertyKey);

    Transform(({ value }: { value?: currency }) => (value ? value.value : 0), {
      toPlainOnly: true,
    })(target, propertyKey);
  };
}
