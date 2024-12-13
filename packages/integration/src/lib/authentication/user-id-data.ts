import { DelegationIdentity } from "@dfinity/identity"
import { fetchProfile } from "src/integration/identity-manager"

import {AccessPoint, EXPECTED_CACHE_VERSION} from "@nfid/integration"

import { im, replaceActorIdentity } from "../actors"
import { getPublicKey } from "../delegation-factory/delegation-i"
import { RootWallet } from "../identity-manager/profile"

export type UserIdData = {
  //internal user id
  userId: string
  //public key of the user
  publicKey: string
  anchor: bigint
  wallet: RootWallet
  email?: string
  accessPoints: AccessPoint[]
  cacheVersion: string
}

type SerializedUserIdData = Omit<UserIdData, "anchor"> & {
  anchor: number
}

export function serializeUserIdData(userIdData: UserIdData) {
  return JSON.stringify({
    ...userIdData,
    anchor: Number(userIdData.anchor.toString()),
    cacheVersion: EXPECTED_CACHE_VERSION
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
    fetchProfile(),
  ])

  return {
    userId: account.principalId,
    publicKey: publicKey,
    anchor: BigInt(account.anchor),
    wallet: account.wallet,
    email: account.email,
    accessPoints: account.accessPoints,
    cacheVersion: EXPECTED_CACHE_VERSION
  }
}
