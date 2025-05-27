import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import { Transform, Type } from "class-transformer";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import PricingPackage from "./pricing-package.js";
import Category from "./category.js";
import Brand from "./brand.js";
import Product from "./product.js";

export type Pricing = {
  flat?: currency;
  percent?: number;
  override?: currency;
};

@Entity("pricing_rules")
export default class PricingRule extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("json", {
    transformer: {
      to: (value?: Pricing) =>
        value
          ? {
              override: value.override?.value.toFixed(2),
              flat: value.flat?.value.toFixed(2),
              percent: value.percent,
            }
          : undefined,
      from: (value?: Pricing) =>
        value
          ? {
              override: value.override
                ? currencyWrap(value.override)
                : undefined,
              flat: value.flat ? currencyWrap(value.flat) : undefined,
              percent: value.percent,
            }
          : {},
    },
  })
  @Transform(
    ({ value }: { value?: Pricing }) =>
      value
        ? {
            override: value.override?.value,
            flat: value.flat?.value,
            percent: value.percent,
          }
        : {},
    {
      toPlainOnly: true,
    }
  )
  @Transform(
    ({ value }: { value?: Pricing }) =>
      value
        ? {
            override: value.override ? currencyWrap(value.override) : undefined,
            flat: value.flat ? currencyWrap(value.flat) : undefined,
            percent: value.percent,
          }
        : {},
    {
      toClassOnly: true,
    }
  )
  public rules!: Pricing;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
    default: "0",
  })
  @TransformCurrency()
  public minPrice!: currency;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
    default: "0",
  })
  @TransformCurrency()
  public maxPrice!: currency;

  @Column()
  public sort!: number;

  @Column({ nullable: true })
  public categoryId!: string;

  @Column({ nullable: true })
  public brandId!: string;

  @Column({ nullable: true })
  public productId!: string;

  @Column()
  public pricingPackageId!: string;

  @ManyToOne(() => PricingPackage, (pkg) => pkg.rules, {
    onDelete: "CASCADE",
  })
  @Type(() => PricingPackage)
  public pricingPackage!: Relation<PricingPackage>;

  @ManyToOne(() => Category, (category) => category.pricings, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Category)
  public category!: Relation<Category>;

  @ManyToOne(() => Brand, (brand) => brand.pricings, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Brand)
  public brand!: Relation<Brand>;

  @ManyToOne(() => Product, (product) => product.pricings, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Product)
  public product!: Relation<Product>;
}
