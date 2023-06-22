import { logAuthorizeApplication } from "frontend/features/stats/services"
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
import { fetchApplication } from "../identity-manager"
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
export async function postDelegation(context: {
  authRequest?: { hostname: string }
  thirdPartyAuthoSession?: ThirdPartyAuthSession
  appMeta?: AuthorizingAppMeta
}) {
  console.debug("postDelegation")
  if (!context.authRequest?.hostname)
    throw new Error("postDelegation context.authRequest.hostname missing")
  if (!context.thirdPartyAuthoSession)
    throw new Error("postDelegation context.thirdPartyAuthoSession missing")
  if (!context.appMeta)
    throw new Error("postDelegation context.appMeta missing")

  const delegations = [
    prepareClientDelegate(context.thirdPartyAuthoSession.signedDelegation),
  ]
  const userPublicKey = context.thirdPartyAuthoSession.userPublicKey

  logAuthorizeApplication({
    scope: context.thirdPartyAuthoSession.scope,
    anchor: context.thirdPartyAuthoSession.anchor,
    applicationName: context.appMeta.name,
    chain: "Internet Computer",
  })

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
  const meta = getAppMetaFromQuery()

  return {
    ...meta,
    url: document.referrer,
  }
}

export async function checkIsIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

type CheckIsIframeAllowedParams = {
  authRequest?: {
    hostname: string
    derivationOrigin?: string
  }
}

export async function checkIsIframeAllowed({
  authRequest: { hostname, derivationOrigin } = {
    hostname: "",
  },
}: CheckIsIframeAllowedParams) {
  console.debug("checkIsIframeAllowed", { hostname, derivationOrigin })
  if (!hostname)
    throw new Error("checkIsIframeAllowed hostname cannot be empty")

  const { isIFrameAllowed, domain } = await fetchApplication(
    derivationOrigin || hostname,
  )
  console.debug("checkIsIframeAllowed", { isIFrameAllowed, domain })
  return isIFrameAllowed
}
