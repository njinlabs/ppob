import Category from "@app-entities/category.js";
import Product from "@app-entities/product.js";
import User from "@app-entities/user.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { getBrandByPrefix } from "@app-utils/cell-provider.js";
import { calculateProductPricing } from "@app-utils/pricing.js";
import { phone } from "@app-validations/general.js";
import { productFilter } from "@app-validations/product.js";
import { Hono } from "hono";
import { FindManyOptions } from "typeorm";
import { z } from "zod";

const product = new Hono<App>()
  .get("/category", async (c) => {
    const categories = await Category.find({});

    return c.json({ data: categories.map((item) => item.serialize()) });
  })
  .get(
    "/brand/:phoneNumber",
    validator(
      "param",
      z.object({
        phoneNumber: phone,
      })
    ),
    async (c) => {
      return c.json({
        data: (
          await getBrandByPrefix(await c.req.valid("param").phoneNumber)
        ).serialize(),
      });
    }
  )
  .get("/", auth("user"), validator("query", productFilter), async (c) => {
    let filters: FindManyOptions<Product> = {
      order: {
        price: "ASC",
      },
    };
    const query = await c.req.valid("query");

    if (query?.brand) {
      filters = {
        ...filters,
        where: {
          ...filters.where,
          brandId: query.brand,
        },
      };
    }

    if (query?.category) {
      filters = {
        ...filters,
        where: {
          ...filters.where,
          brandId: query.category,
        },
      };
    }

    const products = await Product.find(filters);

    return c.json({
      data: await Promise.all(
        products.map((el) =>
          calculateProductPricing(el, c.var.auth.user! as User)
        )
      ),
    });
  });

export default product;
