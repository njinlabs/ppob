import {
  InqResponse,
  PayResponse,
  RawProduct,
  TopupResponse,
} from "@app-types/digiflazz.js";
import axios, { AxiosError, AxiosInstance } from "axios";
import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import { DateTime } from "luxon";
import { createHash } from "node:crypto";

export class Digiflazz {
  private static instance: Digiflazz;
  private client: AxiosInstance;
  private config!: {
    username: string;
    key: string;
  };

  private constructor() {
    this.client = axios.create({
      baseURL: "https://api.digiflazz.com/v1",
    });
    this.config = {
      username: process.env.DIGIFLAZZ_USERNAME!,
      key: process.env.DIGIFLAZZ_KEY!,
    };
  }

  public static getInstance() {
    if (!Digiflazz.instance) throw new Error("Digiflazz not booted yet");

    return Digiflazz.instance;
  }

  public static async boot() {
    Digiflazz.instance = new Digiflazz();
  }

  private sign(action: string) {
    return createHash("md5")
      .update(`${this.config.username}${this.config.key}${action}`)
      .digest("hex");
  }

  private handleError<T>(e: AxiosError): T {
    if (e.status === 400) {
      throw new Error(
        (e.response?.data as { data: { message: string } }).data.message
      );
    }

    throw e;
  }

  public getBalance() {
    return this.client
      .post("/cek-saldo", {
        cmd: "deposit",
        username: this.config.username,
        sign: this.sign("depo"),
      })
      .then(({ data }) => currencyWrap(data.data.deposit))
      .catch(this.handleError<currency>);
  }

  public getPriceList(type: "prepaid" | "pasca") {
    return this.client
      .post("/price-list", {
        cmd: type,
        username: this.config.username,
        sign: this.sign("pricelist"),
      })
      .then(({ data }) => {
        return data.data.map(this.generateRawProduct) as RawProduct[];
      })
      .catch(this.handleError<RawProduct[]>);
  }

  private generateRawProduct<T = any>(value: T): RawProduct {
    const anyVal = value as any;
    const startCutOff = DateTime.local()
      .setZone("Asia/Jakarta")
      .set({
        hour: Number(anyVal.start_cut_off?.split(":")[0] ?? 0),
        minute: Number(anyVal.start_cut_off?.split(":")[1] ?? 0),
      });
    const endCutOff = DateTime.local()
      .setZone("Asia/Jakarta")
      .set({
        hour: Number(anyVal.end_cut_off?.split(":")[0] ?? 0),
        minute: Number(anyVal.end_cut_off?.split(":")[1] ?? 0),
      });

    return {
      brand: anyVal.brand ?? null,
      buyerProductStatus: Boolean(anyVal.status),
      buyerSKUCode: anyVal.buyer_sku_code ?? null,
      category: anyVal.category ?? null,
      desc: anyVal.desc ?? null,
      endCutOff,
      multi: Boolean(anyVal.multi),
      price: currencyWrap(anyVal.price ?? 0),
      productName: anyVal.product_name,
      sellerName: anyVal.seller_ame,
      sellerProductStatus: Boolean(anyVal.seller_product_status),
      stock: anyVal.stock,
      type: anyVal.type,
      unlimitedStock: Boolean(anyVal.unlimited_stock),
      startCutOff:
        startCutOff > endCutOff ? startCutOff.minus({ days: 1 }) : startCutOff,
    };
  }

  public topup(
    product: RawProduct,
    data: { customerNumber: string; refId: string; testing?: boolean }
  ) {
    return this.client
      .post("/transaction", {
        username: this.config.username,
        buyer_sku_code: product.buyerSKUCode,
        sign: this.sign(data.refId),
        customer_no: data.customerNumber,
        ref_id: data.refId,
        testing: data.testing,
      })
      .then(({ data }) => {
        const value = data.data;

        return {
          buyerSKUCode: value.buyer_sku_code,
          customerNumber: value.customer_no,
          message: value.message,
          price: currencyWrap(value.price ?? 0),
          refId: value.ref_id,
          status:
            value.status === "Pending"
              ? "PENDING"
              : value.status === "Gagal"
              ? "FAILED"
              : "SUCCEED",
          serialNumber: value.sn || undefined,
        } as TopupResponse;
      })
      .catch(this.handleError<TopupResponse>);
  }

  public checkInq(
    product: RawProduct,
    data: {
      customerNumber: string;
      refId: string;
      testing?: boolean;
    }
  ) {
    return this.client
      .post("/transaction", {
        commands: "inq-pasca",
        username: this.config.username,
        buyer_sku_code: product.buyerSKUCode,
        customer_no: data.customerNumber,
        ref_id: data.refId,
        sign: this.sign(data.refId),
      })
      .then(({ data }) => {
        const value = data.data;

        return {
          buyerSKUCode: value.buyer_sku_code,
          customerName: value.customer_name,
          customerNumber: value.customer_no,
          message: value.message,
          price: currencyWrap(value.price ?? 0),
          refId: value.ref_id,
          status:
            value.status === "Pending"
              ? "PENDING"
              : value.status === "Gagal"
              ? "FAILED"
              : "SUCCEED",
        } as InqResponse;
      })
      .catch(this.handleError<InqResponse>);
  }

  public pay(inq: InqResponse) {
    return this.client
      .post("/transaction", {
        commands: "pay-pasca",
        username: this.config.username,
        buyer_sku_code: inq.buyerSKUCode,
        customer_no: inq.customerNumber,
        ref_id: inq.refId,
        sign: this.sign(inq.refId),
      })
      .then(({ data }) => {
        const value = data.data;

        return {
          buyerSKUCode: value.buyer_sku_code,
          customerName: value.customer_name,
          customerNumber: value.customer_no,
          message: value.message,
          price: currencyWrap(value.price ?? 0),
          refId: value.ref_id,
          status:
            value.status === "Pending"
              ? "PENDING"
              : value.status === "Gagal"
              ? "FAILED"
              : "SUCCEED",
        } as PayResponse;
      })
      .catch(this.handleError<PayResponse>);
  }
}

const digiflazz = Digiflazz.getInstance;
export default digiflazz;
