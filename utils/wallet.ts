import MembershipPayment from "@app-entities/membership-payment.js";
import Purchase from "@app-entities/purchase.js";
import TopUp from "@app-entities/topup.js";
import WalletLedger from "@app-entities/wallet-ledger.js";
import Wallet from "@app-entities/wallet.js";
import currency from "currency.js";
import { EntityManager } from "typeorm";

export const addBalance = async (
  em: EntityManager,
  event: TopUp | MembershipPayment | Purchase
) => {
  const wallet = await em
    .getRepository(Wallet)
    .createQueryBuilder("wallet")
    .where("wallet.userId = :id", { id: event.userId })
    .setLock("pessimistic_write")
    .getOneOrFail();

  let add = currency(0);
  let eventDetail: WalletLedger["event"] = {};

  if (event instanceof TopUp) {
    add = event.amount;
    eventDetail = {
      topup: {
        id: event.id,
        method: event.method,
      },
    };
  } else if (event instanceof MembershipPayment) {
    add = currency(0).subtract(event.total);
    eventDetail = {
      membership: {
        id: event.id,
        name: event.name,
      },
    };
  } else if (event instanceof Purchase) {
    add = currency(0).subtract(event.total);
    eventDetail = {
      purchase: {
        id: event.id,
        category: {
          id: event.product.category?.id,
          name: event.product.category?.name,
        },
        brand: {
          id: event.product.brand?.id,
          name: event.product.brand?.name,
        },
        name: event.name,
      },
    };
  }

  const result = wallet.balance.add(add);

  const ledger = WalletLedger.from({
    add,
    current: wallet.balance,
    event: eventDetail,
    result,
    wallet,
  });

  wallet.balance = result;

  await em.getRepository(Wallet).save(wallet);
  await em.getRepository(WalletLedger).save(ledger);
};
