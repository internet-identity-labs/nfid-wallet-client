import { DelegationIdentity } from "@icp-sdk/core/identity"
import {
  AccountIdentifier,
  checkAccountId,
} from "@icp-sdk/canisters/ledger/icp"
import { decodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc"
import { Principal } from "@icp-sdk/core/principal"
import validate, { Network } from "bitcoin-address-validation"
import { formatUnits, isAddress, parseUnits } from "ethers"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { Shroff } from "src/integration/swap/shroff"

import { IGroupedOptions, IGroupedSendAddress } from "@nfid-frontend/ui"
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
  ETH_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ICP_CANISTER_ID,
  EVM_NATIVE,
  CKSEPOLIA_LEDGER_CANISTER_ID,
} from "@nfid/integration/token/constants"
import {
  getCkErc20ByLedgerId,
  getCkErc20ByErc20Address,
} from "@nfid/integration/token/ckerc20.config"
import { transfer as transferICP } from "@nfid/integration/token/icp"
import { mutate, mutateWithTimestamp } from "@nfid/swr"

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
import {
  Category,
  State,
  ChainId,
  isEvmToken,
} from "@nfid/integration/token/icrc1/enum/enums"
import {
  UserAddress,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"
import {
  AaveUserPosition,
  AaveSupportedChainId,
} from "frontend/integration/aave"

export enum AddressBookAction {
  CREATE = "CREATE",
  EDIT = "EDIT",
  REMOVE = "REMOVE",
}

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
  blockIndex?: bigint
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

export const validateAccountId = (address: string): boolean | string => {
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isAccountIdentifier) {
    return "Invalid accound ID"
  } else return true
}

export const validateICPAddress = (address: string): boolean | string => {
  const isPrincipal = addressValidationService.isValidPrincipalId(address)
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isPrincipal && !isAccountIdentifier) {
    try {
      decodeIcrcAccount(address)
      return true
    } catch (_e) {
      return "Invalid wallet address or accound ID"
    }
  } else return true
}

export const validateNftAddress = (address: string): boolean | string => {
  const isPrincipal = addressValidationService.isValidPrincipalId(address)
  const isAccountIdentifier =
    addressValidationService.isValidAccountIdentifier(address)

  if (!isPrincipal && !isAccountIdentifier) {
    return "Invalid wallet address or accound ID"
  } else return true
}

export const validateICRC1Address = (address: string): boolean | string => {
  try {
    decodeIcrcAccount(address)
    return true
  } catch (_e) {
    return "Invalid wallet address"
  }
}

export const validatePrincipalAddress = (address: string): boolean | string => {
  try {
    Principal.fromText(address)
    return true
  } catch {
    return false
  }
}

export const validateBTCAddress = (address: string): boolean | string => {
  const result = validate(address, Network.mainnet)

  return result || "Invalid wallet address"
}

