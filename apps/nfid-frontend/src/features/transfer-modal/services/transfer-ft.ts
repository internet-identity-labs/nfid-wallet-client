import { transferBTC } from "src/features/fungable-token/btc/get-btc"
import { transferERC20 } from "src/features/fungable-token/erc-20/get-erc-20"

import {
  Account,
  ecdsaSigner,
  ethereumAsset,
  loadProfileFromLocalStorage,
  registerTransaction,
  replaceActorIdentity,
} from "@nfid/integration"
import { transfer as submitDIP20 } from "@nfid/integration/token/dip-20"
import { transfer as submitICP } from "@nfid/integration/token/icp"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { TransferMachineContext } from "../machine"
import { transferERC20Polygon } from "src/features/fungable-token/erc-20/get-erc-20-polygon";
import { transferMatic } from "src/features/fungable-token/matic/get-matic";

export const transferFT = async (context: TransferMachineContext) => {
  if (context.sourceAccount?.isVaultWallet) {
    return transferVaultICP(
      context.receiverWallet,
      context.amount,
      context.sourceAccount.accountId,
    )
  }

  switch (context.selectedFT?.tokenStandard) {
    case "ETH":
      return transferETH(parseFloat(context.amount), context.receiverWallet)
    case "BTC":
      return transferBTC(parseFloat(context.amount), context.receiverWallet)
    case "MATIC":
      return transferMatic(parseFloat(context.amount), context.receiverWallet)
    case "ERC20":
      return transferERC20(
        parseFloat(context.amount),
        context.receiverWallet,
        context.selectedFT,
      )
    case "ERC20P":
      return transferERC20Polygon(
        parseFloat(context.amount),
        context.receiverWallet,
        context.selectedFT,
      )
    default:
      return transferICP(
        context.amount,
        context.receiverWallet,
        context.sourceAccount,
        context.selectedFT?.canisterId,
      )
  }
}

const transferETH = async (amount: number, to: string) => {
  try {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    const identity = await getWalletDelegation(profile.anchor, "nfid.one", "1")
    await replaceActorIdentity(ecdsaSigner, identity)
    await ethereumAsset.transferETH({
      delegation: identity,
      to,
      amount: String(amount),
    })

    return `You've sent ${amount} ETH`
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
}

const transferICP = async (
  amount: string,
  to: string,
  from?: Account,
  canisterId?: string,
) => {
  if (!from) throw new Error("transferICP from account missing")
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())

  const identity = await getWalletDelegation(
    profile.anchor,
    from.domain,
    from.accountId,
  )

  try {
    if (canisterId) {
      return await submitDIP20({
        canisterId,
        amount: stringICPtoE8s(String(amount)),
        to,
        sourceIdentity: identity,
      })
    }
    await submitICP(stringICPtoE8s(String(amount)), to, identity)
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
  return `You've sent ${amount} ICP`
}

const transferVaultICP = async (to: string, amount: string, from?: string) => {
  if (!from) throw new Error("transferVaultICP from account missing")

  try {
    await registerTransaction({
      address: to,
      amount: BigInt(stringICPtoE8s(String(amount))),
      from_sub_account: from,
    })
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }

  return `You've requested ${amount} ICP from the vault`
}
