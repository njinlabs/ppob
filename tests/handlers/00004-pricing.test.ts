import app from "@app-handlers/index.js";
import { testClient } from "hono/testing";
import { describe, expect, test } from "bun:test";
import auth from "@app-modules/auth.js";
import Admin from "@app-entities/admin.js";
import Brand from "@app-entities/brand.js";
import Category from "@app-entities/category.js";
import Product from "@app-entities/product.js";
import { faker } from "@faker-js/faker";
import PricingPackage from "@app-entities/pricing-package.js";
import User from "@app-entities/user.js";
import { calculateProductPricing } from "@app-utils/pricing.js";

const client = testClient(app);

describe("Pricing", async () => {
  const product = (await Product.find())[0];
  const category = (await Category.find())[0];
  const brand = (await Brand.find())[0];
  const token = await auth()
    .use("admin")
    .generate((await Admin.find())[0]);

  let pricing: PricingPackage;

  test("Create pricing package", async () => {
    const response = await client.pricing.$post(
      {
        json: {
          name: "Default",
          rules: [
            {
              product: product.id,
              rules: {
                override: faker.number.int({ min: 1000, max: 100000 }),
              },
            },
            {
              brand: brand.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              category: category.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              rules: {
                flat: faker.number.int({ min: 1000, max: 10000 }),
              },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    pricing = await PricingPackage.findOneByOrFail({
      id: (await response.json()).data.id,
    });
  });

  test("Update pricing package", async () => {
    const response = await client.pricing[":entity"].$put(
      {
        param: {
          entity: pricing.id,
        },
        json: {
          name: "Default",
          rules: [
            {
              product: product.id,
              rules: {
                override: faker.number.int({ min: 1000, max: 100000 }),
              },
            },
            {
              brand: brand.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              category: category.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              rules: {
                flat: faker.number.int({ min: 1000, max: 10000 }),
              },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Read pricing package", async () => {
    const response = await client.pricing.$get(
      {
        query: {
          page: "1",
          perPage: "200",
          search: "",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.data).toBeArray();
    expect(result.data.length).toBeGreaterThan(0);
  });

  test("Load membership package", async () => {
    const response = await client.pricing[":entity"].$get(
      {
        param: {
          entity: pricing.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Delete pricing package", async () => {
    const response = await client.pricing[":entity"].$delete(
      {
        param: {
          entity: pricing.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(
      (
        await client.membership[":entity"].$get(
          {
            param: {
              entity: pricing.id,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ).status
    ).toBe(404);

    // reassign new pricing
    await client.pricing.$post(
      {
        json: {
          name: "Default",
          rules: [
            {
              product: product.id,
              rules: {
                override: faker.number.int({ min: 1000, max: 100000 }),
              },
            },
            {
              brand: brand.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              category: category.id,
              rules: {
                percent: faker.number.int({ min: 1, max: 100 }),
              },
            },
            {
              rules: {
                flat: faker.number.int({ min: 1000, max: 10000 }),
              },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    pricing = (await PricingPackage.findOneBy({
      id: (await response.json()).data.id,
    }))!;
  });

  test("Set pricing package as default", async () => {
    const response = await client.pricing[":entity"].default.$patch(
      {
        param: {
          entity: pricing.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    await pricing.reload();

    expect(pricing.isDefault).toBe(true);
  });

  test("Unset pricing package as default", async () => {
    const response = await client.pricing[":entity"].default.$patch(
      {
        param: {
          entity: pricing.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    await pricing.reload();

    expect(pricing.isDefault).toBe(false);
  });

  test("Set pricing package as default again", async () => {
    const response = await client.pricing[":entity"].default.$patch(
      {
        param: {
          entity: pricing.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    await pricing.reload();

    expect(pricing.isDefault).toBe(true);

    const user = (await User.find())[0];
    const userPricing = await user.getPricing();

    expect(userPricing).toBeInstanceOf(PricingPackage);

    pricing.sortRules();

    expect((await calculateProductPricing(product, user)).price).toBe(
      pricing.rules[0].rules.override?.value
    );
  });
});
