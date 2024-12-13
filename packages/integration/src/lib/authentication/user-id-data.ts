import { DelegationIdentity } from "@dfinity/identity"

import {
  AccessPoint,
  DeviceType,
  EXPECTED_CACHE_VERSION,
  Icon,
} from "@nfid/integration"

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
    publicKey: publicKey,
    anchor: account.data[0]!.anchor,
    wallet: rootWallet,
    email:
      account.data[0]!.email.length !== 0
        ? account.data[0]!.email[0]
        : undefined,
    accessPoints: account.data[0]!.access_points.map((accessPoint) => {
      return {
        deviceType: deviceTypeToDevice(accessPoint.device_type),
        icon: accessPoint.icon as Icon,
        device: accessPoint.device,
        browser: accessPoint.browser,
        lastUsed: Number(accessPoint.last_used),
        principalId: accessPoint.principal_id,
        credentialId: accessPoint.credential_id
          ? accessPoint.credential_id[0]
          : undefined,
      }
    }),
    cacheVersion: EXPECTED_CACHE_VERSION,
  }
}

export function deviceTypeToDevice(response: any): DeviceType {
  if (hasOwnProperty(response, "Email")) {
    return DeviceType.Email
  }
  if (hasOwnProperty(response, "Passkey")) {
    return DeviceType.Passkey
  }
  if (hasOwnProperty(response, "Unknown")) {
    return DeviceType.Unknown
  }
  if (hasOwnProperty(response, "Recovery")) {
    return DeviceType.Recovery
  }
  throw Error("Unexpected enum value")
}
