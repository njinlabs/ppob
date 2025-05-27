import { updateProduct } from "@app-crons/update-product.js";
import Product from "@app-entities/product.js";
import acl from "@app-middlewares/acl.js";
import auth from "@app-middlewares/auth.js";
import validator from "@app-middlewares/validator.js";
import { App } from "@app-types/app.js";
import { withMeta } from "@app-utils/with-meta.js";
import { metaData } from "@app-validations/general.js";
import { productFilter } from "@app-validations/product.js";
import { Hono } from "hono";
import { FindManyOptions, ILike } from "typeorm";

const product = new Hono<App>()
  .use(auth("admin"))
  .post("/force-sync", acl("product:force-sync"), async (c) => {
    await updateProduct().process();

    return c.json({ message: "Product was synced" });
  })
  .get(
    "/",
    acl("product:list"),
    validator("query", metaData.and(productFilter)),
    async (c) => {
      const { brand, category, ...metaData } = await c.req.valid("query");

      return c.json(
        await withMeta(Product, metaData, (meta) => {
          let filters: FindManyOptions<Product> = {
            order: {
              price: "ASC",
            },
          };

          if (brand) {
            filters = {
              ...filters,
              where: {
                ...filters.where,
                brandId: brand,
              },
            };
          }

          if (category) {
            filters = {
              ...filters,
              where: {
                ...filters.where,
                categoryId: category,
              },
            };
          }

          if (meta.search) {
            filters = {
              ...filters,
              where: {
                ...filters.where,
                name: ILike(`%${meta.search}%`),
              },
            };
          }

          return filters;
        })
      );
    }
  );

export default product;
