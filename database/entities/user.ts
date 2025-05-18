import { init } from "@paralleldrive/cuid2";
import { hash } from "argon2";
import { Exclude, Type } from "class-transformer";
import currency from "currency.js";
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  FindOptionsWhere,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import MembershipPayment from "./membership-payment.js";
import Membership from "./membership.js";
import UserToken from "./user-token.js";
import Wallet from "./wallet.js";
import PricingPackage from "./pricing-package.js";
import Purchase from "./purchase.js";
import Upload from "./upload.js";

@Entity()
export default class User extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public fullname!: string;

  @Column()
  @Exclude()
  public password!: string;

  @Column({
    unique: true,
  })
  public email!: string;

  @Column()
  public phone!: string;

  @Column({ unique: true })
  public referralCode!: string;

  @Column({ nullable: true })
  public referredById!: string;

  @Column({ nullable: true })
  public membershipId!: string;

  @Exclude({
    toPlainOnly: true,
  })
  public plainPassword!: string;

  @OneToMany(() => UserToken, (token) => token.user)
  @Type(() => UserToken)
  public tokens?: UserToken[];

  @ManyToOne(() => User, (ref) => ref.referrals, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "referredById" })
  @Type(() => User)
  public referredBy!: Relation<User>;

  @ManyToOne(() => Membership, (membership) => membership.members, {
    eager: true,
  })
  @Type(() => Membership)
  public membership?: Relation<Membership>;

  @OneToMany(() => User, (ref) => ref.referredBy)
  @Type(() => User)
  public referrals!: User[];

  @OneToMany(
    () => MembershipPayment,
    (membershipPayment) => membershipPayment.user
  )
  @Type(() => MembershipPayment)
  public membershipPayments!: MembershipPayment[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  @Type(() => Purchase)
  public purchases!: Purchase[];

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
  })
  @Type(() => Wallet)
  public wallet!: Relation<Wallet>;

  @OneToOne(() => Upload, {
    nullable: true,
    cascade: true,
    onDelete: "SET NULL",
    eager: true,
  })
  @JoinColumn()
  public avatar!: Upload | null;

  @BeforeInsert()
  @BeforeUpdate()
  public async sanitize() {
    if (this.plainPassword) {
      this.password = await hash(this.plainPassword);
    }
    if (this.email) this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  public async assignRequired() {
    this.referralCode = init({ length: 8 })().toUpperCase();
    this.wallet = Wallet.from({ balance: currency(0) });
  }

  public async getPricing() {
    const conditions: FindOptionsWhere<PricingPackage>[] = [
      { isDefault: true },
    ];

    if (this.membership?.pricingId)
      conditions.push({
        id: this.membership.pricingId,
      });

    const pricings = await PricingPackage.find({
      where: conditions,
    });

    const defaultPricing = pricings.find((el) => el.isDefault);

    return (
      pricings.find((el) => el.id === this.membership?.pricingId) ||
      defaultPricing
    );
  }
}
