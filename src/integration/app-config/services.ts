import { fetchAccountLimit } from "frontend/integration/app-config"
import { AuthorizationRequest } from "frontend/state/authorization"

export function fetchAccountLimitService(context: {
  authRequest: AuthorizationRequest
}) {
  if (!context.authRequest?.hostname) throw new Error("No application meta")
  return fetchAccountLimit(context.authRequest.hostname)
}
