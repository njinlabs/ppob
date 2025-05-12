import Product from "@app-entities/product.js";
import User from "@app-entities/user.js";
import currency from "currency.js";

export async function calculateProductPricing(
  product: Product,
  user: User
): Promise<Product>;
export async function calculateProductPricing(
  product: Product[],
  user: User
): Promise<Product[]>;
export async function calculateProductPricing(
  product: Product | Product[],
  user: User
) {
  const pricing = await user.getPricing();
  pricing?.sortRules();

  const products = (Array.isArray(product) ? product : [product]).map(
    (product) => {
      const data = product.serialize();
      data.price = currency(data.price);

      if (pricing) {
        for (const item of pricing.rules) {
          if (item.category && item.category.id !== data.category.id) continue;
          if (item.brand && item.brand.id !== data.brand.id) continue;
          if (item.product && item.product.id !== data.id) continue;
          if (item.minPrice.value && item.minPrice > data.price) continue;
          if (item.maxPrice.value && item.maxPrice < data.price) continue;

          if (item.rules.override) {
            data.price = item.rules.override;
            break;
          }

          if (item.rules.flat) {
            data.price = data.price.add(item.rules.flat);
            break;
          }
          if (item.rules.percent) {
            const percentage = data.price
              .multiply(item.rules.percent)
              .divide(100);

            data.price = data.price.add(percentage);
            break;
          }
        }
      }

      data.price = data.price.value;

      return data;
    }
  );

  return Array.isArray(product) ? products : products[0];
}
