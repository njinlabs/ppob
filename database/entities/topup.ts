import { generateInvoice } from "@app-utils/invoice.js";
import {
  TransformCurrency,
  transformCurrency,
} from "@app-utils/transform-currency.js";
import {
  calculateFee,
  Fee,
  TransformFee,
  transformFee,
} from "@app-utils/transform-fee.js";
import { Type } from "class-transformer";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Base from "./base.js";
import User from "./user.js";

@Entity("topups")
export default class TopUp extends Base {
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
  public amount!: currency;

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
  public status!: "PENDING" | "SUCCEED" | "FAILED";

  @Column()
  public method!: "MANUAL" | "DIRECT ADMIN";

  @Column("json")
  public detail!: {
    confirmedBy?: {
      id: string;
      name: string;
    };
  };

  @Column()
  public userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @Type(() => User)
  public user!: Relation<User>;

  @BeforeInsert()
  public async assignRequiredData() {
    const { result: fees, total } = calculateFee(this.amount, this.fees);
    this.invoiceNumber = await generateInvoice(
      process.env.INV_FORMAT_TOPUP ?? "TU-%date:yyyyLLdd%-%000000%",
      TopUp,
      "invoiceNumber"
    );
    this.total = total;
    this.fees = fees;
  }
}
