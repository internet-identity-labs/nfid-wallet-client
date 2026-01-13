import { DelegationIdentity } from "@dfinity/identity"

import { LocalDeviceAuthSession } from "frontend/state/authentication"

import { identityFromDeviceList } from "../identity"

import { II_DEVICES_DATA, NFID_SIGNED_DELEGATION } from "./__mocks"

import { getDelegationFromJson, mapDeviceData } from "."

export async function registerServiceResponseMock(): Promise<LocalDeviceAuthSession> {
  const [chain, sessionKey] = getDelegationFromJson(
    JSON.stringify(NFID_SIGNED_DELEGATION.chain),
    JSON.stringify(NFID_SIGNED_DELEGATION.sessionKey),
  )

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )
  const identity = identityFromDeviceList(II_DEVICES_DATA.map(mapDeviceData))
  return {
    anchor: 10001,
    identity,
    delegationIdentity,
    sessionSource: "localDevice",
  }
}
