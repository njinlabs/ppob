import { Type } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Base from "./base.js";
import Membership from "./membership.js";
import PricingRule from "./pricing-rule.js";

@Entity("pricing_packages")
export default class PricingPackage extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public name!: string;

  @Column({ default: false })
  public isDefault!: boolean;

  @OneToMany(() => Membership, (membership) => membership.pricing)
  @Type(() => Membership)
  public memberships!: Membership[];

  @OneToMany(() => PricingRule, (pricing) => pricing.pricingPackage, {
    cascade: true,
    eager: true,
  })
  @Type(() => PricingRule)
  public rules!: PricingRule[];

  public sortRules() {
    this.rules = this.rules.sort((a, b) => a.sort - b.sort);
  }
}
