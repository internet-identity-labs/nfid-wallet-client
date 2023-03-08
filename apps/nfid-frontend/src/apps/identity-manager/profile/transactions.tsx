import React, { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useBtcTransactions } from "src/features/fungable-token/btc/hooks/use-btc-transactions"

import { IOption } from "@nfid-frontend/ui"
import { sortByDate } from "@nfid-frontend/utils"

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
  const { txs: btcTxs } = useBtcTransactions()

  const sendBtcTransactions = useMemo(() => {
    return btcTxs?.sendTransactions?.filter((tx) => tx.type === "send") ?? []
  }, [btcTxs])
  const receivedBtcTransactions = useMemo(() => {
    return (
      btcTxs?.receivedTransactions?.filter((tx) => tx.type === "received") ?? []
    )
  }, [btcTxs])
  const btcWalletPrincipal = btcTxs?.walletAddress
  const btcAddress = btcTxs?.btcAddress

  const [search] = useSearchParams()

  let transactionFilterFromSearch = search.get("wallet")

  let [transactionFilter, setTransactionFilter] = React.useState<string[]>(
    transactionFilterFromSearch ? [transactionFilterFromSearch] : [],
  )

  //dirty hack. don't do like this
  //on first load calculation of BTC takes significant amount of time
  //we have to rerender it when ready
  if (
    btcAddress &&
    btcWalletPrincipal &&
    transactionFilter.includes(btcAddress)
  ) {
    const a = transactionFilter.indexOf(btcAddress)
    transactionFilter[a] = btcWalletPrincipal
    setTransactionFilter(transactionFilter)
  }

  const btcTransactionAmount =
    receivedBtcTransactions.length + sendBtcTransactions.length

  const { transactionsFilterOptions } = useTransactionsFilter({
    excludeEmpty: false,
    btcData: {
      value: btcWalletPrincipal,
      transactions: btcTransactionAmount,
    },
  })

  let selectedTransactionFilter = React.useMemo(() => {
    let tf = transactionFilter
      .map((f) => transactionsFilterOptions.find((tf) => tf.value === f))
      .filter((f: IOption | undefined): f is IOption => Boolean(f))
    return tf
  }, [transactionFilter, transactionsFilterOptions])

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
        ? sortByDate(
            selectSendTransactions({
              transactions: walletTransactions,
              accounts: walletAddresses,
            })
              .concat(sendEthTXs)
              .concat(
                sendBtcTransactions.filter(() => {
                  return btcWalletPrincipal
                    ? walletAddresses.indexOf(btcWalletPrincipal) > -1
                    : false
                }),
              ),
            "MMM dd',' yyyy - hh:mm:ss a",
          )
        : [],
    [
      btcWalletPrincipal,
      sendEthTXs,
      walletAddresses,
      walletTransactions,
      sendBtcTransactions,
    ],
  )

  const recceivedTransactions = React.useMemo(
    () =>
      walletTransactions
        ? sortByDate(
            selectReceivedTransactions({
              transactions: walletTransactions,
              accounts: walletAddresses,
            })
              .concat(receiveEthTXs)
              .concat(
                receivedBtcTransactions.filter(() => {
                  return btcWalletPrincipal
                    ? walletAddresses.indexOf(btcWalletPrincipal) > -1
                    : false
                }),
              ),
            "MMM dd',' yyyy - hh:mm:ss a",
          )
        : [],
    [
      btcWalletPrincipal,
      receiveEthTXs,
      walletAddresses,
      walletTransactions,
      receivedBtcTransactions,
    ],
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
