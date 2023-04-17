import { Principal } from "@dfinity/principal"
import { format } from "date-fns"
import { principalToAddress } from "ictool"
import { ChainBalance } from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { BtcWallet } from "packages/integration/src/lib/bitcoin-wallet/btc-wallet"
import {
  AccountBalance,
  AppBalance,
  TokenBalanceSheet,
}  from "packages/integration/src/lib/asset/types";
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { TransactionRow } from "src/integration/rosetta/select-transactions"

import { IconSvgBTC } from "@nfid-frontend/ui"
import {
  storeAddressInLocalCache,
  readAddressFromLocalCache,
} from "@nfid/client-db"
import {
  btcWallet as btcAPI,
  loadProfileFromLocalStorage,
  replaceActorIdentity,
} from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"

const ROOT_DOMAIN = "nfid.one"
const BTC_ROOT_ACCOUNT = "account 1"

export interface BtcTxs {
  sendTransactions?: TransactionRow[]
  receivedTransactions?: TransactionRow[]
  walletAddress: string
  btcAddress: string
}

export const getBtcBalance = async (): Promise<TokenBalanceSheet> => {
  const { address, principal } = await getAccIdentifier()
  const balance = await BtcAsset.getBalance(address)
  return computeSheetForRootAccount(balance, address, principal)
}

export const getBtcFee = async (): Promise<number> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const identity = await getWalletDelegation(profile.anchor, "nfid.one", "1")
  return new BtcWallet(identity).getFee()
}

export const getBtcAddress = async (): Promise<string> => {
  const { address } = await getAccIdentifier()
  return address
}

export const getBtcTransactionHistory = async (): Promise<BtcTxs> => {
  const { address, principal } = await getAccIdentifier()
  const sendTransactions = await getTransactions("send", address)
  const receivedTransactions = await getTransactions("received", address)
  let addressPrincipal = principalToAddress(Principal.fromText(principal))
  return {
    sendTransactions,
    receivedTransactions,
    walletAddress: addressPrincipal,
    btcAddress: address,
  }
}

export const getTransactions = async (
  type: string,
  address: string,
): Promise<TransactionRow[]> => {
  return await BtcAsset.getFungibleActivityByTokenAndUser({
    address,
    direction: type === "send" ? "from" : "to",
  }).then((tss) => {
    return tss.activities.map(
      (tx) =>
        ({
          type:
            tx.from.toLowerCase() === address.toLowerCase()
              ? "send"
              : "received",
          asset: "BTC",
          quantity: Number(tx.price) / E8S,
          date: format(
            new Date(Number(tx.date) * 1000),
            "MMM dd, yyyy - hh:mm:ss aaa",
          ),
          from: tx.from,
          to: tx.to,
        } as TransactionRow),
    )
  })
}

export const getAccIdentifier = async () => {
  let profile = await fetchProfile()
  const anchor = BigInt(profile.anchor)
  const hostname = "btc_" + ROOT_DOMAIN
  let address = readAddressFromLocalCache({
    accountId: BTC_ROOT_ACCOUNT,
    hostname,
    anchor,
  })
  let principal = ""
  if (!address) {
    const identity = await getWalletDelegation(profile.anchor)
    await replaceActorIdentity(btcAPI, identity)
    principal = identity.getPrincipal().toText()
    address = await new BtcWallet(identity).getBitcoinAddress()
    storeAddressInLocalCache({
      accountId: BTC_ROOT_ACCOUNT,
      hostname,
      address,
      anchor,
    })
  } else {
    principal = await getWalletDelegation(profile?.anchor).then((l) =>
      l.getPrincipal().toText(),
    )
  }
  return { address, principal }
}

//sc-6513
export const computeSheetForRootAccount = async (
  balance: ChainBalance,
  address: string | undefined,
  principalId: string,
): Promise<TokenBalanceSheet> => {
  const tokenBalance = BigInt(Number(balance.balance?.multipliedBy(E8S) ?? 0))
  const usdBalance = "$" + (balance.balanceinUsd?.toFixed(2) ?? "0.00")
  const rootAccountBalance: AccountBalance = {
    accountName: "account 1",
    address: address ?? "",
    principalId,
    tokenBalance,
    usdBalance,
  }
  const appBalance: AppBalance = {
    accounts: [rootAccountBalance],
    appName: "NFID",
    tokenBalance,
  }
  return {
    applications: {
      NFID: appBalance,
    },
    icon: IconSvgBTC,
    label: "Bitcoin",
    token: "BTC",
    tokenBalance,
    usdBalance,
  }
}
