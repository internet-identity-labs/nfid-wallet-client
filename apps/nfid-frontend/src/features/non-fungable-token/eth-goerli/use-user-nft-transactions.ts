import { format } from "date-fns"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import { useMemo } from "react"
import useSWR from "swr"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"

import { getUserEthGoerliNFTActivity } from "./get-user-nft-activity"

export const useUserEthGoerliNFTTransactions = () => {
  const { address } = useEthAddress()
  const { data, error, isValidating } = useSWR(
    "user-eth-goerli-nft-transactions",
    getUserEthGoerliNFTActivity,
  )

  const transactions = useMemo(() => {
    return data?.activities.map(
      (activity) =>
        ({
          asset: "NFT",
          quantity: 1,
          date: format(new Date(activity.date), "MMM dd, yyyy - hh:mm:ss aaa"),
          from: activity.from.replace("ETHEREUM:", ""),
          to: activity.to.replace("ETHEREUM:", ""),
          type:
            activity.to.replace("ETHEREUM:", "").toLowerCase() ===
            address?.toLowerCase()
              ? "Received"
              : "send",
        } as TransactionRow),
    )
  }, [address, data?.activities])

  return {
    transactions: transactions ?? [],
    error,
    isValidating,
  }
}
