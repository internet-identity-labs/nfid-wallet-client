import { principalToAddress } from "ictool"
import React from "react"

import { PrincipalAccount } from "frontend/integration/facade"
import { Application } from "frontend/integration/identity-manager"
import { getWalletName } from "frontend/integration/identity-manager/account/utils"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { Transaction } from "frontend/integration/rosetta/rosetta_interface"
import { IOption } from "frontend/ui/atoms/dropdown-select"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

import { useAllTransactions } from "./get-all-transactions"

const getTransactionsCount = (address: string, transactions: Transaction[]) => {
  const matchingTransactions = transactions.filter(
    ({
      transaction: {
        operations: [
          {
            account: { address: senderAddress },
          },
          {
            account: { address: receiverAddress },
          },
        ],
      },
    }) => address === senderAddress || address === receiverAddress,
  )
  return matchingTransactions.length
}

const mapToTransactionFilterOption = (
  principal: PrincipalAccount,
  transactions: Transaction[],
  application?: Application,
): TransactionsFilterOption => {
  const value = principalToAddress(principal.principal as any)
  return {
    label: getWalletName(principal.account, application),
    afterLabel: `${getTransactionsCount(value, transactions)} TXs`,
    value,
  }
}

const reduceTransactionFilterOptions = (
  principals: PrincipalAccount[],
  applications: Application[],
  transactions: Transaction[],
): TransactionsFilterOption[] => {
  const options = principals
    .reduce<TransactionsFilterOption[]>((acc, principal) => {
      const applicationMatch = applications.find(
        (a) => a.domain === principal.account.domain,
      )
      return [
        ...acc,
        mapToTransactionFilterOption(principal, transactions, applicationMatch),
      ]
    }, [])
    .sort(sortAlphabetic(({ label }) => label))
  return keepStaticOrder<TransactionsFilterOption>(
    ({ label }) => label,
    ["NFID", "NNS"],
  )(options)
}

export interface TransactionsFilterOption extends IOption {}

export interface UseTransactionsFilterProps {
  excludeEmpty?: boolean
  includeAddresses?: string[]
}

export const useTransactionsFilter = ({
  excludeEmpty = true,
  includeAddresses = [],
}: UseTransactionsFilterProps) => {
  const { principals } = useAllPrincipals()
  const { applicationsMeta } = useApplicationsMeta()
  const { transactions } = useAllTransactions()
  const transactionsFilterOptions = React.useMemo(
    () =>
      principals && applicationsMeta && transactions
        ? reduceTransactionFilterOptions(
            principals,
            applicationsMeta,
            transactions.transactions,
          ).filter((t) =>
            excludeEmpty
              ? Number(t.afterLabel) > 0 ||
                includeAddresses.indexOf(t.value) > -1
              : true,
          )
        : [],
    [
      principals,
      applicationsMeta,
      transactions,
      excludeEmpty,
      includeAddresses,
    ],
  )
  return { transactionsFilterOptions }
}
