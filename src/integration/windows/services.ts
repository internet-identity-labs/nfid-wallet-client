import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"
import { IDPMachineContext } from "frontend/state/machines/authorization/idp"

import {
  awaitMessageFromClient,
  getAppMetaFromQuery,
  IdentityClientAuthEvent,
  postMessageToClient,
  prepareClientDelegate,
} from "."

/**
 * xstate service initiating the idp flow via window message channel with the client
 * @returns authorization request
 */
export async function handshake(): Promise<AuthorizationRequest> {
  const response = awaitMessageFromClient<IdentityClientAuthEvent>(
    "authorize-client",
  ).then((event) => ({
    maxTimeToLive: Number(event.data.maxTimeToLive),
    sessionPublicKey: event.data.sessionPublicKey,
    hostname: event.origin,
  }))
  postMessageToClient({ kind: "authorize-ready" })
  return response
}

/**
 * xstate service posting third party auth session to the client via window message channel
 * @param context
 * @returns
 */
export async function postDelegation(
  context: unknown,
  event: { data: ThirdPartyAuthSession },
) {
  postMessageToClient({
    kind: "authorize-client-success",
    delegations: event.data.delegations.map(prepareClientDelegate),
    userPublicKey: event.data.userPublicKey,
  })
  window.close()
  return undefined
}

/**
 * xstate service retrieving connecting application meta data
 */
export async function getAppMeta(): Promise<AuthorizingAppMeta> {
  const meta = getAppMetaFromQuery()
  return meta
}
