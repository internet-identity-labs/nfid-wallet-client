import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

import {
  awaitClientMessage,
  getAppMetaFromQuery,
  isIdentityClientAuthEvent,
  postMessageToClient,
  prepareClientDelegate,
} from "."
import { validateDerivationOrigin } from "../internet-identity/validateDerivationOrigin"

/**
 * xstate service initiating the idp flow via window message channel with the client
 * @returns authorization request
 */
export async function handshake(): Promise<AuthorizationRequest> {
  // FIXME: for the iframe mode to work, we need to send the message
  // to the parent window after we've called the `authClient.login()`.
  // Having this interval is the easiest work around for now.
  const interval = setInterval(
    () => postMessageToClient({ kind: "authorize-ready" }),
    1000,
  )

  const response = awaitClientMessage(isIdentityClientAuthEvent).then(
    async (event) => {
      console.debug("handshake", { event })
      const validation = await validateDerivationOrigin(
        event.origin,
        event.data.derivationOrigin,
      )
      console.debug("handshake", {
        validation,
        derivationOrigin: event.data.derivationOrigin,
      })
      if (validation.result !== "valid") throw new Error(validation.message)
      clearInterval(interval)
      return {
        maxTimeToLive: event.data.maxTimeToLive,
        sessionPublicKey: event.data.sessionPublicKey,
        derivationOrigin: event.data.derivationOrigin,
        hostname: event.origin,
      }
    },
  )
  return response
}

/**
 * xstate service posting third party auth session to the client via window message channel
 * @param context
 * @param event
 * @returns
 */
export async function postDelegation(context: {
  authRequest?: { hostname: string }
  thirdPartyAuthoSession?: ThirdPartyAuthSession
}) {
  console.debug("postDelegation")
  if (!context.authRequest?.hostname)
    throw new Error("postDelegation context.authRequest.hostname missing")
  if (!context.thirdPartyAuthoSession) {
    throw new Error("Missing third party auth session")
  }

  postMessageToClient(
    {
      kind: "authorize-client-success",
      delegations: [
        prepareClientDelegate(context.thirdPartyAuthoSession.signedDelegation),
      ],
      userPublicKey: context.thirdPartyAuthoSession.userPublicKey,
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
