import { fetchProfile, fetchAccounts, selectAccounts } from "."

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
