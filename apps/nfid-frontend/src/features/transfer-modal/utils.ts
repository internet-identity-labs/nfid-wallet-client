import { DelegationIdentity } from "@dfinity/identity"
import {
  AccountIdentifier,
  checkAccountId,
  SubAccount,
} from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { PRINCIPAL_LENGTH } from "packages/constants"

import { IGroupedOptions, IGroupOption } from "@nfid-frontend/ui"
import { toUSD, truncateString } from "@nfid-frontend/utils"
import {
  getVaults,
  getWallets,
  replaceActorIdentity,
  vault,
} from "@nfid/integration"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { NFT } from "frontend/integration/nft/nft"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { fetchVaultWalletsBalances } from "../fungible-token/fetch-balances"

export const getIdentity = async (
  targetCanisters: string[],
): Promise<DelegationIdentity> => {
  return getWalletDelegationAdapter("nfid.one", "-1", targetCanisters)
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

export const validateICPAddress = (address: string): boolean | string => {
  const isPrincipal = addressValidationService.isValidPrincipalId(address)
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isPrincipal && !isAccountIdentifier) {
    try {
      decodeIcrcAccount(address)
      return true
    } catch (e) {
      console.error("Error: ", e)
      return "Incorrect wallet address or accound ID"
    }
  } else return true
}

export const validateICRC1Address = (address: string): boolean | string => {
  try {
    decodeIcrcAccount(address)
    return true
  } catch (e) {
    return "Incorrect wallet address"
  }
}

export const getAccountIdentifier = (address: string): string => {
  if (addressValidationService.isValidAccountIdentifier(address)) return address

  try {
    // Try if it's default principal or `${principal}-${checksum}-${subaccount}`
    const principal = Principal.fromText(address)
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal })
    return accountIdentifier.toHex()
  } catch (e) {
    // Handle `${principal}-${checksum}-${subaccount}`
    const { owner: principalTo, subaccount } = decodeIcrcAccount(address)
    const subAccountObject = subaccount
      ? SubAccount.fromBytes(subaccount as Uint8Array)
      : null
    if (subAccountObject instanceof Error) throw subAccountObject

    return AccountIdentifier.fromPrincipal({
      principal: principalTo,
      subAccount: subAccountObject ?? undefined,
    }).toHex()
  }
}

export const getBalance = async (address: string): Promise<bigint> => {
  const addressVerified =
    address.length === PRINCIPAL_LENGTH
      ? AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(address),
        }).toHex()
      : address

  const balance = await getBalance(addressVerified)
  return balance
}
