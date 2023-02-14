import { principalToAddress } from "ictool"

import { checkIsIframe } from "@nfid-frontend/utils"

import { fetchPrincipal } from "frontend/integration/internet-identity"
import { storeSignIn } from "frontend/integration/lambda/auth-stats"

interface LogAuthorizeApplicationArgs {
  scope: string
  anchor: number
  applicationName?: string
  chain?: string
}

/**
 * Store user to analytics database
 * @param scope - user id + domain used for the delegation
 * @param anchor - user number in internet identity
 * @param applicationName - The name of the application requesting authorization
 * @param chain - The chain the user is signing in to
 */
export const logAuthorizeApplication = async ({
  scope,
  anchor,
  applicationName: application = "Undefined application",
  chain = "Internet Computer",
}: LogAuthorizeApplicationArgs) => {
  const principal = await fetchPrincipal(anchor, scope)
  const principalId = principal.toString()
  const billable = checkIsIframe()
  const blockchainAddress = principalToAddress(principal)

  storeSignIn({
    application,
    billable,
    blockchainAddress,
    chain,
    principal: principalId,
  })
}
