import { format } from "date-fns"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import { useMemo } from "react"
import useSWR from "swr"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"

import { getUserPolygonMumbaiNFTActivity } from "./get-user-polygon-activity"

export const useUserPolygonMumbaiFTTransactions = () => {
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
              : "send",
        } as TransactionRow),
    )
  }, [address, data?.activities])

  return {
    transactions,
    error,
    isValidating,
  }
}
