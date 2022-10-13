import { principalToAddress } from "ictool"
import React from "react"

import { PrincipalAccount } from "frontend/integration/facade"
import { Application } from "frontend/integration/identity-manager"
import { getWalletName } from "frontend/integration/identity-manager/account/utils"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { Transaction } from "frontend/integration/rosetta/rosetta_interface"
import { IOption } from "frontend/ui/atoms/dropdown-select"

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
    }) => address === (senderAddress || receiverAddress),
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
    afterLabel: getTransactionsCount(value, transactions),
    value,
  }
}

const reduceTransactionFilterOptions = (
  principals: PrincipalAccount[],
  applications: Application[],
  transactions: Transaction[],
): TransactionsFilterOption[] => {
  return principals
    .sort((a, b) => {
      if (a.account.domain === b.account.domain) {
        return a.account.accountId > b.account.accountId ? 1 : -1
      }
      return a.account.domain > b.account.domain ? 1 : -1
    })
    .reduce<TransactionsFilterOption[]>((acc, principal) => {
      const applicationMatch = applications.find(
        (a) => a.domain === principal.account.domain,
      )
      return [
        ...acc,
        mapToTransactionFilterOption(principal, transactions, applicationMatch),
      ]
    }, [])
}

interface TransactionsFilterOption extends IOption {}

export const useTransactionsFilter = (excludeEmpty: boolean = true) => {
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
          ).filter((t) => (excludeEmpty ? Number(t.afterLabel) > 0 : true))
        : [],
    [principals, applicationsMeta, transactions, excludeEmpty],
  )
  return { transactionsFilterOptions }
}
