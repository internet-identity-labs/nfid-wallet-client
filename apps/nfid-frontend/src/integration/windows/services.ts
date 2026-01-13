import { prepareClientDelegate } from "@nfid/integration"

import { AuthenticationContext } from "frontend/features/authentication/root/root-machine"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { validateDerivationOrigin } from "../internet-identity/validateDerivationOrigin"

import {
  awaitClientMessage,
  getAppMetaFromQuery,
  isIdentityClientAuthEvent,
  postMessageToClient,
} from "."

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
    500,
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
  postMessageToClient({ kind: "authorize-ready" })
  return response
}

/**
 * xstate service posting third party auth session to the client via window message channel
 * @param context
 * @param event
 * @returns
 */
export async function postDelegation(context: AuthenticationContext) {
  console.debug("postDelegation")
  if (!context.authRequest?.hostname)
    throw new Error("postDelegation context.authRequest.hostname missing")
  if (!context.thirdPartyAuthSession)
    throw new Error("postDelegation context.thirdPartyAuthSession missing")
  if (!context.thirdPartyAuthSession.authSession)
    throw new Error(
      "postDelegation context.thirdPartyAuthSession.authSession missing",
    )
  if (!context.appMeta)
    throw new Error("postDelegation context.appMeta missing")

  const delegations = [
    prepareClientDelegate(
      context.thirdPartyAuthSession.authSession.signedDelegation,
    ),
  ]
  const userPublicKey = context.thirdPartyAuthSession.authSession.userPublicKey

  postMessageToClient(
    {
      kind: "authorize-client-success",
      delegations,
      userPublicKey,
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
  return getAppMetaFromQuery()
}
