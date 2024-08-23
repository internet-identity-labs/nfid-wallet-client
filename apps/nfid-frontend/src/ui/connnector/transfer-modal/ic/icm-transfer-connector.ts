import { DelegationIdentity } from "@dfinity/identity"
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { Cache } from "node-ts-cache"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { mutate } from "swr"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import {
  getBalance,
  getVaults,
  getWalletName,
  getWallets,
  replaceActorIdentity,
  vault,
} from "@nfid/integration"
import { transfer as transferICP } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungible-token/accumulate-app-account-balances"
import { fetchVaultWalletsBalances } from "frontend/features/fungible-token/fetch-balances"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

import { connectorCache } from "../../cache"
import { TransferModalConnector } from "../transfer-modal"
import {
  ITransferConfig,
  ITransferFTRequest,
  ITransferNFTRequest,
  ITransferResponse,
} from "../types"
import { addressValidationService } from "../util/validation-service"

export abstract class ICMTransferConnector<
  ConfigType extends ITransferConfig,
> extends TransferModalConnector<ConfigType> {
  @Cache(connectorCache, { ttl: 30 })
  async getAccountsOptions({
    isVault,
    isRootOnly,
  }: {
    currency?: string
    isVault?: boolean
    isRootOnly?: boolean
  }): Promise<IGroupedOptions[]> {
    if (isVault) {
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

    let principals = await this.getAllPrincipals(true)
    if (isRootOnly) {
      principals = {
        "nfid.one": [
          principals["nfid.one"].find((acc) => acc.account.accountId === "-1")!,
        ],
      }
    }

    const applications = await this.getApplications()

    const groupedOptions = await Promise.all(
      Object.entries(principals).map(async ([domain, principals]) => {
        const options: IGroupOption[] = await Promise.all(
          principals.map(async ({ account, principal }) => {
            const balance = await this.getBalance(principal.toString())

            return {
              title: account.label.length
                ? account.label
                : getWalletName(
                    applications,
                    account.domain,
                    account.accountId,
                  ),
              subTitle: truncateString(
                AccountIdentifier.fromPrincipal({ principal }).toHex(),
                6,
                4,
              ),
              value: principal.toString(),
              innerTitle: balance?.toString() + " " + this.config.tokenStandard,
              badgeText: account.accountId === "-1" ? "WALLET" : undefined,
            }
          }),
        )

        return {
          label:
            applications.find((app) => app.domain === domain)?.name ?? domain,
          options: options,
        }
      }),
    )

    return keepStaticOrder<IGroupedOptions>(
      ({ label }) => label,
      ["NFID", "NNS"],
    )(groupedOptions.sort(sortAlphabetic(({ label }) => label)))
  }

  @Cache(connectorCache, { ttl: 10 })
  async getBalance(address: string): Promise<bigint> {
    const addressVerified =
      address.length === PRINCIPAL_LENGTH
        ? AccountIdentifier.fromPrincipal({
            principal: Principal.fromText(address),
          }).toHex()
        : address

    const balance = await getBalance(addressVerified)
    return balance
  }

  getAddress(_: string, identity: DelegationIdentity): Promise<string> {
    return Promise.resolve(identity.getPrincipal().toString())
  }

  private getAccountIdentifier(address: string): string {
    if (addressValidationService.isValidAccountIdentifier(address))
      return address

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

  async transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse> {
    if (!request.identity)
      throw new Error("Identity not found. Please try again")
    console.debug("ICP Transfer request", { request })

    try {
      const res =
        "tokenId" in request
          ? await transferEXT(request.tokenId, request.identity, request.to)
          : await transferICP({
              amount: stringICPtoE8s(String(request.amount)),
              to: this.getAccountIdentifier(request.to),
              ...(request.memo ? { memo: request.memo } : {}),
              identity: request.identity,
            })

      setTimeout(() => {
        "tokenId" in request
          ? mutate(
              (key: any) =>
                key && Array.isArray(key) && key[0] === "userTokens",
            )
          : mutate(
              (key: any) =>
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

  validateAddress(address: string): boolean | string {
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
}
