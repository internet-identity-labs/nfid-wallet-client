import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { Cache } from "node-ts-cache"
import { isHex } from "packages/utils/src/lib/validation"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import {
  getBalance,
  getVaults,
  getWalletName,
  getWallets,
} from "@nfid/integration"
import { transfer as submitICP } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { fetchVaultWalletsBalances } from "frontend/features/fungable-token/fetch-balances"
import { PRINCIPAL_LENGTH } from "frontend/features/transfer-modal/utils/validations"
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
  TokenBalance,
} from "../types"

export abstract class ICMTransferConnector<
  ConfigType extends ITransferConfig,
> extends TransferModalConnector<ConfigType> {
  @Cache(connectorCache, { ttl: 5 })
  async getAccountsOptions({
    currency,
    isVault,
  }: {
    currency?: string
    isVault?: boolean
  }): Promise<IGroupedOptions[]> {
    if (isVault) {
      const rate = await getExchangeRate()
      const allVaults = await getVaults()
      const vaultWallets = await Promise.all(
        allVaults.map((v) => v.id).map(async (v) => await getWallets(v)),
      )

      const walletsWithBalances = await Promise.all(
        vaultWallets.map(async (wallets) => fetchVaultWalletsBalances(wallets)),
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
    const principals = await this.getAllPrincipals(true)
    const applications = await this.getApplications()

    const groupedOptions = await Promise.all(
      Object.entries(principals).map(async ([domain, principals]) => {
        const options: IGroupOption[] = await Promise.all(
          principals.map(async ({ account, principal }) => {
            const { balance, balanceinUsd } = await this.getBalance(
              principal.toString(),
            )

            return {
              title: account.label.length
                ? account.label
                : getWalletName(
                    applications,
                    account.domain,
                    account.accountId,
                  ),
              subTitle: truncateString(principalToAddress(principal), 6, 4),
              value: principal.toString(),
              innerTitle: balance?.toString() + " " + this.config.tokenStandard,
              innerSubtitle: "$" + balanceinUsd,
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

  @Cache(connectorCache, { ttl: 15 })
  async getBalance(address: string): Promise<TokenBalance> {
    const addressVerified =
      address.length === PRINCIPAL_LENGTH
        ? principalToAddress(Principal.fromText(address))
        : address
    const balance = await getBalance(addressVerified)

    return Promise.resolve({
      balance: e8sICPToString(Number(balance)),
      balanceinUsd: e8sICPToString(Number(Number(balance)?.toFixed(2))),
    })
  }

  getAddress(_: string, identity: DelegationIdentity): Promise<string> {
    return Promise.resolve(identity.getPrincipal().toString())
  }

  async transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse> {
    if (!request.identity)
      throw new Error("Identity not found. Please try again")

    try {
      "tokenId" in request
        ? await transferEXT(request.tokenId, request.identity, request.to)
        : await submitICP(
            stringICPtoE8s(String(request.amount)),
            request.to.length === PRINCIPAL_LENGTH
              ? principalToAddress(Principal.fromText(request.to))
              : request.to,
            request.identity,
          )

      return {}
    } catch (e: any) {
      return {
        errorMessage: e ?? "Unknown error",
      }
    }
  }

  validateAddress(address: string): boolean | string {
    switch (address.length) {
      case 63:
        try {
          Principal.fromText(address)
          return true
        } catch {
          return "Not a valid principal ID"
        }
      case 64:
        if (!isHex(address)) return "Not a valid address"
        return true
      default:
        return "Address length should be 63 or 64 characters"
    }
  }
}
