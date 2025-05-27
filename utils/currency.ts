import { default as currencyJs } from "currency.js";

export default function currency(value: currencyJs.Any) {
  return currencyJs(value, { precision: Number(process.env.PRECISION || 0) });
}
