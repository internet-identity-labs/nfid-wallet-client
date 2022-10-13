import { principalToAddress } from "ictool"
import React from "react"

import { PrincipalAccount } from "frontend/integration/facade"
import { Application } from "frontend/integration/identity-manager"
import { getWalletName } from "frontend/integration/identity-manager/account/utils"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { IOption } from "frontend/ui/atoms/dropdown-select"

const mapToTransactionFilterOption = (
  principal: PrincipalAccount,
  application?: Application,
): TransactionsFilterOption => {
  return {
    label: getWalletName(principal.account, application),
    value: principalToAddress(principal.principal as any),
  }
}

const reduceTransactionFilterOptions = (
  principals: PrincipalAccount[],
  applications: Application[],
): TransactionsFilterOption[] => {
  return principals.reduce<TransactionsFilterOption[]>((acc, principal) => {
    const applicationMatch = applications.find(
      (a) => a.domain === principal.account.domain,
    )
    return [...acc, mapToTransactionFilterOption(principal, applicationMatch)]
  }, [])
}

interface TransactionsFilterOption extends IOption {}

export const useTransactionsFilter = () => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const transactionsFilterOptions = React.useMemo(
    () =>
      principals && applicationsMeta
        ? reduceTransactionFilterOptions(principals, applicationsMeta)
        : [],
    [principals, applicationsMeta],
  )
  return { transactionsFilterOptions }
}
