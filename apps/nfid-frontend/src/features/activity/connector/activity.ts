import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import { applicationToAccount } from "packages/integration/src/lib/identity-manager/application/application-to-account"

import { truncateString } from "@nfid-frontend/utils"
import {
  Account,
  Application,
  PrincipalAccount,
  Profile,
  RootWallet,
  authState,
  fetchPrincipals,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import {
  fetchAccounts,
  fetchApplications,
  fetchProfile,
} from "frontend/integration/identity-manager"
import { connectorCache } from "frontend/ui/connnector/cache"
import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow, IActivityRowGroup } from "../types"
import { groupActivityRowsByDate } from "../util/row"
import {
  IActivity,
  IActivityConfig,
  IActivityConnector,
} from "./activity-connector-types"

export abstract class ActivityClass<T extends IActivityConfig>
  implements IActivityConnector
{
  public config: T

  constructor(config: T) {
    this.config = config
  }

  getTokenConfig(): T {
    return this.config
  }

  getBlockchain(): Blockchain {
    return this.config.network
  }

  getIdentity(): DelegationIdentity {
    return authState.get().delegationIdentity as DelegationIdentity
  }

  mapActivitiesToRows(
    activities: IActivity[],
    config: IActivityConfig,
  ): IActivityRow[] {
    return activities.map((activity: IActivity) => ({
      action: activity.action,
      chain: config.chain,
      asset: {
        type: "ft",
        amount: activity.asset.amount,
        amountUSD: activity.asset.amountUSD,
        currency: activity.asset.currency,
      },
      type: activity.asset.type,
      timestamp: activity.date,
      from: truncateString(activity.from, 6, 4),
      to: truncateString(activity.to, 6, 4),
    }))
  }

  @Cache(connectorCache, { ttl: 120 })
  async getGroupedActivitiesRows(): Promise<IActivityRowGroup[]> {
    const activities = await this.getActivities()
    const activitiesRows = this.mapActivitiesToRows(activities, this.config)

    return groupActivityRowsByDate(activitiesRows)
  }

  @Cache(connectorCache, { ttl: 3600 })
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

  @Cache(connectorCache, { ttl: 3600 })
  protected async getProfile(): Promise<Profile> {
    return loadProfileFromLocalStorage() ?? (await fetchProfile())
  }

  @Cache(connectorCache, { ttl: 3600 })
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

  abstract getActivities(): Promise<IActivity[]>
}
