import { principalToAddress } from "ictool"

import { checkIsIframe } from "@nfid-frontend/utils"
import { authState } from "@nfid/integration"

import { storeSignIn } from "frontend/integration/lambda/auth-stats"

interface ILogUser {
  applicationName?: string
}

/**
 * Store user to analytics database
 * @params applicationName?: string
 */
export const logUser = async ({ applicationName }: ILogUser) => {
  const isIframe = checkIsIframe()
  const user = authState.get()

  const principal = user.delegationIdentity?.getPrincipal()

  if (!principal) throw new Error("logUser principal is undefined")

  storeSignIn({
    application: applicationName ?? "Undefined application",
    billable: isIframe,
    blockchainAddress: principalToAddress(principal),
    chain: "Internet Computer",
    principal: principal.toString(),
  })
}
