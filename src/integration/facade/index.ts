import { Principal } from "@dfinity/principal"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii } from "frontend/integration/actors"
import {
  Account,
  Application,
  applicationToAccount,
  removeAccessPoint,
} from "frontend/integration/identity-manager"
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

export async function fetchPrincipals(
  userNumber: UserNumber,
  personas: Account[],
  applications: Application[],
): Promise<{ principal: Principal; account: Account }[]> {
  const fixedAccounts = applications
    .filter((app) => app.isNftStorage)
    .map(applicationToAccount)
  const accounts = [...personas, ...fixedAccounts]

  return Promise.all(
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