export const validateETHAddress = (address: string): boolean | string => {
  const result = isAddress(address)
  return result || "Invalid wallet address"
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

export const getTokensWithUpdatedBalance = (
  tokens: Array<{
    address: string
    chainId?: number
    amount: string
    decimals: number
    fee?: bigint
    add?: boolean
  }>,
  allTokens: FT[],
): FT[] => {
  const updatedTokens = [...allTokens]

  for (const { address, chainId, amount, decimals, fee, add } of tokens) {
    const index = updatedTokens.findIndex(
      (el) =>
        el.getTokenAddress() === address &&
        (chainId === undefined || el.getChainId() === chainId),
    )

    if (index !== -1) {
      const token = updatedTokens[index]
      const current = token.getTokenBalance() ?? BigInt(0)
      const parsed = parseUnits(amount, decimals) + (fee ?? BigInt(0))
      ;(token as any).tokenBalance = add
        ? current + parsed
        : current > parsed
          ? current - parsed
          : BigInt(0)
      updatedTokens[index] = token
    }
  }

  return updatedTokens
}

export const refreshTokenBalances = async (
  tokens: Array<{ address: string | undefined; chainId?: number }>,
  allTokens: FT[],
): Promise<FT[]> => {
  const { publicKey } = authState.getUserIdData()

  const updatedTokens = [...allTokens]

  for (const { address, chainId } of tokens) {
    if (!address) continue
    const index = updatedTokens.findIndex(
      (el) =>
        el.getTokenAddress() === address &&
        (chainId === undefined || el.getChainId() === chainId),
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

export const getUpdatedPositions = (
  positions: AaveUserPosition[] | undefined,
  asset: string,
  chainId: AaveSupportedChainId,
  amount: string,
  isMax: boolean,
  token: FT,
  supplyData?: { apy?: string },
) => {
  const currentPositions = positions ?? []
  const index = currentPositions.findIndex(
    (p) => p.asset === asset && p.chainId === chainId,
  )
  let updated: AaveUserPosition[]

  if (supplyData) {
    const decimals = token.getTokenDecimals()
    const supplied = parseUnits(amount, decimals)
    if (index !== -1) {
      updated = currentPositions.map((p, i) => {
        if (i !== index) return p
        const newBalance = p.balance + supplied
        const newBalanceStr = formatUnits(newBalance, p.decimals)
        return {
          ...p,
          balance: newBalance,
          balanceFormatted: `${newBalanceStr} ${p.symbol}`,
          balanceUsdFormatted:
            token.getTokenRateFormatted(newBalanceStr) ?? p.balanceUsdFormatted,
        }
      })
    } else {
      const newBalanceStr = formatUnits(supplied, decimals)
      updated = [
        ...currentPositions,
        {
          chainId,
          asset,
          aTokenAddress: "",
          symbol: token.getTokenSymbol(),
          balance: supplied,
          balanceFormatted: `${newBalanceStr} ${token.getTokenSymbol()}`,
          balanceUsdFormatted: token.getTokenRateFormatted(amount) ?? "",
          decimals,
          supplyAPY: supplyData.apy || "0.00%",
        },
      ]
    }
  } else if (isMax) {
    if (index === -1) return
    updated = currentPositions.filter((_, i) => i !== index)
  } else {
    if (index === -1) return
    updated = currentPositions.map((p, i) => {
      if (i !== index) return p
      const withdrawn = parseUnits(amount, p.decimals)
      const newBalance =
        p.balance > withdrawn ? p.balance - withdrawn : BigInt(0)
      const newBalanceStr = formatUnits(newBalance, p.decimals)
      return {
        ...p,
        balance: newBalance,
        balanceFormatted: `${newBalanceStr} ${p.symbol}`,
        balanceUsdFormatted:
          token.getTokenRateFormatted(newBalanceStr) ?? p.balanceUsdFormatted,
      }
    })
  }

  mutate("earnPositions", updated, false)
}

const mergeUpdatedFtIntoTokenList = (fullList: FT[], updates: FT[]): FT[] => {
  const tokenKey = (t: FT) => `${t.getTokenAddress()}:${t.getChainId()}`
  const byKey = new Map(updates.map((t) => [tokenKey(t), t]))
  return fullList.map((t) => {
    const next = byKey.get(tokenKey(t))
    return next ?? t
  })
}

/**
 * Writes balance updates into the `tokens` SWR cache without replacing the full catalog.
 * `getTokensWithUpdatedBalance` only returns the subset passed in (e.g. inited tokens); replacing
 * the cache with that list drops "Swap to" tokens that exist only in the catalog.
 */
export const mutateTokensCacheMergingBalances = (balanceUpdates: FT[]) => {
  mutate(
    "tokens",
    (current: { data: FT[]; timestamp?: number } | FT[] | undefined) => {
      const currentTokens = Array.isArray(current)
        ? current
        : (current?.data ?? [])
      const merged = mergeUpdatedFtIntoTokenList(currentTokens, balanceUpdates)
      return { data: merged, timestamp: Date.now() }
    },
    false,
  )
}

export const INSUFFICIENT_ETH_FOR_GAS_ERROR =
  "Insufficient ETH balance to cover network gas fees. Please add ETH to your wallet and try again."

export const isInsufficientEthForGas = (e: unknown): boolean => {
  const msg = e instanceof Error ? e.message : String(e)
  return (
    msg.includes("gas required exceeds allowance") ||
    msg.includes("insufficient funds for gas")
  )
}

export const getUpdatedInitedTokens = async (tokens: FT[]) => {
  const { publicKey } = authState.getUserIdData()
  const principal = Principal.fromText(publicKey)
  const updatedTokens = [...tokens]

  const activeTokens = updatedTokens.filter(
    (t) => t.getTokenState() === State.Active,
  )

  const freshInitedTokens = await ftService.getInitedTokens(
    activeTokens,
    principal,
    true,
  )

  await Promise.all([
    mutateWithTimestamp("tokens", updatedTokens, false),
    mutateWithTimestamp("initedTokens", freshInitedTokens, false),
  ])
}

export const getUpdatedAddressBook = async (
  data: UserAddress[] | undefined,
  request: UserAddressSaveRequest | UserAddressUpdateRequest | { id: string },
  mode: AddressBookAction,
) => {
  if (!data) return

  let updated: UserAddress[]

  if (mode === AddressBookAction.CREATE) {
    const tempId = `tmp-${Date.now()}` as string
    updated = [...data, { id: tempId, ...request } as UserAddress]
  } else if (mode === AddressBookAction.EDIT) {
    updated = data.map((addr) =>
      addr.id === (request as UserAddressUpdateRequest).id
        ? { ...addr, ...request }
        : addr,
    )
  } else if (mode === AddressBookAction.REMOVE) {
    updated = data.filter((addr) => addr.id !== (request as { id: string }).id)
  } else {
    updated = data
  }

  await mutate("addressBook", updated, false)
}

export const getConversionTokenAddress = (source: string): string => {
  if (source === BTC_NATIVE_ID) return CKBTC_CANISTER_ID
  if (source === CKBTC_CANISTER_ID) return BTC_NATIVE_ID

  if (source === ETH_NATIVE_ID) return CKETH_LEDGER_CANISTER_ID
  if (source === CKETH_LEDGER_CANISTER_ID) return ETH_NATIVE_ID

  if (source === EVM_NATIVE) return CKSEPOLIA_LEDGER_CANISTER_ID
  if (source === CKSEPOLIA_LEDGER_CANISTER_ID) return EVM_NATIVE

  const ckErc20 = getCkErc20ByLedgerId(source)
  if (ckErc20) return ckErc20.erc20ContractAddress

  const erc20 = getCkErc20ByErc20Address(source)
  if (erc20) return erc20.ledgerCanisterId

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

export const getValidatorByTokenAddress = (
  address?: string,
  category?: Category,
) => {
  if (
    address === ETH_NATIVE_ID ||
    address === EVM_NATIVE ||
    category === Category.ERC20
  ) {
    return validateETHAddress
  }

  if (address === BTC_NATIVE_ID) {
    return validateBTCAddress
  }

  if (address === ICP_CANISTER_ID) {
    return validateICPAddress
  }

  return validateICRC1Address
}

export const getAddressBookFtOptions = (
  addresses: UserAddress[] | undefined,
  token: FT | undefined,
): IGroupedSendAddress[] => {
  if (!addresses || !token) return []

  const chainId = token.getChainId()
  const category = token.getTokenCategory()

  const filteredAddresses = addresses.filter((address) => {
    if (chainId === ChainId.ICP) {
      if (token.getTokenAddress() === ICP_CANISTER_ID) {
        return !!address.icpAccountId
      } else {
        return !!address.icpPrincipal
      }
    }

    if (chainId === ChainId.BTC) {
      return !!address.btc
    }

    if (isEvmToken(chainId) || category === Category.ERC20) {
      return !!address.evm
    }

    return false
  })

  return filteredAddresses.map((address) => {
    let value: string | undefined
    let subTitle: string | undefined

    if (chainId === ChainId.ICP) {
      value =
        token.getTokenAddress() === ICP_CANISTER_ID
          ? address.icpAccountId
          : address.icpPrincipal
      subTitle = value ? truncateString(value, 6, 4) : undefined
    } else if (chainId === ChainId.BTC) {
      value = address.btc
      subTitle = value ? truncateString(value, 6, 4) : undefined
    } else if (isEvmToken(chainId) || category === Category.ERC20) {
      value = address.evm
      subTitle = value ? truncateString(value, 6, 4) : undefined
    }

    return {
      id: address.id,
      title: address.name,
      subTitle,
      value,
    }
  })
}

export const getAddressBookNftOptions = (
  addresses: UserAddress[] | undefined,
  isEvm = false,
): IGroupedSendAddress[] => {
  if (!addresses) return []

  if (isEvm) {
    return addresses
      .filter((address) => !!address.evm)
      .map((address) => ({
        id: address.id,
        title: address.name,
        subTitle: address.evm ? truncateString(address.evm, 6, 4) : undefined,
        value: address.evm,
      }))
  }

  return addresses
    .filter((address) => !!address.icpPrincipal)
    .map((address) => {
      const value = address.icpPrincipal

      return {
        id: address.id,
        title: address.name,
        subTitle: value ? truncateString(value, 6, 4) : undefined,
        value,
      }
    })
}

export const getFeeSymbol = (chainId: ChainId) => {
  if (chainId === ChainId.ICP) return "ICP"
  if (chainId === ChainId.BTC) return "BTC"
  if (chainId === ChainId.POL) return "POL"
  return "ETH"
}

export const isTokenWithBalance = (token: FT) => {
  const balance = token.getTokenBalance()
  return balance !== undefined && balance > BigInt(0)
}
