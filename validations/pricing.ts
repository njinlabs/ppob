import { z } from "zod";
import { currency } from "./general.js";
import Category from "@app-entities/category.js";
import { In } from "typeorm";
import Brand from "@app-entities/brand.js";
import Product from "@app-entities/product.js";
import currencyLib from "currency.js";
import { type Pricing } from "@app-entities/pricing-rule.js";

export const pricingRule = z
  .array(
    z.object({
      category: z.string().uuid().optional(),
      brand: z.string().uuid().optional(),
      product: z.string().uuid().optional(),
      minPrice: currency(z.number().min(0)).optional(),
      maxPrice: currency(z.number().min(0)).optional(),
      rules: z.object({
        override: currency(z.number()).optional(),
        flat: currency(z.number()).optional(),
        percent: z.number().min(1).max(100).optional(),
      }),
    })
  )
  .transform(async (value, ctx) => {
    const categoryIds = value
      .filter((item) => item.category)
      .map((item) => item.category) as string[];
    const categories = categoryIds.length
      ? await Category.find({
          where: {
            id: In(categoryIds),
          },
        })
      : [];

    const brandIds = value
      .filter((item) => item.brand)
      .map((item) => item.brand) as string[];
    const brands = brandIds.length
      ? await Brand.find({
          where: {
            id: In(brandIds),
          },
        })
      : [];

    const productIds = value
      .filter((item) => item.product)
      .map((item) => item.product) as string[];
    const products = productIds.length
      ? await Product.find({
          where: {
            id: In(productIds),
          },
        })
      : [];

    const result = value.reduce(
      (carry, item, index) => {
        const category = categories.find((el) => el.id === item.category);
        if (item.category && !category) {
          carry.issues.push({
            path: [index, "category"],
            code: z.ZodIssueCode.custom,
            message: "Category not found",
          });
        }

        const brand = brands.find((el) => el.id === item.brand);
        if (item.brand && !brand) {
          carry.issues.push({
            path: [index, "brand"],
            code: z.ZodIssueCode.custom,
            message: "Brand not found",
          });
        }

        const product = products.find((el) => el.id === item.product);
        if (item.product && !product) {
          carry.issues.push({
            path: [index, "product"],
            code: z.ZodIssueCode.custom,
            message: "Product not found",
          });
        }

        if (item.maxPrice && item.minPrice && item.maxPrice < item.minPrice) {
          carry.issues.push({
            path: [index, "maxPrice"],
            code: z.ZodIssueCode.custom,
            message: "Max price cannot below min price",
          });
        }

        carry.valid.push({
          category,
          product,
          brand,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          rules: item.rules,
        });

        return carry;
      },
      {
        issues: [] as z.IssueData[],
        valid: [] as {
          category?: Category;
          brand?: Brand;
          product?: Product;
          minPrice?: currencyLib;
          maxPrice?: currencyLib;
          rules: Pricing;
        }[],
      }
    );

    if (result.issues.length) {
      for (const issue of result.issues) {
        ctx.addIssue(issue);
      }

      return z.NEVER;
    }

    return result.valid;
  });

export const composePricing = z.object({
  name: z.string(),
  rules: pricingRule,
});
