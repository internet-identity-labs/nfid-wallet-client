import { principalToAddress } from "ictool"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useBtcTransactions } from "src/features/fungable-token/btc/hooks/use-btc-transactions"
import {
  useErc20GoerliTransactions,
  useErc20Transactions,
} from "src/features/fungable-token/erc-20/hooks/use-erc-20-transactions"
import {
  useErc20TransactionsPolygon,
  useErc20TransactionsPolygonMumbai,
} from "src/features/fungable-token/erc-20/hooks/use-erc-20-transactions-polygon"
import {
  useMaticMumbaiTransactions,
  useMaticTransactions,
} from "src/features/fungable-token/matic/hooks/use-matic-transactions"
import {
  useUserPolygonMumbaiNFTTransactions,
  useUserPolygonNFTTransactions,
} from "src/features/non-fungable-token/eth/use-user-polygon-transactions"

import { IOption } from "@nfid-frontend/ui"
import { sortByDate } from "@nfid-frontend/utils"
import { blockchains } from "@nfid/config"

import {
  useEthGoerliTransactions,
  useEthTransactions,
} from "frontend/features/fungable-token/eth/hooks/use-eth-transactions"
import {
  useUserEthGoerliNFTTransactions,
  useUserEthNFTTransactions,
} from "frontend/features/non-fungable-token/eth/use-user-nft-transactions"
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
  const {
    sendTransactions: sendEthGoerliTXs,
    receiveTransactions: receiveEthGoerliTXs,
  } = useEthGoerliTransactions()

  const { erc20txs } = useErc20Transactions()
  const { erc20goerlitxs } = useErc20GoerliTransactions()

  const { transactions: nftTransactions } = useUserEthNFTTransactions()
  const { transactions: nftGoerliTransactions } =
    useUserEthGoerliNFTTransactions()

  const { txs: maticTxs } = useMaticTransactions()
  const { txs: maticMumbaiTxs } = useMaticMumbaiTransactions()

  const { erc20txs: erc20txsPolygon } = useErc20TransactionsPolygon()
  const { erc20mumbaitxs } = useErc20TransactionsPolygonMumbai()

  const { transactions: nftPolygonTransactions } =
    useUserPolygonNFTTransactions()
  const { transactions: nftPolygonMumbaiTransactions } =
    useUserPolygonMumbaiNFTTransactions()

  const { txs: btcTxs } = useBtcTransactions()

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
    const BTCTransactions = isNFIDAccount ? btcTxs?.sendTransactions ?? [] : []

    const ETHTransactions = isNFIDAccount ? sendEthTXs : []
    const ETHGoerliTransactions = isNFIDAccount ? sendEthGoerliTXs : []

    const ERC20Transactions = isNFIDAccount
      ? erc20txs?.sendTransactions ?? []
      : []
    const ERC20GoerliTransactions = isNFIDAccount
      ? erc20goerlitxs?.sendTransactions ?? []
      : []

    const ETHNFTTransactions = isNFIDAccount
      ? nftTransactions?.filter((t) => t.type === "send") ?? []
      : []

    const ETHGoerliNFTTransactions = isNFIDAccount
      ? nftGoerliTransactions?.filter((t) => t.type === "send") ?? []
      : []

    const PolygonNFTTransactions = isNFIDAccount
      ? nftPolygonTransactions?.filter((t) => t.type === "send") ?? []
      : []
    const PolygonMumbaiNFTTransactions = isNFIDAccount
      ? nftPolygonMumbaiTransactions?.filter((t) => t.type === "send") ?? []
      : []
    const ERC20TransactionsPolygon = isNFIDAccount
      ? erc20txsPolygon?.sendTransactions ?? []
      : []
    const ERC20TransactionsPolygonMumbai = isNFIDAccount
      ? erc20mumbaitxs?.sendTransactions ?? []
      : []
    const TransactionsPolygon = isNFIDAccount
      ? maticTxs?.sendTransactions ?? []
      : []
    const TransactionsPolygonMumbai = isNFIDAccount
      ? maticMumbaiTxs?.sendTransactions ?? []
      : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [
          ...ICTransactions,
          ...ETHTransactions,
          ...BTCTransactions,
          ...ERC20Transactions,
          ...ETHNFTTransactions,
          ...PolygonNFTTransactions,
          ...ERC20TransactionsPolygon,
          ...TransactionsPolygon,
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
    selectedBlockchainFilters.includes("Ethereum Goerli") &&
      transactions.push(
        ...ETHGoerliTransactions,
        ...ERC20GoerliTransactions,
        ...ETHGoerliNFTTransactions,
      )
    !!selectedBlockchainFilters.find((f) => f.includes("Ethereum")) &&
      transactions.push(
        ...ETHTransactions,
        ...ERC20Transactions,
        ...ETHNFTTransactions,
      )
    selectedBlockchainFilters.includes("Polygon") &&
      transactions.push(
        ...ERC20TransactionsPolygon,
        ...TransactionsPolygon,
        ...PolygonNFTTransactions,
      )
    selectedBlockchainFilters.includes("Polygon Mumbai") &&
      transactions.push(
        ...TransactionsPolygonMumbai,
        ...ERC20TransactionsPolygonMumbai,
        ...PolygonMumbaiNFTTransactions,
      )
    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    wallets,
    isNFIDAccount,
    btcTxs?.sendTransactions,
    sendEthTXs,
    sendEthGoerliTXs,
    erc20txs?.sendTransactions,
    erc20goerlitxs?.sendTransactions,
    nftTransactions,
    nftGoerliTransactions,
    nftPolygonTransactions,
    nftPolygonMumbaiTransactions,
    erc20txsPolygon?.sendTransactions,
    erc20mumbaitxs?.sendTransactions,
    maticTxs?.sendTransactions,
    maticMumbaiTxs?.sendTransactions,
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
    const ETHGoeriTransactions = isNFIDAccount ? receiveEthGoerliTXs : []
    const ERC20Transactions = isNFIDAccount
      ? erc20txs?.receivedTransactions ?? []
      : []
    const ERC20GoerliTransactions = isNFIDAccount
      ? erc20goerlitxs?.receivedTransactions ?? []
      : []

    const ERC20TransactionsPolygon = isNFIDAccount
      ? erc20txsPolygon?.receivedTransactions ?? []
      : []

    const ERC20TransactionsPolygonMumbai = isNFIDAccount
      ? erc20mumbaitxs?.receivedTransactions ?? []
      : []

    const TransactionsPolygon = isNFIDAccount
      ? maticTxs?.receivedTransactions ?? []
      : []
    const TransactionsPolygonMumbai = isNFIDAccount
      ? maticMumbaiTxs?.receivedTransactions ?? []
      : []

    const BTCTransactions = isNFIDAccount
      ? btcTxs?.receivedTransactions ?? []
      : []

    const ETHNFTTransactions = isNFIDAccount
      ? nftTransactions?.filter((t) => t.type === "received") ?? []
      : []

    const ETHGoelriNFTTransactions = isNFIDAccount
      ? nftGoerliTransactions?.filter((t) => t.type === "received") ?? []
      : []

    const PolygonNFTTransactions = isNFIDAccount
      ? nftPolygonTransactions?.filter((t) => t.type === "received") ?? []
      : []

    const PolygonMumbaiNFTTransactions = isNFIDAccount
      ? nftPolygonMumbaiTransactions?.filter((t) => t.type === "received") ?? []
      : []

    if (!selectedBlockchainFilters.length)
      return sortByDate(
        [
          ...ICTransactions,
          ...ETHTransactions,
          ...BTCTransactions,
          ...ERC20Transactions,
          ...ETHNFTTransactions,
          ...PolygonNFTTransactions,
          ...ERC20TransactionsPolygon,
          ...TransactionsPolygon,
        ],
        "MMM dd',' yyyy - hh:mm:ss a",
      )

    let transactions = []

    selectedBlockchainFilters.includes("Internet Computer") &&
      transactions.push(...ICTransactions)
    !!selectedBlockchainFilters.includes("Ethereum") &&
      transactions.push(
        ...ETHTransactions,
        ...ERC20Transactions,
        ...ETHNFTTransactions,
      )
    !!selectedBlockchainFilters.includes("Ethereum Goerli") &&
      transactions.push(
        ...ETHGoeriTransactions,
        ...ERC20GoerliTransactions,
        ...ETHGoelriNFTTransactions,
      )

    selectedBlockchainFilters.includes("Bitcoin") &&
      transactions.push(...BTCTransactions)

    selectedBlockchainFilters.includes("Polygon") &&
      transactions.push(
        ...ERC20TransactionsPolygon,
        ...TransactionsPolygon,
        ...PolygonNFTTransactions,
      )
    selectedBlockchainFilters.includes("Polygon Mumbai") &&
      transactions.push(
        ...TransactionsPolygonMumbai,
        ...ERC20TransactionsPolygonMumbai,
        ...PolygonMumbaiNFTTransactions,
      )

    return sortByDate(transactions, "MMM dd',' yyyy - hh:mm:ss a")
  }, [
    walletTransactions,
    selectedAccountFilters,
    wallets,
    isNFIDAccount,
    receiveEthTXs,
    receiveEthGoerliTXs,
    erc20txs?.receivedTransactions,
    erc20goerlitxs?.receivedTransactions,
    erc20txsPolygon?.receivedTransactions,
    erc20mumbaitxs?.receivedTransactions,
    maticTxs?.receivedTransactions,
    maticMumbaiTxs?.receivedTransactions,
    btcTxs?.receivedTransactions,
    nftTransactions,
    nftGoerliTransactions,
    nftPolygonTransactions,
    nftPolygonMumbaiTransactions,
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
            (erc20txsPolygon?.sendTransactions?.length ?? 0) +
            (erc20txsPolygon?.receivedTransactions?.length ?? 0) +
            (maticTxs?.sendTransactions?.length ?? 0) +
            (maticTxs?.receivedTransactions?.length ?? 0) +
            (nftPolygonTransactions?.length ?? 0) +
            (nftTransactions?.length ?? 0) +
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
    erc20txsPolygon?.receivedTransactions?.length,
    erc20txsPolygon?.sendTransactions?.length,
    maticTxs?.receivedTransactions?.length,
    maticTxs?.sendTransactions?.length,
    receiveEthTXs.length,
    sendEthTXs.length,
    walletTransactions,
    wallets,
    nftPolygonTransactions,
    nftTransactions,
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
