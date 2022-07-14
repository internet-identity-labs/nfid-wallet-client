import { AuthorizationMachineContext } from "frontend/state/authorization"

import { fetchPersonas as _fetchPersonas, selectPersonas } from "."
import { profile } from "./profile"

export function isDeviceRegistered() {
  return !!profile
}

export async function fetchAccounts(context: AuthorizationMachineContext) {
  if (!context.authRequest?.hostname) {
    throw new Error("Cannot filter personas without hostname")
  }
  const personas = await _fetchPersonas()
  return selectPersonas(personas, context.authRequest.hostname)
}

export async function createAccount(
  context: AuthorizationMachineContext,
): Promise<string> {
  throw new Error("Not implemented")
}
