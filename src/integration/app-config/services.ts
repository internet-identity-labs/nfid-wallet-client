import { fetchAppUserLimit as _fetchAppUserLimit } from "frontend/integration/app-config"
import { AuthorizationMachineContext } from "frontend/state/authorization"

export function fetchAppUserLimit(context: AuthorizationMachineContext) {
  if (!context.appMeta?.hostname) throw new Error("No application meta")
  return _fetchAppUserLimit(context.appMeta?.hostname)
}
