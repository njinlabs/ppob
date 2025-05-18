import AdminToken from "@app-entities/admin-token.js";
import Admin from "@app-entities/admin.js";
import Brand from "@app-entities/brand.js";
import Category from "@app-entities/category.js";
import MembershipPayment from "@app-entities/membership-payment.js";
import Membership from "@app-entities/membership.js";
import PricingPackage from "@app-entities/pricing-package.js";
import PricingRule from "@app-entities/pricing-rule.js";
import Product from "@app-entities/product.js";
import Purchase from "@app-entities/purchase.js";
import TopUp from "@app-entities/topup.js";
import Upload from "@app-entities/upload.js";
import UserToken from "@app-entities/user-token.js";
import User from "@app-entities/user.js";
import WalletLedger from "@app-entities/wallet-ledger.js";
import Wallet from "@app-entities/wallet.js";
import { DataSource } from "typeorm";

export const AppDataSource = () =>
  new DataSource({
    type: "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "ppob",
    synchronize: true,
    logging: false,
    entities: [
      Upload,
      Admin,
      AdminToken,
      Category,
      Brand,
      Product,
      PricingPackage,
      PricingRule,
      Membership,
      User,
      UserToken,
      Wallet,
      WalletLedger,
      TopUp,
      MembershipPayment,
      Purchase,
    ],
    subscribers: [],
    migrations: [],
  });
