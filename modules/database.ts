import Admin from "@app-entities/admin.js";
import Brand from "@app-entities/brand.js";
import Category from "@app-entities/category.js";
import Membership from "@app-entities/membership.js";
import Product from "@app-entities/product.js";
import User from "@app-entities/user.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../database/index.js";
import PricingPackage from "@app-entities/pricing-package.js";
import Wallet from "@app-entities/wallet.js";

export class Database {
  private static instance: Database;
  public source!: DataSource;

  private constructor(source: DataSource) {
    this.source = source;
  }

  public static getInstance() {
    if (!Database.instance) throw new Error("Database not booted yet");

    return Database.instance;
  }

  public static async boot() {
    return AppDataSource()
      .initialize()
      .then((db) => {
        Database.instance = new Database(db);
      });
  }

  public async countAll() {
    const counts = {
      admin: await Admin.count(),
      user: await User.count(),
      wallet: await Wallet.count(),
      membership: await Membership.count(),
      category: await Category.count(),
      brand: await Brand.count(),
      product: await Product.count(),
      pricing: await PricingPackage.count(),
    };

    console.table(counts);
  }
}

const db = Database.getInstance;
export default db;
