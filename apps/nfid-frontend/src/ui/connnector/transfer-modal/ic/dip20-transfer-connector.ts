import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { Cache } from "node-ts-cache"

import {
  IGroupOption,
  IGroupedOptions,
  IconSvgDfinity,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { getWalletName } from "@nfid/integration"
import {
  TokenMetadata,
  getDIP20Balance,
  getMetadata,
} from "@nfid/integration/token/dip-20"
import { TOKEN_CANISTER } from "@nfid/integration/token/dip-20/constants"
import { TokenStandards } from "@nfid/integration/token/types"

import { e8sICPToString } from "frontend/integration/wallet/utils"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  TokenBalance,
  TokenFee,
  TransferModalType,
} from "../types"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class DIP20TransferConnector
  extends ICMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  @Cache(connectorCache, { ttl: 600 })
  async getTokenMetadata(currency: string): Promise<TokenMetadata> {
    const tokens = await this.getTokens()
    const token = tokens.find((token) => token.symbol === currency)

    return {
      ...token,
      ...this.config,
      icon: token?.logo ?? this.config.icon,
    } as any
  }

  @Cache(connectorCache, { ttl: 15 })
  async getBalance(address?: string, currency?: string): Promise<TokenBalance> {
    const { canisterId } = await this.getTokenMetadata(currency ?? "")

    const balance = await getDIP20Balance({
      canisterId,
      principalId: address ?? "",
    })

    return Promise.resolve({
      balance: e8sICPToString(Number(balance)),
      balanceinUsd: e8sICPToString(Number(Number(balance)?.toFixed(2))),
    })
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokenCurrencies(): Promise<string[]> {
    const tokens = await this.getTokens()
    return tokens.map((token) => token.symbol)
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokens(): Promise<TokenMetadata[]> {
    return await Promise.all(TOKEN_CANISTER.map(getMetadata))
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokensOptions(): Promise<IGroupedOptions> {
    const tokens = await this.getTokens()

    return {
      label: this.config.blockchain,
      options: tokens.map((token) => ({
        icon: token.logo ?? this.config.icon,
        title: token.symbol,
        subTitle: token.name,
        value: `${token.symbol}&${this.config.blockchain}`,
      })),
    }
  }

  @Cache(connectorCache, { ttl: 15 })
  async getAccountsOptions({
    currency,
  }: {
    currency: string
  }): Promise<IGroupedOptions[]> {
    const { symbol } = await this.getTokenMetadata(currency ?? "")
    const principals = await this.getAllPrincipals(true)
    const applications = await this.getApplications()

    const groupedOptions = await Promise.all(
      Object.entries(principals).map(async ([domain, principals]) => {
        const options: IGroupOption[] = await Promise.all(
          principals.map(async ({ account, principal }) => {
            const { balance, balanceinUsd } = await this.getBalance(
              principal.toString(),
              currency ?? "",
            )

            return {
              title: getWalletName(
                applications,
                account.domain,
                account.accountId,
              ),
              subTitle: truncateString(principalToAddress(principal), 6, 4),
              value: principal.toString(),
              innerTitle: balance?.toString() + " " + symbol,
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

  validateAddress(address: string): boolean | string {
    if (address.length !== 63) return "Principal length should be 63 characters"
    try {
      Principal.fromText(address)
    } catch {
      return "Not a valid principal ID"
    }

    return true
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({ currency }: ITransferFTRequest): Promise<TokenFee> {
    const tokenMetadata = await this.getTokenMetadata(currency)
    return Promise.resolve({
      fee: tokenMetadata.fee.toString(),
      feeUsd: tokenMetadata.fee.toString(),
    })
  }
}

export const dip20TransferConnector = new DIP20TransferConnector({
  tokenStandard: TokenStandards.DIP20,
  blockchain: Blockchain.IC,
  feeCurrency: NativeToken.ICP,
  shouldHavePrincipal: true,
  addressPlaceholder: "Recipient principal ID",
  icon: IconSvgDfinity,
  type: TransferModalType.FT20,
})
