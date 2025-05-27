import currency from "currency.js";
import currencyWrap from "@app-utils/currency.js";
import { DateTime } from "luxon";

export type RawProduct = {
  category: string;
  brand: string;
  type?: string;
  stock?: number;
  multi: boolean;
  desc: string;
  productName: string;
  sellerName?: string;
  price: currency;
  buyerSKUCode: string;
  buyerProductStatus: boolean;
  sellerProductStatus: boolean;
  unlimitedStock: boolean;
  startCutOff: DateTime;
  endCutOff: DateTime;
};

export type TopupResponse = {
  refId: string;
  customerNumber: string;
  buyerSKUCode: string;
  message: string;
  status: "PENDING" | "SUCCEED" | "FAILED";
  serialNumber?: string;
  price: currency;
};

export type InqResponse = {
  refId: string;
  customerNumber: string;
  customerName: string;
  buyerSKUCode: string;
  message: string;
  status: "PENDING" | "SUCCEED" | "FAILED";
  price: currency;
};

export type PayResponse = {
  refId: string;
  customerNumber: string;
  customerName: string;
  buyerSKUCode: string;
  message: string;
  status: "PENDING" | "SUCCEED" | "FAILED";
  price: currency;
};
