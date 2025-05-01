import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import { TransformDate, transformDate } from "@app-utils/transform-date.js";
import { Type } from "class-transformer";
import currency from "currency.js";
import { DateTime } from "luxon";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import Brand from "./brand.js";
import Category from "./category.js";
import PricingRule from "./pricing-rule.js";
import Purchase from "./purchase.js";
import { RawProduct } from "@app-types/digiflazz.js";

@Entity()
export default class Product extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public name!: string;

  @Column()
  public status!: boolean;

  @Column({ unique: true })
  public sku!: string;

  @Column()
  public type!: "PREPAID" | "PASCA";

  @Column("timestamp", { nullable: true, transformer: transformDate })
  @TransformDate()
  public startCutOff!: DateTime;

  @Column("timestamp", { nullable: true, transformer: transformDate })
  @TransformDate()
  public endCutOff!: DateTime;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public price!: currency;

  @Column({ nullable: true })
  public brandId!: string;

  @Column({ nullable: true })
  public categoryId!: string;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Brand)
  public brand?: Relation<Brand>;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Category)
  public category?: Relation<Category>;

  @OneToMany(() => PricingRule, (pricing) => pricing.product)
  @Type(() => PricingRule)
  public pricings!: PricingRule[];

  @OneToMany(() => Purchase, (purchase) => purchase.product)
  @Type(() => Purchase)
  public purchases!: Purchase[];

  public toRaw(): RawProduct {
    return {
      brand: this.brand?.name || "",
      buyerProductStatus: this.status,
      buyerSKUCode: this.sku,
      category: this.category?.name || "",
      desc: "",
      endCutOff: this.endCutOff,
      multi: true,
      price: this.price,
      productName: this.name,
      sellerProductStatus: this.status,
      startCutOff: this.startCutOff,
      unlimitedStock: true,
      sellerName: "",
      stock: 0,
      type: this.type,
    };
  }
}
