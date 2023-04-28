import { useMemo } from "react"

import { IOption } from "@nfid-frontend/ui"
import { getWalletName } from "@nfid/integration"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

export const useAccountOptions = () => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()

  const options = useMemo(() => {
    if (!applicationsMeta || !principals) return []

    const opt = principals
      .map(({ account, principal }) => {
        return {
          label: getWalletName(
            applicationsMeta,
            account.domain,
            account.accountId,
          ),
          value: principal.toString(),
        } as IOption
      })
      .sort(sortAlphabetic(({ label }) => label ?? ""))

    return keepStaticOrder<IOption>(
      ({ label }) => label ?? "",
      ["NFID", "NNS"],
    )(opt || [])
  }, [applicationsMeta, principals])

  return {
    options,
  }
}
