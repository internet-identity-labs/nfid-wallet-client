import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import { PriceService } from "packages/integration/src/lib/asset/asset-util"
import { applicationToAccount } from "packages/integration/src/lib/identity-manager/application/application-to-account"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import {
  Account,
  Application,
  PrincipalAccount,
  Profile,
  RootWallet,
  fetchPrincipals,
} from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import {
  fetchAccounts,
  fetchApplications,
  fetchProfile,
} from "frontend/integration/identity-manager"

import { connectorCache } from "../cache"
import {
  ITransferConfig,
  ITransferFTRequest,
  ITransferModalConnector,
  ITransferNFTRequest,
  ITransferResponse,
  TokenFee,
} from "./types"

export abstract class TransferModalConnector<T extends ITransferConfig>
  implements ITransferModalConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  getTokenConfig(currency?: string): any {
    return this.config
  }

  getTokenCurrencies(): Promise<string[]> {
    return Promise.resolve([this.config.tokenStandard])
  }

  getNetworkOption(): IGroupOption {
    return {
      title: this.config.blockchain,
      icon: this.config.icon,
      value: `${this.config.tokenStandard}&${this.config.blockchain}`,
    }
  }

  getTokensOptions(): Promise<IGroupedOptions> {
    return Promise.resolve({
      label: this.config.blockchain,
      options: [
        {
          icon: this.config.icon,
          title: this.config.tokenStandard,
          value: this.config.tokenStandard + "&" + this.config.blockchain,
          subTitle: this.config.tokenStandard,
        },
      ],
    })
  }

  getTokenStandard(): TokenStandards {
    return this.config.tokenStandard
  }

  shouldHavePrincipal(): boolean {
    return !!this.config?.shouldHavePrincipal
  }

  abstract getFee(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<TokenFee>
  abstract transfer(
    request: ITransferFTRequest | ITransferNFTRequest,
  ): Promise<ITransferResponse>
  abstract getAccountsOptions({
    currency,
    isVault,
  }: {
    currency?: string
    isVault?: boolean
  }): Promise<IGroupedOptions[]>
  abstract validateAddress(address: string): string | boolean

  protected async getAllPrincipals<T extends boolean>(
    groupedById: T,
  ): Promise<
    T extends true ? Record<string, PrincipalAccount[]> : PrincipalAccount[]
  > {
    const profile = await this.getProfile()
    const accounts = await this.getAccounts(true)

    const principals = await fetchPrincipals(
      BigInt(profile.anchor),
      accounts,
      profile.wallet === RootWallet.NFID,
    )
    if (!groupedById) return principals as any

    return principals.reduce(
      (
        groupedAccounts: Record<string, PrincipalAccount[]>,
        principal: PrincipalAccount,
      ) => {
        !!groupedAccounts[principal.account.domain]
          ? groupedAccounts[principal.account.domain].push(principal)
          : (groupedAccounts[principal.account.domain] = [principal])

        return groupedAccounts
      },
      {},
    ) as any
  }

  @Cache(connectorCache, { ttl: 120 })
  protected async getProfile(): Promise<Profile> {
    return await fetchProfile()
  }

  @Cache(connectorCache, { ttl: 120 })
  protected async getAccounts(
    extendWithFixedAccounts: boolean = false,
  ): Promise<Account[]> {
    const accounts = await fetchAccounts()
    if (!extendWithFixedAccounts) return accounts

    const applications = await this.getApplications()
    const fixedAccounts = applications
      .filter((app) => app.isNftStorage)
      .map(applicationToAccount)

    return fixedAccounts.reduce((acc, account) => {
      const accountAlreadyAdded = acc.find(
        (a) => a.domain === account.domain && a.accountId === account.accountId,
      )
      if (accountAlreadyAdded) {
        return acc
      }
      return [...acc, account]
    }, accounts)
  }

  @Cache(connectorCache, { ttl: 180 })
  protected async getApplications(): Promise<Application[]> {
    return await fetchApplications()
  }

  @Cache(connectorCache, { ttl: 60 })
  async getRate(currency: string): Promise<string> {
    return (
      (await new PriceService().getPrice([currency])).find((t) => t.token === currency)?.price ??
      "0"
    )
  }

  async getIdentity(
    domain = "nfid.one",
    accountId = "0",
    targetCanisters: string[],
  ): Promise<DelegationIdentity> {
    return getWalletDelegationAdapter(domain, accountId, targetCanisters)
  }
}
