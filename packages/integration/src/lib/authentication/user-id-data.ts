import { DelegationIdentity } from "@dfinity/identity"

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
}

type SerializedUserIdData = Omit<UserIdData, "anchor"> & {
  anchor: number
}

export function serializeUserIdData(userIdData: UserIdData) {
  return JSON.stringify({
    ...userIdData,
    anchor: Number(userIdData.anchor.toString()),
  })
}

export function deserializeUserIdData(userIdData: string) {
  const parsed = JSON.parse(userIdData) as SerializedUserIdData
  return { ...parsed, anchor: BigInt(parsed.anchor) }
}

export async function createUserIdData(delegationIdentity: DelegationIdentity) {
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
    publicKey: publicKey,
    anchor: account.data[0]!.anchor,
    wallet: rootWallet,
  }
}
