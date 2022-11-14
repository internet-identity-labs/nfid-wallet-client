import { Principal } from "@dfinity/principal"
import { ii } from "@nfid/integration"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
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

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

// TOOD: write tests
export async function fetchPrincipals(
  userNumber: UserNumber,
  accounts: Account[],
  applications: Application[],
): Promise<PrincipalAccount[]> {
  // Accounts which have been created with external IDPs
  // e.g.: nns.ic0.app, www.stoicwallet.com
  // FIXME: determining additional accounts seems to be a different concern
  const fixedAccounts = applications
    .filter((app) => app.isNftStorage)
    .map(applicationToAccount)

  const allAccounts = [...accounts, ...fixedAccounts]

  return await Promise.all(
    allAccounts.map(async (account) => {
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
