import { fetchAccounts, selectAccounts } from "."

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
