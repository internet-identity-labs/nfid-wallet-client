import { principalToAddress } from "ictool"

import { checkIsIframe } from "@nfid-frontend/utils"

import { storeSignIn } from "frontend/integration/lambda/auth-stats"
import { delegationIdentityFromSignedIdentity, getDelegationChain } from "frontend/integration/internet-identity"
import { SignIdentity } from "@dfinity/agent"
import { ThirdPartyAuthSession } from "frontend/state/authorization"

interface LogAuthorizeApplicationArgs {
  delegation: ThirdPartyAuthSession
  sessionPublicKey: Pick<SignIdentity, "sign">
  applicationName?: string
  chain?: string
}

/**
 * Store user to analytics database
 * @param delegation - What we get from prepare and getDelegation
 * @param sessionPublicKey - What we received from 3rd party app as a session public key
 * @param applicationName - The name of the application requesting authorization
 * @param chain - The chain the user is signing in to
 */
export const logAuthorizeApplication = async ({
  delegation,
  sessionPublicKey,
  applicationName: application = "Undefined application",
  chain = "Internet Computer" }: LogAuthorizeApplicationArgs
) => {
  const identity = delegationIdentityFromSignedIdentity(
    sessionPublicKey,
    getDelegationChain(delegation)
  )

  const billable = checkIsIframe()

  const principal = identity.getPrincipal()

  const blockchainAddress = principalToAddress(principal)


  storeSignIn({
    application, billable, blockchainAddress, chain,
    principal: principal.toString(),
  })
}
