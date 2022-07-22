import { AuthorizationMachineContext } from "frontend/state/machines/authorization/authorization"

import {
  createPersona,
  fetchAccount,
  fetchPersonas as _fetchPersonas,
  selectPersonas,
} from "."
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
  if (!context.authRequest) throw new Error("Missing auth request")
  await createPersona(
    context.authRequest?.hostname,
    `${context.accounts?.length || "0"}`,
    "Account #1",
  )
  return `${context.accounts?.length || "0"}`
}
