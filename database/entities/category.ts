import { Type } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Base from "./base.js";
import PricingRule from "./pricing-rule.js";
import Product from "./product.js";

@Entity("categories")
export default class Category extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @OneToMany(() => Product, (product) => product.brand)
  @Type(() => Product)
  public products!: Product[];

  @OneToMany(() => PricingRule, (pricing) => pricing.category)
  @Type(() => PricingRule)
  public pricings!: PricingRule[];
}
