import digiflazz from "@app-modules/digiflazz.js";
import { InqResponse, RawProduct } from "@app-types/digiflazz.js";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { describe, expect, test } from "bun:test";
import currency from "currency.js";

function generateIndonesianPhoneNumber() {
  const prefix = "08";
  const provider = faker.helpers.arrayElement([
    "11",
    "12",
    "13",
    "15",
    "16",
    "17",
    "18",
    "21",
  ]);
  const number = faker.string.numeric(8);
  return `${prefix}${provider}${number}`;
}

describe("Digiflazz Module", async () => {
  let prepaid: RawProduct;
  let pasca: RawProduct;
  let inq: InqResponse;

  test("Get balance", async () => {
    const balance = await digiflazz().getBalance();

    expect(balance).toBeInstanceOf(currency);
  });

  test("Get prepaid price list", async () => {
    const products = await digiflazz().getPriceList("prepaid");

    expect(products).toBeArray();
    expect(products.length).toBeGreaterThan(0);

    prepaid = products[0];
  });

  test("Get pasca price list", async () => {
    const products = await digiflazz().getPriceList("pasca");

    expect(products).toBeArray();
    expect(products.length).toBeGreaterThan(0);

    pasca = products[0];
  });

  test("Topup process", async () => {
    expect(
      await digiflazz().topup(prepaid, {
        customerNumber: generateIndonesianPhoneNumber(),
        refId: createId(),
        testing: true,
      })
    ).toBeObject();
  });

  test("Check inq", async () => {
    inq = await digiflazz().checkInq(pasca, {
      customerNumber: "530000000003",
      refId: createId(),
      testing: true,
    });

    expect(inq).toBeObject();
  });

  test("Pay inq", async () => {
    expect(await digiflazz().pay(inq)).toBeObject();
  });
});
