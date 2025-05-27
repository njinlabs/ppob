import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import { TransformCurrency } from "./transform-currency.js";
import { ValueTransformer } from "typeorm";
import { instanceToPlain, plainToInstance, Transform } from "class-transformer";

export class Fee {
  public name!: string;

  @TransformCurrency()
  public amount?: currency;

  public percentage?: {
    value: number;
    fromGrandTotal?: boolean;
  };
}

export const transformFee: ValueTransformer = {
  to(value?: Fee[]) {
    return value ? value.map((item) => instanceToPlain(item)) : [];
  },
  from(value?: object[] | Fee[]) {
    return value
      ? value instanceof Array
        ? value.map((item) =>
            item instanceof Fee ? item : plainToInstance(Fee, item)
          )
        : []
      : [];
  },
};

export function TransformFee() {
  return function (target: object, propertyKey: string | symbol): void {
    Transform(
      ({ value }: { value?: Fee[] }) =>
        value ? value.map((item) => instanceToPlain(item)) : [],
      {
        toPlainOnly: true,
      }
    )(target, propertyKey);

    Transform(
      ({ value }: { value?: Fee[] | object[] }) =>
        value
          ? value instanceof Array
            ? value.map((item) =>
                item instanceof Fee ? item : plainToInstance(Fee, item)
              )
            : []
          : [],
      {
        toClassOnly: true,
      }
    )(target, propertyKey);
  };
}

export function calculateFee(subtotal: currency, fees: Fee[] = []) {
  let total = subtotal;
  const result: Fee[] = [];

  for (const fee of fees) {
    let amount = fee.amount || currencyWrap(0);
    if (!amount.value && fee.percentage) {
      amount = (fee.percentage.fromGrandTotal ? total : subtotal)
        .multiply(fee.percentage.value)
        .divide(100);
    }

    total = total.add(amount);

    result.push({
      name: fee.name,
      amount,
      percentage: fee.percentage,
    });
  }

  return { result, total };
}
