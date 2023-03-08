import { principalToAddress } from "ictool"
import { BtcTransactionData } from "src/integration/wallet/hooks/use-transactions-filter"

import { IOption } from "@nfid-frontend/ui"
import { Application, PrincipalAccount } from "@nfid/integration"

import { getWalletName } from "frontend/integration/identity-manager/account/utils"
import { Transaction } from "frontend/integration/rosetta/rosetta_interface"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

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
  btcValue?: string,
  btcTransactionsCount?: number,
): TransactionsFilterOption => {
  const value = principalToAddress(principal.principal as any)
  let transactionCount = getTransactionsCount(value, transactions)
  if (value === btcValue && btcTransactionsCount) {
    transactionCount += btcTransactionsCount
  }
  return {
    label: getWalletName(principal.account, application),
    afterLabel: `${transactionCount} TXs`,
    value,
  }
}

export interface TransactionsFilterOption extends IOption {}

export const reduceTransactionFilterOptions = (
  principals: PrincipalAccount[],
  applications: Application[],
  transactions: Transaction[],
  btcData?: BtcTransactionData,
): TransactionsFilterOption[] => {
  const options = principals
    .reduce<TransactionsFilterOption[]>((acc, principal) => {
      const applicationMatch = applications.find(
        (a) => a.domain === principal.account.domain,
      )
      return [
        ...acc,
        mapToTransactionFilterOption(
          principal,
          transactions,
          applicationMatch,
          btcData?.value,
          btcData?.transactions,
        ),
      ]
    }, [])
    .sort(sortAlphabetic(({ label }) => label))
  return keepStaticOrder<TransactionsFilterOption>(
    ({ label }) => label,
    ["NFID", "NNS"],
  )(options)
}
