import { Principal } from "@dfinity/principal"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii } from "frontend/integration/actors"
import {
  Account,
  Application,
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
): Promise<Map<string, Principal[]>> {
  let principalsByDomain = new Map<string, Principal[]>()
  let userData = personas.map((persona) => [persona.domain, persona.accountId])
  let additionalDomains = applications
    .filter((l) => l.isNftStorage)
    .map((l) => [l.domain, "0"])

  for (const [domain, accountId] of userData.concat(additionalDomains)) {
    let principal = await ii.get_principal(
      userNumber,
      getScope(domain, accountId),
    )
    if (principalsByDomain.has(domain)) {
      principalsByDomain.get(domain)!.push(principal)
    } else {
      principalsByDomain.set(domain, [principal])
    }
  }
  return principalsByDomain
}
