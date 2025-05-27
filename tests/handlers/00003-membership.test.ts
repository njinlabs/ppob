import Admin from "@app-entities/admin.js";
import Membership from "@app-entities/membership.js";
import User from "@app-entities/user.js";
import app from "@app-handlers/index.js";
import auth from "@app-modules/auth.js";
import { faker } from "@faker-js/faker";
import { describe, expect, test } from "bun:test";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import { testClient } from "hono/testing";
import { MoreThan } from "typeorm";

const client = testClient(app);

describe("Membership", async () => {
  const token = await auth()
    .use("admin")
    .generate((await Admin.find())[0]);

  const userToken = await auth()
    .use("user")
    .generate(
      (
        await User.find({
          where: {
            wallet: {
              balance: MoreThan(currencyWrap(0)),
            },
          },
          relations: {
            wallet: true,
          },
        })
      )[0]
    );

  let membership: Membership;

  test("Create membership package", async () => {
    const response = await client.membership.$post(
      {
        json: {
          name: "Reseller",
          description: "Lorem ipsum",
          price: faker.number.int({ min: 10000, max: 500000 }),
          referralLimit: 25,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);

    membership = (await Membership.findOneBy({
      id: (await response.json()).data.id,
    }))!;

    expect(membership).toBeInstanceOf(Membership);
  });

  test("Update membership package", async () => {
    const response = await client.membership[":entity"].$put(
      {
        param: {
          entity: membership.id,
        },
        json: {
          name: membership.name,
          description: "Lorem ipsum",
          price: faker.number.int({ min: 10000, max: 500000 }),
          referralLimit: 25,
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

  test("Read membership package", async () => {
    const response = await client.membership.$get(
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
    const response = await client.membership[":entity"].$get(
      {
        param: {
          entity: membership.id,
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

  test("Delete membership package", async () => {
    const response = await client.membership[":entity"].$delete(
      {
        param: {
          entity: membership.id,
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
              entity: membership.id,
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

    // reassign new membership
    await client.membership.$post(
      {
        json: {
          name: "Reseller",
          description: "Lorem ipsum",
          price: faker.number.int({ min: 10000, max: 500000 }),
          referralLimit: 25,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    membership = (await Membership.findOneBy({
      id: (await response.json()).data.id,
    }))!;
  });

  test("Read membership package by user", async () => {
    const response = await client.v1.membership.$get(
      {
        query: {
          page: "1",
          perPage: "200",
          search: "",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.data).toBeArray();
    expect(result.data.length).toBeGreaterThan(0);
  });

  test("User membership payment", async () => {
    const response = await client.v1.membership[":entity"].$post(
      {
        param: {
          entity: membership.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Load user membership", async () => {
    const response = await client.v1.membership.my.$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect((await response.json()).data).toBeObject();
  });

  test("Read user membership transaction histories", async () => {
    const response = await client.v1.membership.history.$get(
      { query: {} },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);

    const { data } = await response.json();
    expect(data).toBeArray();
    expect(data.length).toBeGreaterThan(0);
  });
});
