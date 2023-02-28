import { useMemo } from "react"
import useSWR from "swr"

import { getEthTransactions } from "../get-eth-transactions"

export const useEthTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "ethereumTransactions",
    getEthTransactions,
  )

  const sendTransactions = useMemo(() => {
    return txs?.filter((tx) => tx.type === "send") ?? []
  }, [txs])

  const receiveTransactions = useMemo(() => {
    return txs?.filter((tx) => tx.type === "received") ?? []
  }, [txs])

  return { txs, sendTransactions, receiveTransactions, ...rest }
}
