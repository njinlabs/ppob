import { updateProduct } from "@app-crons/update-product.js";
import Brand from "@app-entities/brand.js";
import Category from "@app-entities/category.js";
import Product from "@app-entities/product.js";
import { describe, expect, test } from "bun:test";

describe("Product Cron", async () => {
  test("Product auto sync from digiflazz", async () => {
    await updateProduct().process();

    const categories = await Category.find();
    const brands = await Brand.find();
    const products = await Product.find({
      relations: { brand: true, category: true },
    });

    expect(categories).toBeArray();
    expect(brands).toBeArray();
    expect(products).toBeArray();
    expect(categories.length).toBeGreaterThan(0);
    expect(brands.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
  });
});
