import {
  transformCurrency,
  TransformCurrency,
} from "@app-utils/transform-currency.js";
import currency from "currency.js";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import TopUp from "./topup.js";
import Wallet from "./wallet.js";
import { Type } from "class-transformer";

@Entity("wallet_ledgers")
export default class WalletLedger extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public current!: currency;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public add!: currency;

  @Column("numeric", {
    precision: 12,
    scale: 2,
    transformer: transformCurrency,
  })
  @TransformCurrency()
  public result!: currency;

  @Column("json")
  public event!: {
    topup?: {
      id: string;
      method: InstanceType<typeof TopUp>["method"];
    };
    membership?: {
      id: string;
      name: string;
    };
    purchase?: {
      id: string;
      category?: {
        id?: string;
        name?: string;
      };
      brand?: {
        id?: string;
        name?: string;
      };
      name: string;
    };
  };

  @Column()
  public walletId!: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledgers, { onDelete: "CASCADE" })
  @Type(() => Wallet)
  public wallet!: Relation<Wallet>;
}
