import { parse } from "date-fns"
import React from "react"
import { useSearchParams } from "react-router-dom"

import { IOption } from "@nfid-frontend/ui"

import { useEthTransactions } from "frontend/features/fungable-token/eth/hooks/use-eth-transactions"
import {
  selectReceivedTransactions,
  selectSendTransactions,
} from "frontend/integration/rosetta/select-transactions"
import { useTransactionsFilter } from "frontend/integration/wallet/hooks/use-transactions-filter"
import { useWallet } from "frontend/integration/wallet/hooks/use-wallet"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileTransactionsPage from "frontend/ui/pages/new-profile/transaction-history"

const ProfileTransactions = () => {
  const { walletTransactions, isWalletLoading } = useWallet()
  const { sendTransactions: sendEthTXs, receiveTransactions: receiveEthTXs } =
    useEthTransactions()
  const [search] = useSearchParams()

  const transactionFilterFromSearch = search.get("wallet")

  const [transactionFilter, setTransactionFilter] = React.useState<string[]>(
    transactionFilterFromSearch ? [transactionFilterFromSearch] : [],
  )
  const { transactionsFilterOptions } = useTransactionsFilter({
    excludeEmpty: false,
  })

  const selectedTransactionFilter = React.useMemo(
    () =>
      transactionFilter
        .map((f) => transactionsFilterOptions.find((tf) => tf.value === f))
        .filter((f: IOption | undefined): f is IOption => Boolean(f)),
    [transactionFilter, transactionsFilterOptions],
  )

  // FIXME: find suitable hook to return the walletAddresses
  // they need to be calculated already when fetching transactions
  const walletAddresses = React.useMemo(
    () =>
      transactionFilter.length === 0
        ? transactionsFilterOptions.map((tfo) => tfo.value)
        : transactionFilter,
    [transactionFilter, transactionsFilterOptions],
  )

  const sendTransactions = React.useMemo(
    () =>
      walletTransactions
        ? selectSendTransactions({
            transactions: walletTransactions,
            accounts: walletAddresses,
          })
            .concat(sendEthTXs)
            .sort((a, b) => {
              const dateA = parse(
                a.date,
                "MMM dd',' yyyy - hh:mm:ss a",
                new Date(),
              )
              const dateB = parse(
                b.date,
                "MMM dd',' yyyy - hh:mm:ss a",
                new Date(),
              )
              return dateB.getTime() - dateA.getTime()
            })
        : [],
    [sendEthTXs, walletAddresses, walletTransactions],
  )
  const recceivedTransactions = React.useMemo(
    () =>
      walletTransactions
        ? selectReceivedTransactions({
            transactions: walletTransactions,
            accounts: walletAddresses,
          })
            .concat(receiveEthTXs)
            .sort((a, b) => {
              const dateA = parse(
                a.date,
                "MMM dd',' yyyy - hh:mm:ss a",
                new Date(),
              )
              const dateB = parse(
                b.date,
                "MMM dd',' yyyy - hh:mm:ss a",
                new Date(),
              )
              return dateB.getTime() - dateA.getTime()
            })
        : [],
    [receiveEthTXs, walletAddresses, walletTransactions],
  )

  const handleRemoveFilterChip = React.useCallback(
    (value: string) => {
      const transactionFilter = selectedTransactionFilter.filter(
        (stf) => stf.label !== value,
      )
      setTransactionFilter(transactionFilter.map((tf) => tf.value))
    },
    [selectedTransactionFilter],
  )

  return (
    <>
      <Loader isLoading={isWalletLoading} />
      <ProfileTransactionsPage
        sentData={sendTransactions}
        receivedData={recceivedTransactions}
        transactionsFilterOptions={transactionsFilterOptions}
        setTransactionFilter={setTransactionFilter}
        selectedTransactionFilter={transactionFilter}
        chips={selectedTransactionFilter.map((f) => f.label)}
        onChipRemove={handleRemoveFilterChip}
      />
    </>
  )
}

export default ProfileTransactions
