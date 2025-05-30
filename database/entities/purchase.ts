import digiflazz from "@app-modules/digiflazz.js";
import log from "@app-modules/logger.js";
import { PayResponse, TopupResponse } from "@app-types/digiflazz.js";
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
import { createId } from "@paralleldrive/cuid2";
import { Type } from "class-transformer";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
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
import Product from "./product.js";
import User from "./user.js";
import { calculateProductPricing } from "@app-utils/pricing.js";

@Entity("purchases")
export default class Purchase extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true })
  public invoiceNumber!: string;

  @Column({ unique: true })
  public ref!: string;

  @Column()
  public customerNumber!: string;

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

  @Column()
  public status!: "PENDING" | "SUCCESS" | "FAILED" | "INQUIRY";

  @Column("json")
  public details!: Partial<TopupResponse>;

  @Column("json")
  public inq!: Partial<TopupResponse | PayResponse>;

  @Column({ nullable: true })
  public userId!: string;

  @Column({ nullable: true })
  public productId!: string;

  @ManyToOne(() => User, (user) => user.purchases, {
    onDelete: "SET NULL",
  })
  @Type(() => User)
  public user!: Relation<User>;

  @ManyToOne(() => Product, (user) => user.purchases, {
    onDelete: "SET NULL",
    eager: true,
  })
  @Type(() => Product)
  public product!: Relation<Product>;

  @BeforeInsert()
  public async assignRequiredData() {
    this.product.price = currency(
      (await calculateProductPricing(this.product, this.user)).price
    );

    if (this.product.type === "PASCA") {
      this.status = "INQUIRY";
      this.inq = await digiflazz().checkInq(this.product.toRaw(), {
        customerNumber: this.customerNumber,
        refId: this.ref,
      });
    }

    const { result: fees, total } = calculateFee(
      this.product.type === "PREPAID" ? this.product.price : this.inq.price!,
      this.fees
    );
    this.invoiceNumber = await generateInvoice(
      process.env.INV_FORMAT_TOPUP ?? "PUR-%date:yyyyLLdd%-%000000%",
      Purchase,
      "invoiceNumber"
    );
    this.total = total;
    this.fees = fees;
    this.name = this.product.name;
    this.price = this.product.price;
    this.inq = {};
    this.ref = createId();
  }

  @AfterInsert()
  public async proceed() {
    if (this.product.type === "PREPAID") {
      digiflazz()
        .topup(this.product.toRaw(), {
          customerNumber: this.customerNumber,
          refId: this.ref,
        })
        .then(() => {
          log().log.info(
            `PEMBAYARAN DIGIFLAZZ (${this.customerNumber} - ${this.name}) BERHASIL`
          );
        })
        .catch((e) => {
          log().log.info(`PEMBAYARAN ${this.invoiceNumber} GAGAL`);
          log().log.error(e);
        });
    }
  }
}
