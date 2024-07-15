import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import {
  Chain,
  DelegationType,
  GLOBAL_ORIGIN,
  getPublicKey,
} from "packages/integration/src/lib/lambda/ecdsa"

import { truncateString } from "@nfid-frontend/utils"
import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { authState, getBalance } from "@nfid/integration"

import { getLegacyThirdPartyAuthSession } from "frontend/features/authentication/services"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"

import { Account, AccountType } from "../type"

export type ProfileTypes =
  | ""
  | "public"
  | "legacy-anonymous"
  | "anonymous-1"
  | "anonymous-2"

export const accountService = {
  async getAccounts(
    origin: string,
  ): Promise<{ public: Account; anonymous: Account[] }> {
    const publicProfile = this.getPublicProfile()
    let anonymousProfiles: Account[] = []

    const legacyProfiles = await this.getLegacyAnonymousProfiles(origin)
    anonymousProfiles.push(...legacyProfiles)

    if (!legacyProfiles.length) {
      const anonymousProfile = await this.getAnonymousProfiles(origin)
      anonymousProfiles.push(anonymousProfile)
    }

    return {
      public: await publicProfile,
      anonymous: anonymousProfiles,
    }
  },
  async getPublicProfile(): Promise<Account> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("No identity")

    const publicKey = await getPublicKey(identity, Chain.IC, GLOBAL_ORIGIN)
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
    }
  },
  async getLegacyAnonymousProfiles(origin: string): Promise<Account[]> {
    const accounts = await fetchAccountsService({
      authRequest: { hostname: origin },
    })

    const delegations = await Promise.all(
      accounts.map((acc) => {
        return getLegacyThirdPartyAuthSession(
          {
            hostname: origin,
            sessionPublicKey: new Uint8Array(),
            maxTimeToLive: BigInt(WALLET_SESSION_TTL_1_MIN_IN_MS),
          },
          acc.accountId,
        )
      }),
    )

    return delegations.map((acc, index) => ({
      id: index,
      displayName: `Anonymous profile ${index + 1}`,
      principal: Principal.fromUint8Array(acc.userPublicKey).toText(),
      subaccount: this.getDefaultSubAccount(),
      type: AccountType.SESSION,
    }))
  },
  async getAnonymousProfiles(origin: string): Promise<Account> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("No identity")

    const publicKey = await getPublicKey(
      identity,
      Chain.IC,
      origin,
      DelegationType.ANONYMOUS,
    )

    return {
      id: 0,
      displayName: truncateString(publicKey, 6, 4),
      principal: publicKey,
      subaccount: this.getDefaultSubAccount(),
      type: AccountType.SESSION,
      balance: undefined,
    }
  },
  getDefaultSubAccount(): string {
    return Buffer.from(SubAccount.fromID(0).toUint8Array()).toString("base64")
  },
}
