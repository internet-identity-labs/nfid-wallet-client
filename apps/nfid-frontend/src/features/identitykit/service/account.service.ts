import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import {
  DelegationType,
  getPublicKey,
} from "packages/integration/src/lib/delegation-factory/delegation-i"

import { truncateString } from "@nfid-frontend/utils"
import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { authState, getBalance, hasOwnProperty, im } from "@nfid/integration"

import { getLegacyThirdPartyAuthSession } from "frontend/features/authentication/services"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"

import { isDerivationBug } from "../helpers/derivation-bug"
import { Account, AccountType } from "../type"

export const INDEX_DB_CONNECTED_ACCOUNTS_KEY = (origin: string) =>
  `${origin}-connectedAccounts`

export const accountService = {
  async getAccounts(
    origin: string,
    derivationOrigin?: string,
  ): Promise<{ public: Account; anonymous: Account[] }> {
    const publicProfile = this.getPublicProfile()
    let anonymousProfiles: Account[] = []

    const account = await im.get_account()

    if (hasOwnProperty(account.data[0]!.wallet, "II")) {
      const legacyProfiles = await this.getLegacyAnonymousProfiles(
        origin,
        derivationOrigin,
      )
      anonymousProfiles.push(...legacyProfiles)
    }

    const anonymousProfile = await this.getAnonymousProfiles(
      origin,
      derivationOrigin,
    )
    anonymousProfiles.push(...anonymousProfile)

    return {
      public: await publicProfile,
      anonymous: anonymousProfiles,
    }
  },
  async getPublicProfile(): Promise<Account> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("No identity")

    const publicKey = await getPublicKey(identity)
    const publicAccAddress = AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(publicKey),
    }).toHex()

    const publicAccBalance = Number(await getBalance(publicAccAddress))

    return {
      id: 0,
      displayName: truncateString(publicKey, 6, 4),
      principal: publicKey,
      subaccount: this.getDefaultSubAccount(),
      type: AccountType.GLOBAL,
      balance: publicAccBalance,
      origin,
    }
  },

  async getLegacyAnonymousProfiles(
    origin: string,
    derivationOrigin?: string,
  ): Promise<Account[]> {
    const accounts = await fetchAccountsService({
      authRequest: { hostname: origin, derivationOrigin },
    })

    const delegations = await Promise.all(
      accounts.map((acc) => {
        return getLegacyThirdPartyAuthSession(
          {
            hostname: origin,
            derivationOrigin,
            sessionPublicKey: new Uint8Array(),
            maxTimeToLive: BigInt(WALLET_SESSION_TTL_1_MIN_IN_MS),
          },
          acc.accountId,
        )
      }),
    )

    return delegations.map((acc, index) => ({
      id: index,
      displayName: `Use application-specific address ${
        delegations.length > 1 ? index + 1 : ""
      }`,
      principal: Principal.fromUint8Array(acc.userPublicKey).toText(),
      subaccount: this.getDefaultSubAccount(),
      type: AccountType.ANONYMOUS_LEGACY,
      origin,
      derivationOrigin,
    }))
  },

  async getAnonymousProfiles(
    origin: string,
    derivationOrigin?: string,
  ): Promise<Account[]> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("No identity")

    const anonymousPublicKey = await getPublicKey(
      identity,
      derivationOrigin ?? origin,
      DelegationType.ANONYMOUS,
    )

    let accounts = [
      {
        id: 0,
        displayName: `Use application-specific address`,
        principal: anonymousPublicKey,
        subaccount: this.getDefaultSubAccount(),
        type: AccountType.SESSION,
        balance: undefined,
        origin,
        derivationOrigin,
      },
    ]

    if (derivationOrigin && (await isDerivationBug(origin))) {
      const buggedPublicKey = await getPublicKey(
        identity,
        origin,
        DelegationType.ANONYMOUS,
      )

      accounts.push({
        id: 1,
        displayName: `Use application-specific address`,
        principal: buggedPublicKey,
        subaccount: this.getDefaultSubAccount(),
        type: AccountType.SESSION_WITHOUT_DERIVATION,
        balance: undefined,
        origin,
        derivationOrigin,
      })
    }

    if (accounts.length > 1) {
      accounts = accounts.map((acc, index) => ({
        ...acc,
        displayName: `${acc.displayName} ${index + 1}`,
      }))
    }

    return accounts
  },
  getDefaultSubAccount(): string {
    return Buffer.from(SubAccount.fromID(0).toUint8Array()).toString("base64")
  },
}
