import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Base from "./base.js";
import Product from "./product.js";
import { Type } from "class-transformer";
import PricingRule from "./pricing-rule.js";
import Upload from "./upload.js";

@Entity("brands")
export default class Brand extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @OneToMany(() => Product, (product) => product.brand)
  @Type(() => Product)
  public products?: Product[];

  @OneToMany(() => PricingRule, (pricing) => pricing.brand)
  @Type(() => PricingRule)
  public pricings!: PricingRule[];

  @OneToOne(() => Upload, {
    nullable: true,
    cascade: true,
    onDelete: "SET NULL",
    eager: true,
  })
  @JoinColumn()
  public image!: Upload | null;
}
