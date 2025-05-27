import { calculateFee } from "@app-utils/transform-fee.js";
import { faker } from "@faker-js/faker";
import { expect, test } from "bun:test";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";

test("Calculate fee", () => {
  const data = Array(50)
    .fill(faker.number.int({ min: 1 }))
    .map((value: number) => {
      const total = currencyWrap(value);
      const shipping = currencyWrap(faker.number.int({ min: 1 }));
      const percentage = total.multiply(5).divide(100);
      const all = total.add(shipping).add(percentage);

      return {
        total,
        fees: [
          {
            name: "Ongkos Kirim",
            amount: shipping,
          },
          {
            name: "Biaya Admin",
            percentage: {
              value: 5,
            },
          },
          {
            name: "PPN",
            percentage: {
              value: 11,
              fromGrandTotal: true,
            },
          },
        ],
        expected: all.add(all.multiply(11).divide(100)),
      };
    });

  data.forEach((item) => {
    const { total } = calculateFee(item.total, item.fees);
    expect(total.intValue).toBe(item.expected.intValue);
  });
});
