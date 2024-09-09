import { DelegationIdentity } from "@dfinity/identity"
import { Cache } from "node-ts-cache"
import { Activity } from "packages/integration/src/lib/asset/types"
import { applicationToAccount } from "packages/integration/src/lib/identity-manager/application/application-to-account"

import {
  Account,
  Application,
  PrincipalAccount,
  Profile,
  authState,
  fetchPrincipals, Chain,
} from "@nfid/integration"

import {
  fetchAccounts,
  fetchApplications,
  fetchProfile,
} from "frontend/integration/identity-manager"
import { connectorCache } from "frontend/ui/connnector/cache"
import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow } from "../types"
import { IActivityConfig, IActivityConnector } from "./activity-connector-types"

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
    activities: Activity[],
    config: IActivityConfig,
  ): IActivityRow[] {
    return activities.map((activity: Activity) => ({
      id: activity.id,
      action: activity.action,
      network: config.network,
      chain: Chain.IC,
      asset: activity.asset,
      type: activity.asset.type,
      timestamp: activity.date,
      from: activity.from,
      to: activity.to,
    }))
  }

  async getActivitiesRows(
    filteredContracts: string[] = [],
  ): Promise<IActivityRow[]> {
    const activities = await this.getActivities(filteredContracts)
    const activitiesRows = this.mapActivitiesToRows(activities, this.config)

    return activitiesRows
  }

  @Cache(connectorCache, { ttl: 3600 })
  protected async getAllPrincipals<T extends boolean>(
    groupedById: T,
  ): Promise<
    T extends true ? Record<string, PrincipalAccount[]> : PrincipalAccount[]
  > {
    const principals = await fetchPrincipals()
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
    return await fetchProfile()
  }

  @Cache(connectorCache, { ttl: 3600 })
  protected async getAccounts(
    extendWithFixedAccounts: boolean = false,
  ): Promise<Account[]> {
    const accounts = await fetchAccounts()
    if (!extendWithFixedAccounts) return accounts

    const applications = await this.getApplications()
    const fixedAccounts = applications.map(applicationToAccount)

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

  abstract getActivities(filteredContracts: string[]): Promise<Activity[]>
}
