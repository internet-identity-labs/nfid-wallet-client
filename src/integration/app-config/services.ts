import { fetchAppUserLimit as _fetchAppUserLimit } from "frontend/integration/app-config"
import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

export function fetchAppUserLimit(context: AuthorizationMachineContext) {
  if (!context.authRequest?.hostname) throw new Error("No application meta")
  return _fetchAppUserLimit(context.authRequest?.hostname)
}
