import { DelegationIdentity } from "@dfinity/identity"

import { EXPECTED_CACHE_VERSION } from "@nfid/integration"

import { im, replaceActorIdentity } from "../actors"
import { getPublicKey } from "../delegation-factory/delegation-i"
import { RootWallet } from "../identity-manager/profile"
import { hasOwnProperty } from "../test-utils"

export type UserIdData = {
  //internal user id
  userId: string
  //public key of the user
  publicKey: string
  anchor: bigint
  wallet: RootWallet
  email?: string
  name?: string
  cacheVersion: string
}

type SerializedUserIdData = Omit<UserIdData, "anchor"> & {
  anchor: number
}

export function serializeUserIdData(userIdData: UserIdData) {
  return JSON.stringify({
    ...userIdData,
    anchor: Number(userIdData.anchor.toString()),
    cacheVersion: EXPECTED_CACHE_VERSION,
  })
}

export function deserializeUserIdData(userIdData: string): UserIdData {
  const parsed = JSON.parse(userIdData) as SerializedUserIdData
  return { ...parsed, anchor: BigInt(parsed.anchor) }
}

export async function createUserIdData(
  delegationIdentity: DelegationIdentity,
): Promise<UserIdData> {
  await replaceActorIdentity(im, delegationIdentity)
  const [publicKey, account] = await Promise.all([
    getPublicKey(delegationIdentity),
    im.get_account(),
  ])
  const rootWallet: RootWallet = hasOwnProperty(account.data[0]!.wallet, "II")
    ? RootWallet.II
    : RootWallet.NFID

  return {
    userId: account.data[0]!.principal_id,
    publicKey,
    anchor: account.data[0]!.anchor,
    wallet: rootWallet,
    name:
      account.data[0]!.name.length !== 0 ? account.data[0]!.name[0] : undefined,
    email:
      account.data[0]!.email.length !== 0
        ? account.data[0]!.email[0]
        : undefined,
    cacheVersion: EXPECTED_CACHE_VERSION,
  }
}
