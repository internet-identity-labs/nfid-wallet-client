import { Principal } from "@dfinity/principal"

import { Account, ii } from "@nfid/integration"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import { getScope } from "frontend/integration/identity-manager/persona/utils"
import {
  removeDevice,
  removeRecoveryDeviceII,
} from "frontend/integration/internet-identity"

export async function removeRecoveryDeviceFacade(
  userNumber: UserNumber,
  seedPhrase: string,
): Promise<void> {
  let pubKey = await removeRecoveryDeviceII(userNumber, seedPhrase)
  await removeAccessPoint(pubKey)
}

export async function removeAccessPointFacade(
  userNumber: UserNumber,
  pubKey: DeviceKey,
): Promise<void> {
  await removeDevice(userNumber, pubKey)
  await removeAccessPoint(pubKey)
}

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(
  userNumber: UserNumber,
  accounts: Account[],
): Promise<PrincipalAccount[]> {
  return await Promise.all(
    accounts.map(async (account) => {
      return {
        principal: await ii.get_principal(
          userNumber,
          getScope(account.domain, account.accountId),
        ),
        account,
      }
    }),
  )
}
