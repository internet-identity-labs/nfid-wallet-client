import { DelegationIdentity } from "@dfinity/identity"
import { checkAccountId } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"

import { IGroupedOptions, IGroupOption } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import {
  authState,
  Chain,
  getPublicKey,
  getVaults,
  getWallets,
  GLOBAL_ORIGIN,
  replaceActorIdentity,
  vault,
} from "@nfid/integration"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { NFT } from "frontend/integration/nft/nft"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { toUSD } from "../fungible-token/accumulate-app-account-balances"
import { fetchVaultWalletsBalances } from "../fungible-token/fetch-balances"

export const getIdentity = async (
  domain = "nfid.one",
  accountId = "0",
  targetCanisters: string[],
): Promise<DelegationIdentity> => {
  return getWalletDelegationAdapter(domain, accountId, targetCanisters)
}

export const mapUserNFTDetailsToGroupedOptions = (
  userNFTDetailsArray: NFT[],
): IGroupedOptions[] => {
  const options = userNFTDetailsArray.map(
    (nft) =>
      ({
        title: nft.getTokenName(),
        subTitle: nft.getCollectionName(),
        value: nft.getTokenId(),
        icon: nft.getAssetPreview().url,
      } as IGroupOption),
  )

  return [
    {
      label: "label",
      options,
    },
  ]
}

export const getVaultsAccountsOptions = async (): Promise<
  IGroupedOptions[]
> => {
  await replaceActorIdentity(vault, await getWalletDelegationAdapter())
  const rate = await getExchangeRate("ICP")
  const allVaults = await getVaults()
  const allVaultWallets = await Promise.all(
    allVaults.map((v) => v.id).map(async (v) => await getWallets(v)),
  )

  const walletsWithE8SBalances = await Promise.all(
    allVaultWallets
      .filter((wallets) => wallets.length > 0)
      .map(async (wallets) => fetchVaultWalletsBalances(wallets)),
  )

  const walletsWithBalances = walletsWithE8SBalances.map((vault) =>
    vault.map((w) => ({
      ...w,
      balance: { ICP: e8sICPToString(Number(w?.balance?.ICP)) },
    })),
  )

  return walletsWithBalances.map((vaultWallets) => ({
    label:
      allVaults.find((v) => v.id === vaultWallets[0].vaults[0])?.name ?? "",
    options: vaultWallets.map((wallet) => ({
      title: wallet.name ?? "",
      subTitle: truncateString(wallet.address ?? "", 6, 4),
      innerTitle: String(wallet.balance?.ICP) + " ICP",
      innerSubtitle: toUSD(Number(wallet.balance?.ICP), rate),
      value: wallet.address ?? "",
    })),
  }))
}

export const getAccount = async () => {
  const identity = authState.get().delegationIdentity
  if (!identity) throw new Error("No identity")
  return await getPublicKey(identity, Chain.IC, GLOBAL_ORIGIN)
}

const addressValidationService = {
  isValidAccountIdentifier(value: string): boolean {
    try {
      checkAccountId(value)
      return true
    } catch {
      return false
    }
  },
  isValidPrincipalId(value: string): boolean {
    try {
      if (Principal.fromText(value)) return true
      return false
    } catch {
      return false
    }
  },
}

export const validateAddress = (address: string): boolean | string => {
  const isPrincipal = addressValidationService.isValidPrincipalId(address)
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isPrincipal && !isAccountIdentifier) {
    try {
      decodeIcrcAccount(address)
      return true
    } catch (e) {
      console.error("Error: ", e)
      return "Incorrect format of Destination Address"
    }
  } else return true
}
