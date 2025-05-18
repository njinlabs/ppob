import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import { Type } from "class-transformer";
import currency from "currency.js";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import MembershipPayment from "./membership-payment.js";
import PricingPackage from "./pricing-package.js";
import User from "./user.js";

@Entity()
export default class Membership extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @Column()
  public description!: string;

  @Column()
  public referralLimit!: number;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public price!: currency;

  @Column({ nullable: true })
  public pricingId!: string;

  @ManyToOne(() => PricingPackage, (pricing) => pricing.memberships, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "pricingId" })
  @Type(() => PricingPackage)
  public pricing!: Relation<PricingPackage>;

  @OneToMany(() => User, (user) => user.membership)
  @Type(() => User)
  public members!: User[];

  @OneToMany(() => MembershipPayment, (user) => user.membership)
  @Type(() => MembershipPayment)
  public payments!: MembershipPayment[];
}
