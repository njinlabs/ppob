import Admin from "@app-entities/admin.js";
import User from "@app-entities/user.js";
import Wallet from "@app-entities/wallet.js";
import app from "@app-handlers/index.js";
import { faker } from "@faker-js/faker";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import makeImage from "../file.js";

const client = testClient(app);

describe("Admin Auth", async () => {
  let admin: Admin;
  let token: string;
  const password = faker.internet.password();

  test("Installation", async () => {
    const checkResponse = await client.install.$get();

    expect(checkResponse.status).toBe(200);

    const response = await client.install.$post({
      json: {
        admin: {
          email: faker.internet.email(),
          fullname: faker.person.fullName(),
          password,
        },
      },
    });

    expect(response.status).toBe(200);

    admin = await Admin.findOneByOrFail({
      id: (await response.json()).data.admin.id,
    });
  });

  test("Get token", async () => {
    const response = await client.auth.$post({
      json: {
        email: admin.email,
        password,
      },
    });

    expect(response.status).toBe(200);

    token = (await response.json()).data.token;
    expect(token).toBeString();
  });

  test("Check token", async () => {
    const response = await client.auth.$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("Revoke token", async () => {
    const response = await client.auth.$delete(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });
});

describe("User Auth", async () => {
  const password = faker.internet.password();

  let token: string;

  test("User registration", async () => {
    const response = await client.v1.auth.register.$post({
      json: {
        email: faker.internet.email(),
        fullname: faker.person.fullName(),
        phone: faker.phone
          .number({ style: "international" })
          .replace(/^\+/, ""),
        password,
      },
    });

    expect(response.status).toBe(200);
    expect((await response.json()).data.token).toBeString();
    expect(await Wallet.count()).toBeGreaterThan(0);
  });

  test("User registration with referral code", async () => {
    const user = (await User.find({ take: 1 }))[0];

    const response = await client.v1.auth.register.$post({
      json: {
        email: faker.internet.email(),
        fullname: faker.person.fullName(),
        phone: faker.phone
          .number({ style: "international" })
          .replace(/^\+/, ""),
        password,
        referredBy: user.referralCode,
      },
    });

    expect(response.status).toBe(200);
    expect((await response.json()).data.token).toBeString();
  });

  test("User login using email", async () => {
    const user = (await User.find({ take: 1 }))[0];

    const response = await client.v1.auth.login.$post({
      json: {
        email: user.email,
        password,
      },
    });

    expect(response.status).toBe(200);
    expect((await response.json()).data.token).toBeString();
  });

  test("User login using phone", async () => {
    const user = (await User.find({ take: 1 }))[0];

    const response = await client.v1.auth.login.$post({
      json: {
        email: user.phone,
        password,
      },
    });

    expect(response.status).toBe(200);

    token = (await response.json()).data.token;
    expect(token).toBeString();
  });

  test("User check token", async () => {
    const response = await client.v1.auth["check-token"].$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("User update profile", async () => {
    const response = await client.v1.user.$put(
      {
        form: {
          avatar: await makeImage(),
          email: faker.internet.email(),
          fullname: faker.person.fullName(),
          phone: faker.phone
            .number({ style: "international" })
            .replace(/^\+/, ""),
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

  test("User logout", async () => {
    const response = await client.v1.auth.logout.$delete(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("User change password", async () => {
    const user = (await User.find({ take: 1 }))[0];

    const response = await client.v1.auth.login.$post({
      json: {
        email: user.phone,
        password,
      },
    });

    expect(response.status).toBe(200);

    token = (await response.json()).data.token;
    expect(token).toBeString();

    const changeResponse = await client.v1.user.password.$put(
      {
        json: {
          password,
          newPassword: faker.internet.password(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(changeResponse.status).toBe(200);
  });
});
