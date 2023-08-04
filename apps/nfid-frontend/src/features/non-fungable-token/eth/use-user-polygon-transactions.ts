import { format } from "date-fns"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import { useMemo } from "react"
import {
  getUserPolygonMumbaiNFTActivity,
  getUserPolygonNFTActivity,
} from "src/features/non-fungable-token/eth/get-user-polygon-activity"
import useSWR from "swr"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"

export const useUserPolygonNFTTransactions = () => {
  const { address } = useEthAddress()
  const { data, error, isValidating } = useSWR(
    "user-polygon-nft-transactions",
    getUserPolygonNFTActivity,
  )

  const transactions = useMemo(() => {
    return data?.activities.map(
      (activity) =>
        ({
          asset: "NFT",
          quantity: 1,
          date: format(new Date(activity.date), "MMM dd, yyyy - hh:mm:ss aaa"),
          from: activity.from.replace("POLYGON:", ""),
          to: activity.to.replace("POLYGON:", ""),
          type:
            activity.to.replace("POLYGON:", "").toLowerCase() ===
            address?.toLowerCase()
              ? "Received"
              : "Sent",
        } as TransactionRow),
    )
  }, [address, data?.activities])

  return {
    transactions,
    error,
    isValidating,
  }
}

export const useUserPolygonMumbaiNFTTransactions = () => {
  const { address } = useEthAddress()
  const { data, error, isValidating } = useSWR(
    "user-polygon-mumbai-nft-transactions",
    getUserPolygonMumbaiNFTActivity,
  )

  const transactions = useMemo(() => {
    return data?.activities.map(
      (activity) =>
        ({
          asset: "NFT",
          quantity: 1,
          date: format(new Date(activity.date), "MMM dd, yyyy - hh:mm:ss aaa"),
          from: activity.from.replace("POLYGON:", ""),
          to: activity.to.replace("POLYGON:", ""),
          type:
            activity.to.replace("POLYGON:", "").toLowerCase() ===
            address?.toLowerCase()
              ? "Received"
              : "Sent",
        } as TransactionRow),
    )
  }, [address, data?.activities])

  return {
    transactions,
    error,
    isValidating,
  }
}
