import { IDPMachineContext } from "frontend/state/authorization/idp"

import {
  awaitMessageFromClient,
  IdentityClientAuthEvent,
  postMessageToClient,
  prepareClientDelegate,
} from "."

export async function handshake() {
  const response = awaitMessageFromClient<IdentityClientAuthEvent>(
    "authorize-client",
  ).then((event) => ({
    maxTimeToLive: Number(event.data.maxTimeToLive),
    sessionPublicKey: event.data.sessionPublicKey,
    hostname: event.origin,
  }))
  postMessageToClient({ kind: "authorize-ready" })
  response.then(console.log)
  return response
}

export async function postDelegation(context: IDPMachineContext) {
  if (!context.iiResponse) {
    throw new Error("Missing ii response")
  }
  postMessageToClient({
    kind: "authorize-client-success",
    delegations: prepareClientDelegate(context.iiResponse.signedDelegate),
    userPublicKey: context.iiResponse.userKey,
  })
  window.close()
  return undefined
}
