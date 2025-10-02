import { DelegationIdentity } from "@dfinity/identity"
import {
  AccountIdentifier,
  checkAccountId,
  Icrc1BlockIndex,
} from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import validate, { Network } from "bitcoin-address-validation"
import { isAddress } from "ethers"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { Shroff } from "src/integration/swap/shroff"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { toUSD, truncateString } from "@nfid-frontend/utils"
import {
  authState,
  getBalance,
  getVaults,
  getWallets,
  replaceActorIdentity,
  vault,
} from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { transfer as transferICP } from "@nfid/integration/token/icp"
import { mutate } from "@nfid/swr"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { FT } from "frontend/integration/ft/ft"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

import { fetchVaultWalletsBalances } from "../fungible-token/fetch-balances"
import { ftService } from "frontend/integration/ft/ft-service"

type ITransferRequest = {
  to: string
  memo?: bigint
  contract: string
  identity?: DelegationIdentity
  canisterId?: string
  fee?: bigint
}

type ITransferFTRequest = {
  currency: string
  amount: number | bigint
} & ITransferRequest

type ITransferNFTRequest = {
  tokenId: string
  standard: string
} & ITransferRequest

interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
  hash?: string
  blockIndex?: Icrc1BlockIndex
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
      return "Incorrect wallet address or accound ID"
    }
  } else return true
}

export const validateNftAddress = (address: string): boolean | string => {
  const isPrincipal = addressValidationService.isValidPrincipalId(address)
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isPrincipal && !isAccountIdentifier) {
    return "Incorrect wallet address or accound ID"
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

export const validateBTCAddress = (address: string): boolean | string => {
  const result = validate(address, Network.mainnet)

  return result || "Incorrect wallet address"
}

export const validateETHAddress = (address: string): boolean | string => {
  const result = isAddress(address)
  return result || "Incorrect wallet address"
}

export const getUserBalance = async (address: string): Promise<bigint> => {
  const addressVerified =
    address.length === PRINCIPAL_LENGTH
      ? AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(address),
        }).toHex()
      : address

  const balance = await getBalance(addressVerified)
  return balance
}

export const requestTransfer = async (
  request: ITransferFTRequest | ITransferNFTRequest,
): Promise<ITransferResponse> => {
  if (!request.identity) throw new Error("Identity not found. Please try again")
  console.debug("ICP Transfer request", { request })

  try {
    const res =
      "tokenId" in request
        ? await transferEXT(request.tokenId, request.identity, request.to)
        : await transferICP({
            amount: stringICPtoE8s(String(request.amount)),
            to: request.to,
            ...(request.memo ? { memo: request.memo } : {}),
            identity: request.identity,
          })

    setTimeout(() => {
      "tokenId" in request
        ? mutate(
            (key: string | string[]) =>
              key && Array.isArray(key) && key[0] === "userTokens",
          )
        : mutate(
            (key: string | string[]) =>
              key && Array.isArray(key) && key[0] === "AllBalanceRaw",
          )
    }, 1000)
    return {
      hash: String(res),
    }
  } catch (e: any) {
    return {
      errorMessage: e ?? "Unknown error",
    }
  }
}

export const getQuoteData = async (
  amount: string,
  shroff: Shroff | undefined,
) => {
  if (!amount || !Number(amount) || !shroff) return

  try {
    return await shroff.getQuote(amount)
  } catch (error) {
    throw error
  }
}

export const updateCachedInitedTokens = async (
  tokens: FT[],
  mutateInitedTokens: any,
) => {
  const { publicKey } = authState.getUserIdData()
  const principal = Principal.fromText(publicKey)
  const freshInitedTokens = await ftService.getInitedTokens(
    tokens,
    principal,
    true,
  )
  mutateInitedTokens(freshInitedTokens, false)
  mutate("ftUsdValue")
  mutate("fullUsdValue")
}

export const getTokensWithUpdatedBalance = async (
  ledgers: string[],
  allTokens: FT[],
) => {
  const { publicKey } = authState.getUserIdData()

  const updatedTokens = [...allTokens]

  for (const ledger of ledgers) {
    const index = updatedTokens.findIndex(
      (el) => el.getTokenAddress() === ledger,
    )

    if (index !== -1) {
      const tokenToUpdate = updatedTokens[index]
      const updatedToken = await tokenToUpdate.refreshBalance(
        Principal.fromText(publicKey),
      )
      updatedTokens[index] = updatedToken
    }
  }

  return updatedTokens
}

export const getConversionTokenAddress = (source: string): string => {
  if (source === BTC_NATIVE_ID) return CKBTC_CANISTER_ID
  if (source === CKBTC_CANISTER_ID) return BTC_NATIVE_ID

  if (source === ETH_NATIVE_ID) return CKETH_CANISTER_ID
  if (source === CKETH_CANISTER_ID) return ETH_NATIVE_ID

  return CKBTC_CANISTER_ID
}

export const getAccurateDateForStakeInSeconds = (months: number): number => {
  const now = new Date()
  const future = new Date(now)

  future.setMonth(future.getMonth() + months)

  future.setHours(now.getHours())
  future.setMinutes(now.getMinutes())
  future.setSeconds(now.getSeconds())
  future.setMilliseconds(now.getMilliseconds())

  return Math.floor((future.getTime() - now.getTime()) / 1000)
}

export const addressValidators: Record<
  string,
  (address: string) => boolean | string
> = {
  [ICP_CANISTER_ID]: validateICPAddress,
  [BTC_NATIVE_ID]: validateBTCAddress,
  [ETH_NATIVE_ID]: validateETHAddress,
}
