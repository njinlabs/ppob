import { generateInvoice } from "@app-utils/invoice.js";
import {
  calculateFee,
  Fee,
  TransformFee,
  transformFee,
} from "@app-utils/transform-fee.js";
import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import { Type } from "class-transformer";
import currency from "currency.js";
import {
  AfterInsert,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import Membership from "./membership.js";
import User from "./user.js";
import db from "@app-modules/database.js";

@Entity("membership_payments")
export default class MembershipPayment extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true })
  public invoiceNumber!: string;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public price!: currency;

  @Column("json", { transformer: transformFee })
  @TransformFee()
  public fees!: Fee[];

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public total!: currency;

  @Column()
  public name!: string;

  @Column({ nullable: true })
  public userId!: string;

  @Column({ nullable: true })
  public membershipId!: string;

  @ManyToOne(() => User, (user) => user.membershipPayments, {
    onDelete: "SET NULL",
  })
  @Type(() => User)
  public user!: Relation<User>;

  @ManyToOne(() => Membership, (membership) => membership.payments, {
    onDelete: "SET NULL",
  })
  @Type(() => Membership)
  public membership!: Relation<Membership>;

  @BeforeInsert()
  public async assignRequiredData() {
    const { result: fees, total } = calculateFee(
      this.membership.price,
      this.fees
    );
    this.invoiceNumber = await generateInvoice(
      process.env.INV_FORMAT_TOPUP ?? "MP-%date:yyyyLLdd%-%000000%",
      MembershipPayment,
      "invoiceNumber"
    );
    this.total = total;
    this.fees = fees;
    this.name = this.membership.name;
    this.price = this.membership.price;
  }

  @AfterInsert()
  public async updateUserMembershipId() {
    db().source.transaction(async (em) => {
      this.user.membership = this.membership;
      await em.getRepository(User).save(this.user);
    });
  }
}
