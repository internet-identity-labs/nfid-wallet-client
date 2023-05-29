import { DelegationIdentity } from "@dfinity/identity"
import { applicationToAccount } from "packages/integration/src/lib/identity-manager/application/application-to-account"

import { IGroupOption, IGroupedOptions } from "@nfid-frontend/ui"
import {
  Account,
  Application,
  PrincipalAccount,
  Profile,
  fetchPrincipals,
  loadProfileFromLocalStorage,
} from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import {
  fetchAccounts,
  fetchApplications,
  fetchProfile,
} from "frontend/integration/identity-manager"

import {
  ITransferConfig,
  ITransferFTRequest,
  ITransferModalConnector,
  ITransferNFTRequest,
  ITransferResponse,
  TokenFee,
} from "./types"
import { connectorCache } from "../cache"
import { Cache } from "node-ts-cache"

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
      title: "title" in this.config ? String(this.config.title) : "",
      icon: this.config.icon,
      value: this.config.tokenStandard,
    }
  }

  @Cache(connectorCache, {ttl: 600})
  getTokensOptions(): Promise<IGroupedOptions> {
    return Promise.resolve({
      label: this.config.blockchain,
      options: [
        {
          icon: this.config.icon,
          title: this.config.tokenStandard,
          value: this.config.tokenStandard,
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
  abstract getAccountsOptions(
    currency?: string | undefined,
  ): Promise<IGroupedOptions[]>
  abstract validateAddress(address: string): string | boolean

  @Cache(connectorCache, {ttl: 60})
  protected async getAllPrincipals<T extends boolean>(
    groupedById: T,
  ): Promise<
    T extends true ? Record<string, PrincipalAccount[]> : PrincipalAccount[]
  > {
    const profile = await this.getProfile()
    const accounts = await this.getAccounts(true)

    const principals = await fetchPrincipals(BigInt(profile.anchor), accounts)
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

  @Cache(connectorCache, {ttl: 120})
  protected async getProfile(): Promise<Profile> {
    return loadProfileFromLocalStorage() ?? (await fetchProfile())
  }

  @Cache(connectorCache, {ttl: 120})
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

  @Cache(connectorCache, {ttl: 180})
  protected async getApplications(): Promise<Application[]> {
    return await fetchApplications()
  }

  async getIdentity(
    domain = "nfid.one",
    accountId = "0",
  ): Promise<DelegationIdentity> {
    const profile = await this.getProfile()
    return await getWalletDelegation(profile.anchor, domain, accountId)
  }
}
