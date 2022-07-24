import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

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
    maxTimeToLive: event.data.maxTimeToLive,
    sessionPublicKey: event.data.sessionPublicKey,
    hostname: event.origin,
  }))
  postMessageToClient({ kind: "authorize-ready" })
  return response
}

/**
 * xstate service posting third party auth session to the client via window message channel
 * @param context
 * @param event
 * @returns
 */
export async function postDelegation(
  context: { authRequest?: { hostname: string } },
  event: { data: ThirdPartyAuthSession },
) {
  console.debug(postDelegation.name, { context, event })
  if (!context.authRequest?.hostname)
    throw new Error("postDelegation context.authRequest.hostname missing")

  postMessageToClient(
    {
      kind: "authorize-client-success",
      delegations: event.data.delegations.map(prepareClientDelegate),
      userPublicKey: event.data.userPublicKey,
    },
    context.authRequest.hostname,
  )
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
