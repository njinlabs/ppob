import Brand from "@app-entities/brand.js";
import Category from "@app-entities/category.js";
import Product from "@app-entities/product.js";
import db from "@app-modules/database.js";
import digiflazz from "@app-modules/digiflazz.js";
import log from "@app-modules/logger.js";
import { RawProduct } from "@app-types/digiflazz.js";
import { In } from "typeorm";

export function updateProduct() {
  const process = async () => {
    try {
      const prepaidProducts = await digiflazz().getPriceList("prepaid");
      const pascaProducts = await digiflazz().getPriceList("pasca");
      const products = prepaidProducts.concat(pascaProducts);

      const categoryNames = products.reduce((carry: string[], product) => {
        if (carry.includes(product.category)) return carry;

        carry.push(product.category);

        return carry;
      }, [] as string[]);
      const brandNames = products.reduce((carry: string[], product) => {
        if (carry.includes(product.brand)) return carry;

        carry.push(product.brand);

        return carry;
      }, [] as string[]);

      let categories = await Category.find({
        where: {
          name: In(categoryNames),
        },
      });
      let brands = await Brand.find({
        where: {
          name: In(brandNames),
        },
      });

      categories = categories.concat(
        await Category.save(
          categoryNames
            .filter(
              (el) =>
                !Boolean(categories.find((category) => category.name === el))
            )
            .map((name) => Category.from({ name }))
        )
      );
      brands = brands.concat(
        await Brand.save(
          brandNames
            .filter((el) => !Boolean(brands.find((brand) => brand.name === el)))
            .map((name) => Brand.from({ name }))
        )
      );

      const mappingProduct = (type: Product["type"]) => (item: RawProduct) => {
        const product = Product.from({
          name: item.productName,
          sku: item.buyerSKUCode,
          status: item.buyerProductStatus && item.sellerProductStatus,
        });

        const brand = brands.find((el) => el.name === item.brand)?.id;
        if (brand) product.brandId = brand;

        const category = categories.find((el) => el.name === item.category)?.id;
        if (category) product.categoryId = category;

        product.endCutOff = item.endCutOff;
        product.price = item.price;
        product.startCutOff = item.startCutOff;
        product.type = type;

        return product;
      };

      await db()
        .source.getRepository(Product)
        .createQueryBuilder()
        .insert()
        .into(Product)
        .values(
          prepaidProducts
            .map(mappingProduct("PREPAID"))
            .concat(pascaProducts.map(mappingProduct("PASCA")))
        )
        .orUpdate(
          [
            "name",
            "status",
            "brandId",
            "categoryId",
            "endCutOff",
            "startCutOff",
            "price",
            "type",
          ],
          ["sku"]
        )
        .execute();

      log().log.info("Product was synced");
    } catch (e) {}
  };

  return {
    time: "0 * * * *",
    process,
  };
}
