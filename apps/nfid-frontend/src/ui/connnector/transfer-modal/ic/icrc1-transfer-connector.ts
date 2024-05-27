import { DelegationIdentity } from "@dfinity/identity"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { Cache } from "node-ts-cache"

import {
  IGroupOption,
  IGroupedOptions,
  IconSvgDfinity,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { getWalletName, hasOwnProperty } from "@nfid/integration"
import {
  ICRC1Data,
  ICRC1Metadata,
  getICRC1DataForUser,
  transferICRC1,
} from "@nfid/integration/token/icrc1"
import { TokenStandards } from "@nfid/integration/token/types"

import { MAX_DECIMAL_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferConfig,
  ITransferFTConnector,
  ITransferFTRequest,
  ITransferResponse,
  TokenBalance,
  TokenFee,
  TransferModalType,
} from "../types"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class ICRC1TransferConnector
  extends ICMTransferConnector<ITransferConfig>
  implements ITransferFTConnector
{
  @Cache(connectorCache, { ttl: 600 })
  async getTokenMetadata(currency: string): Promise<ICRC1Metadata> {
    const tokens = await this.getTokens()
    const token = tokens.find((token) => token.symbol === currency)

    return {
      ...token,
      price: token?.priceInUsd,
      feeCurrency: token?.symbol,
      title: token?.name,
      icon: token?.logo,
      blockchain: Blockchain.IC,
      addressPlaceholder: "Recipient IC address or principal",
      toPresentation: (value = BigInt(0)) => {
        if (!token) return
        if (Number(value) === 0) return 0
        return (Number(value) / Number(BigInt(10 ** token.decimals)))
          .toFixed(MAX_DECIMAL_LENGTH)
          .replace(/(\.\d*?[1-9])0+|\.0*$/, "$1")
      },
      transformAmount: (value: string) => {
        if (!token) return
        return Number(parseFloat(value) * 10 ** token.decimals)
      },
    } as ICRC1Metadata
  }

  @Cache(connectorCache, { ttl: 15 })
  async getBalance(_: any, currency?: string): Promise<TokenBalance> {
    const token = await this.getTokenMetadata(currency ?? "")
    const { balance, price } = token

    return {
      balance: token.toPresentation(balance).toString(),
      balanceinUsd: price
        ? Number(Number(token.price)?.toFixed(2)).toString()
        : undefined,
    }
  }

  @Cache(connectorCache, { ttl: 60 })
  async getRate(currency: string): Promise<string> {
    const tokens = await this.getTokens()

    const rate = tokens.find((token) => token.symbol === currency)?.rate
    return rate ?? ""
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokenCurrencies(): Promise<string[]> {
    const tokens = await this.getTokens()
    return tokens.map((token) => token.symbol)
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokens(): Promise<ICRC1Data[]> {
    const { rootPrincipalId, publicKey } = await getLambdaCredentials()
    return await getICRC1DataForUser(rootPrincipalId!, publicKey)
  }

  @Cache(connectorCache, { ttl: 600 })
  async getTokensOptions(): Promise<IGroupedOptions> {
    const tokens = await this.getTokens()

    return {
      label: this.config.blockchain,
      options: tokens.map((token) => ({
        icon: token.logo,
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
              undefined,
              currency ?? "",
            )

            return {
              title: getWalletName(
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

  @Cache(connectorCache, { ttl: 10 })
  async getFee({ currency }: ITransferFTRequest): Promise<TokenFee> {
    const token = await this.getTokenMetadata(currency)
    const { fee, feeInUsd } = token

    return {
      fee: token.toPresentation(fee).toString(),
      feeUsd: feeInUsd
        ? feeInUsd.toString().replace(/(\.\d*?[1-9])0+|\.0*$/, "$1")
        : undefined,
    }
  }

  async getIdentity(
    _?: string,
    targetCanister?: string,
  ): Promise<DelegationIdentity> {
    return getWalletDelegationAdapter("nfid.one", "0", [targetCanister!])
  }

  async transfer(request: ITransferFTRequest): Promise<ITransferResponse> {
    if (!request.identity)
      throw new Error("Identity not found. Please try again")

    const { canisterId, identity, amount, to, fee } = request

    const { owner, subaccount } = decodeIcrcAccount(to)

    console.debug("ICRC1 Transfer request", { request })

    try {
      const result = await transferICRC1(identity, canisterId!, {
        to: {
          subaccount: subaccount ? [subaccount] : [],
          owner,
        },
        amount: BigInt(amount),
        memo: [],
        fee: [BigInt(fee!)],
        from_subaccount: [],
        created_at_time: [],
      })

      if (hasOwnProperty(result, "Err")) {
        return {
          errorMessage: result.Err as Error,
        }
      }

      return {
        blockIndex: result.Ok,
      }
    } catch (e) {
      console.error("ERRR:", e)
      return {
        errorMessage: e as Error,
      }
    }
  }

  validateAddress(address: string): boolean | string {
    try {
      decodeIcrcAccount(address)
      return true
    } catch (e) {
      return "Incorrect format of Principal"
    }
  }
}

export const icrc1TransferConnector = new ICRC1TransferConnector({
  tokenStandard: TokenStandards.ICRC1,
  blockchain: Blockchain.IC,
  feeCurrency: NativeToken.ICP,
  shouldHavePrincipal: true,
  addressPlaceholder: "Recipient principal ID",
  icon: IconSvgDfinity,
  type: TransferModalType.FT,
  duration: "10 sec",
})
