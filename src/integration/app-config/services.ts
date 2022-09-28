import { fetchAccountLimit } from "frontend/integration/app-config"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { processApplicationOrigin } from "../identity-manager"

export async function fetchAccountLimitService(context: {
  authRequest: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}) {
  if (!context.authRequest?.hostname)
    // throw new Error("missing context.authRequest.hostname")
    return 5

  const domain =
    context.authRequest.derivationOrigin || context.authRequest.hostname

  processApplicationOrigin(
    domain,
    context.authRequest.hostname,
    context.appMeta?.name,
  )

  const response = await fetchAccountLimit(domain)
  console.debug(`fetchAccountLimitService fetchAccountLimit`, {
    response,
  })
  return response
}
