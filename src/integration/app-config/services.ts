import { fetchAccountLimit } from "frontend/integration/app-config"
import { AuthorizationRequest } from "frontend/state/authorization"

export async function fetchAccountLimitService(context: {
  authRequest: AuthorizationRequest
}) {
  if (!context.authRequest?.hostname)
    // throw new Error("missing context.authRequest.hostname")
    return 5

  const domain =
    context.authRequest.derivationOrigin || context.authRequest.hostname
  const response = await fetchAccountLimit(domain)
  console.debug(`fetchAccountLimitService fetchAccountLimit`, {
    response,
  })
  return response
}
