import { Principal } from "@dfinity/principal"

import {
  DeviceKey,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity_types"
import { ii } from "frontend/integration/actors"
import {
  Account,
  fetchApplications,
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
): Promise<Map<string, Principal[]>> {
  let principalsByDomain = new Map<string, Principal[]>()
  let userData = personas.map((persona) => [persona.domain, persona.accountId])
  let additionalDomains = (await fetchApplications())
    .filter((l) => l.isNftStorage === true)
    .map((l) => [l.domain, "0"])

  for (const domainData of userData.concat(additionalDomains)) {
    let principal = await ii.get_principal(
      userNumber,
      getScope(domainData[0], domainData[1]),
    )
    if (principalsByDomain.has(domainData[0])) {
      principalsByDomain.get(domainData[0])!.push(principal)
    } else {
      principalsByDomain.set(domainData[0], [principal])
    }
  }
  return principalsByDomain
}
