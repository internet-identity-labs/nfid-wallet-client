import { useMemo } from "react"

import { IOption } from "@nfid-frontend/ui"
import { getWalletName } from "@nfid/integration"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { Blockchain } from "frontend/ui/connnector/types"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

export const useAccountOptions = (blockchainFilter: string[]) => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()

  const options = useMemo(() => {
    if (!applicationsMeta || !principals) return []

    const filteredPrincipals = principals.filter(({ account, principal }) => {
      if (
        blockchainFilter.length &&
        !blockchainFilter.includes(Blockchain.IC)
      ) {
        return account.accountId === "-1"
      }

      return true
    })

    const opt = filteredPrincipals
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
  }, [applicationsMeta, blockchainFilter, principals])

  return {
    options,
  }
}
