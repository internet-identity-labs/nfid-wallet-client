import { principalToAddress } from "ictool"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useBtcTransactions } from "src/features/fungable-token/btc/hooks/use-btc-transactions"

import { IOption } from "@nfid-frontend/ui"
import { sortByDate } from "@nfid-frontend/utils"
import { blockchains } from "@nfid/config"

import { useEthTransactions } from "frontend/features/fungable-token/eth/hooks/use-eth-transactions"
import {
  selectReceivedTransactions,
  selectSendTransactions,
} from "frontend/integration/rosetta/select-transactions"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useWallet } from "frontend/integration/wallet/hooks/use-wallet"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileTransactionsPage from "frontend/ui/pages/new-profile/transaction-history"

const ProfileTransactions = () => {
  const { walletTransactions, isWalletLoading } = useWallet()
  const { sendTransactions: sendEthTXs, receiveTransactions: receiveEthTXs } =
    useEthTransactions()
  const { txs: btcTxs } = useBtcTransactions()

  const { wallets } = useAllWallets()

  const location = useLocation()

  const [selectedAccountFilters, setSelectedAccountFilters] = useState<
    IOption[]
  >([])
  const [selectedBlockchainFilters, setSelectedBlockchainFilters] = useState<
    string[]
  >([])

  const accountsOptions = useMemo(() => {
    return wallets.map(
      (w) =>
        ({
          label: w.label,
          value: principalToAddress(w.principal),
        } as IOption),
    )
  }, [wallets])

  const isNFIDAccount = useMemo(() => {
    return !selectedAccountFilters.length
      ? true
      : !!selectedAccountFilters.find(
          (f) => f?.value === accountsOptions[0]?.value,
        )
      ? true
      : false
  }, [selectedAccountFilters, accountsOptions])

  const sendTransactions = useMemo(() => {
    const ICTransactions = selectSendTransactions({
      transactions: walletTransactions ?? { totalCount: 0, transactions: [] },
      accounts: selectedAccountFilters.length
        ? selectedAccountFilters.map((f) => f.value)
        : accountsOptions.map((o) => o.value),
    })
    const ETHTransactions = isNFIDAccount ? sendEthTXs : []
    const BTCTransactions = isNFIDAccount ? btcTxs?.sendTransactions ?? [] : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [...ICTransactions, ...ETHTransactions, ...BTCTransactions],
        "MMM dd',' yyyy - hh:mm:ss a",
      )

    let transactions = []

    selectedBlockchainFilters.includes("Internet Computer") &&
      transactions.push(...ICTransactions)
    selectedBlockchainFilters.includes("Ethereum") &&
      transactions.push(...ETHTransactions)
    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    accountsOptions,
    isNFIDAccount,
    sendEthTXs,
    btcTxs?.sendTransactions,
    selectedBlockchainFilters,
  ])

  const receivedTransactions = useMemo(() => {
    const ICTransactions = selectReceivedTransactions({
      transactions: walletTransactions ?? { totalCount: 0, transactions: [] },
      accounts: selectedAccountFilters.length
        ? selectedAccountFilters.map((f) => f.value)
        : accountsOptions.map((o) => o.value),
    })
    const ETHTransactions = isNFIDAccount ? receiveEthTXs : []
    const BTCTransactions = isNFIDAccount
      ? btcTxs?.receivedTransactions ?? []
      : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [...ICTransactions, ...ETHTransactions, ...BTCTransactions],
        "MMM dd',' yyyy - hh:mm:ss a",
      )

    let transactions = []

    selectedBlockchainFilters.includes("Internet Computer") &&
      transactions.push(...ICTransactions)
    selectedBlockchainFilters.includes("Ethereum") &&
      transactions.push(...ETHTransactions)
    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    accountsOptions,
    isNFIDAccount,
    selectedBlockchainFilters,
    receiveEthTXs,
    btcTxs?.receivedTransactions,
  ])

  const handleSelectAccountFilter = useCallback(
    (value: string[]) => {
      const options = value.map((v) =>
        accountsOptions.find((o) => o.value === v),
      )
      setSelectedAccountFilters(
        options.filter((o) => o !== undefined) as IOption[],
      )
    },
    [accountsOptions],
  )

  const handleRemoveFilterChip = React.useCallback(
    (value: string) => {
      const transactionFilter = selectedAccountFilters.filter(
        (chip) => chip.label !== value,
      )
      setSelectedAccountFilters(transactionFilter)
    },
    [selectedAccountFilters],
  )

  useEffect(() => {
    const wallet = location.state?.wallet
    wallet && setSelectedAccountFilters([wallet])
  }, [location.state?.wallet])

  useEffect(() => {
    const blockchain = location.state?.blockchain
    if (!blockchain) return

    switch (blockchain) {
      case "ETH":
        return setSelectedBlockchainFilters(["Ethereum"])
      case "BTC":
        return setSelectedBlockchainFilters(["Bitcoin"])
      default:
        return setSelectedBlockchainFilters(["Internet Computer"])
    }
  }, [location.state?.blockchain])

  return (
    <>
      <Loader isLoading={isWalletLoading} />
      <ProfileTransactionsPage
        sentData={sendTransactions}
        receivedData={receivedTransactions}
        transactionsFilterOptions={accountsOptions}
        setTransactionFilter={handleSelectAccountFilter}
        selectedTransactionFilter={selectedAccountFilters}
        onChipRemove={handleRemoveFilterChip}
        blockchainOptions={blockchains}
        resetBlockchainFilter={() => setSelectedBlockchainFilters(blockchains)}
        blockchainFilter={selectedBlockchainFilters}
        setBlockchainFilter={setSelectedBlockchainFilters}
      />
    </>
  )
}

export default ProfileTransactions
