import { principalToAddress } from "ictool"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useBtcTransactions } from "src/features/fungable-token/btc/hooks/use-btc-transactions"
import { useErc20Transactions } from "src/features/fungable-token/erc-20/hooks/use-erc-20-transactions"

import { IOption } from "@nfid-frontend/ui"
import { sortByDate } from "@nfid-frontend/utils"
import { blockchains } from "@nfid/config"

import { useEthTransactions } from "frontend/features/fungable-token/eth/hooks/use-eth-transactions"
import { useUserEthNFTTransactions } from "frontend/features/non-fungable-token/eth/use-user-nft-transactions"
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
  const { erc20txs } = useErc20Transactions()
  const { transactions: nftTransactions } = useUserEthNFTTransactions()

  const { wallets } = useAllWallets()

  const location = useLocation()

  const [selectedAccountFilters, setSelectedAccountFilters] = useState<
    IOption[]
  >([])
  const [selectedBlockchainFilters, setSelectedBlockchainFilters] = useState<
    string[]
  >([])

  const isNFIDAccount = useMemo(() => {
    if (!wallets.length) return false
    return !selectedAccountFilters.length
      ? true
      : !!selectedAccountFilters.find(
          (f) => f?.value === principalToAddress(wallets[0]?.principal),
        )
      ? true
      : false
  }, [selectedAccountFilters, wallets])

  const sendTransactions: TransactionRow[] = useMemo(() => {
    const ICTransactions = selectSendTransactions({
      transactions: walletTransactions ?? { totalCount: 0, transactions: [] },
      accounts: selectedAccountFilters.length
        ? selectedAccountFilters.map((f) => f.value)
        : wallets.map((w) => principalToAddress(w.principal)),
    })
    const ETHTransactions = isNFIDAccount ? sendEthTXs : []
    const BTCTransactions = isNFIDAccount ? btcTxs?.sendTransactions ?? [] : []
    const ERC20Transactions = isNFIDAccount
      ? erc20txs?.sendTransactions ?? []
      : []
    const ETHNFTTransactions = isNFIDAccount
      ? nftTransactions?.filter((t) => t.type === "send") ?? []
      : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [
          ...ICTransactions,
          ...ETHTransactions,
          ...BTCTransactions,
          ...ERC20Transactions,
          ...ETHNFTTransactions,
        ],
        "MMM dd',' yyyy - hh:mm:ss a",
      )

    let transactions = []

    selectedBlockchainFilters.includes("Internet Computer") &&
      transactions.push(...ICTransactions)
    selectedBlockchainFilters.includes("Ethereum") &&
      transactions.push(
        ...ETHTransactions,
        ...ERC20Transactions,
        ...ETHNFTTransactions,
      )
    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    wallets,
    isNFIDAccount,
    sendEthTXs,
    btcTxs?.sendTransactions,
    erc20txs?.sendTransactions,
    nftTransactions,
    selectedBlockchainFilters,
  ])

  const receivedTransactions: TransactionRow[] = useMemo(() => {
    const ICTransactions = selectReceivedTransactions({
      transactions: walletTransactions ?? { totalCount: 0, transactions: [] },
      accounts: selectedAccountFilters.length
        ? selectedAccountFilters.map((f) => f.value)
        : wallets.map((w) => principalToAddress(w.principal)),
    })
    const ETHTransactions = isNFIDAccount ? receiveEthTXs : []
    const ERC20Transactions = isNFIDAccount
      ? erc20txs?.receivedTransactions ?? []
      : []

    const BTCTransactions = isNFIDAccount
      ? btcTxs?.receivedTransactions ?? []
      : []

    const ETHNFTTransactions = isNFIDAccount
      ? nftTransactions?.filter((t) => t.type === "received") ?? []
      : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [
          ...ICTransactions,
          ...ETHTransactions,
          ...BTCTransactions,
          ...ERC20Transactions,
          ...ETHNFTTransactions,
        ],
        "MMM dd',' yyyy - hh:mm:ss a",
      )

    let transactions = []

    selectedBlockchainFilters.includes("Internet Computer") &&
      transactions.push(...ICTransactions)
    selectedBlockchainFilters.includes("Ethereum") &&
      transactions.push(
        ...ETHTransactions,
        ...ERC20Transactions,
        ...ETHNFTTransactions,
      )
    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    wallets,
    isNFIDAccount,
    receiveEthTXs,
    erc20txs?.receivedTransactions,
    btcTxs?.receivedTransactions,
    nftTransactions,
    selectedBlockchainFilters,
  ])

  const accountsOptions = useMemo(() => {
    return wallets.map((w) => {
      const ICTransactionsLength =
        selectReceivedTransactions({
          transactions: walletTransactions ?? {
            totalCount: 0,
            transactions: [],
          },
          accounts: [principalToAddress(w.principal)],
        }).length +
        selectSendTransactions({
          transactions: walletTransactions ?? {
            totalCount: 0,
            transactions: [],
          },
          accounts: [principalToAddress(w.principal)],
        }).length

      const transactionsLength =
        w.domain === "nfid.one"
          ? sendEthTXs.length +
            receiveEthTXs.length +
            (btcTxs?.sendTransactions?.length ?? 0) +
            (btcTxs?.receivedTransactions?.length ?? 0) +
            (erc20txs?.sendTransactions?.length ?? 0) +
            (erc20txs?.receivedTransactions?.length ?? 0) +
            ICTransactionsLength
          : ICTransactionsLength

      return {
        label: w.label,
        value: principalToAddress(w.principal),
        afterLabel: `${transactionsLength} TXs`,
      } as IOption
    })
  }, [
    btcTxs?.receivedTransactions?.length,
    btcTxs?.sendTransactions?.length,
    erc20txs?.receivedTransactions?.length,
    erc20txs?.sendTransactions?.length,
    receiveEthTXs.length,
    sendEthTXs.length,
    walletTransactions,
    wallets,
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
    setSelectedBlockchainFilters([blockchain])
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
