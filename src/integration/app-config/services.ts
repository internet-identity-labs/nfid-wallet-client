import { fetchAccountLimit } from "frontend/integration/app-config"
import { AuthorizationRequest } from "frontend/state/authorization"

export async function fetchAccountLimitService(context: {
  authRequest: AuthorizationRequest
}) {
  console.debug(fetchAccountLimitService.name, { context })
  if (!context.authRequest?.hostname)
    throw new Error("missing context.authReques.hostname")

  const response = await fetchAccountLimit(context.authRequest.hostname)
  console.debug(`${fetchAccountLimitService.name} fetchAccountLimit`, {
    response,
  })
  return response
}
