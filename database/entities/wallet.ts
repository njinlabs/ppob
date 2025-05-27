import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import User from "./user.js";
import WalletLedger from "./wallet-ledger.js";
import { Type } from "class-transformer";

@Entity("wallets")
export default class Wallet extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public balance!: currency;

  @Column()
  public userId!: string;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: "CASCADE" })
  @JoinColumn()
  @Type(() => User)
  public user!: Relation<User>;

  @OneToMany(() => WalletLedger, (ledger) => ledger.wallet)
  @Type(() => WalletLedger)
  public ledgers!: WalletLedger[];
}
