import { SubAccount } from "@dfinity/ledger-icp"

import { truncateString } from "@nfid-frontend/utils"

import { fetchProfile } from "frontend/integration/identity-manager"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"

import { getPublicProfile } from "../../authentication/3rd-party/choose-account/services"
import { Account, AccountType } from "../type"

const HOT_FIX_V24_1_WRONG_HOSTNAMES = [
  "https://playground-dev.nfid.one",
  "https://dscvr.one",
  "https://hotornot.wtf",
  "https://awcae-maaaa-aaaam-abmyq-cai.icp0.io", // BOOM DAO
  "https://7p3gx-jaaaa-aaaal-acbda-cai.raw.ic0.app", // BOOM DAO
  "https://scifi.scinet.one",
  "https://oc.app",
  "https://signalsicp.com",
  "https://n7z64-2yaaa-aaaam-abnsa-cai.icp0.io", // BOOM DAO
  "https://nuance.xyz",
  "https://h3cjw-syaaa-aaaam-qbbia-cai.ic0.app", // The Asset App
  "https://trax.so",
  "https://jmorc-qiaaa-aaaam-aaeda-cai.ic0.app", // Unfold VR
  "https://65t4u-siaaa-aaaal-qbx4q-cai.ic0.app", // my-icp-app
]

const HOT_FIX_V24_2_WRONG_ANCHORS = 100009230
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
    const [publicAccount, legacyAnonymousAccounts, profile] = await Promise.all(
      [
        getPublicProfile(),
        fetchAccountsService({
          authRequest: { hostname: origin },
        }),
        fetchProfile(),
      ],
    )

    const isDerivationBug =
      HOT_FIX_V24_1_WRONG_HOSTNAMES.includes(origin) &&
      profile.anchor < HOT_FIX_V24_2_WRONG_ANCHORS

    // Temporary solution to avoid generating delegations with sessionPublicKeys
    // We need to keep correct quantity. But anonymous options will be disabled.
    const anonymousLength =
      legacyAnonymousAccounts.length > 0
        ? legacyAnonymousAccounts.length
        : 1 + (isDerivationBug ? 1 : 0)

    const formattedOrigin = new URL(origin).host
    const subAccount = Buffer.from(
      SubAccount.fromID(0).toUint8Array(),
    ).toString("base64")

    return {
      public: {
        id: 0,
        displayName: truncateString(publicAccount.principal, 6, 4),
        principal: publicAccount.principal,
        subaccount: subAccount,
        type: AccountType.GLOBAL,
        balance: Number(publicAccount.balance),
      },
      anonymous: Array(anonymousLength)
        .fill(null)
        .map((_, index) => ({
          id: index,
          displayName: `Anonymous ${formattedOrigin} profile ${
            anonymousLength > 1 ? index + 1 : ""
          }`,
          principal: "",
          subaccount: subAccount,
          type: AccountType.SESSION,
        })),
    }
  },
}
