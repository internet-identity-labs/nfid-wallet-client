import { fetchPrincipal } from "@nfid/integration"
import { loadProfileFromLocalStorage } from "@nfid/integration"

import { fetchProfile, fetchAccounts, selectAccounts, verifyToken } from "."

export function getLocalStorageProfileService() {
  const profile = loadProfileFromLocalStorage()
  if (!profile)
    throw new Error(
      `getLocalStorageProfileService getProfileService unregistered device`,
    )

  return Promise.resolve(profile)
}

export function isDeviceRegistered() {
  return !!loadProfileFromLocalStorage()
}

export async function checkRegistrationStatus() {
  try {
    const profile = await fetchProfile()
    console.debug("checkRegistrationStatus", { profile })
    return true
  } catch (error: any) {
    if (error.code === 404) {
      return false
    }
    throw error
  }
}

type FetchAccountsServiceArgs = {
  authRequest: {
    hostname: string
    derivationOrigin?: string
  }
}

export async function fetchAccountsService({
  authRequest,
}: FetchAccountsServiceArgs) {
  if (!authRequest?.hostname) {
    throw new Error(
      `fetchAccountsService Cannot filter personas without hostname`,
    )
  }
  const personas = await fetchAccounts()
  return selectAccounts(
    personas,
    authRequest.hostname,
    authRequest.derivationOrigin,
  )
}

export async function fetchProfileService() {
  console.debug(`fetchProfileService`)
  return await fetchProfile()
}

/** xstate service to verify sms verification code */
export async function verifySmsService(
  context: unknown,
  { data }: { data: string },
) {
  console.debug(verifySmsService.name, {
    caller: (await fetchPrincipal()).toText(),
    token: data,
  })
  try {
    return await verifyToken(data)
  } catch (e) {
    console.error("Error in verifySmsService", e)
    throw new Error(
      "verifySmsService: There was a problem with your submission. Please try again.",
    )
  }
}
