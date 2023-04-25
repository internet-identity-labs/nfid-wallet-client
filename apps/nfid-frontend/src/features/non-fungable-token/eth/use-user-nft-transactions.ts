import { format } from "date-fns"
import { TransactionRow } from "packages/integration/src/lib/asset/types"
import { useMemo } from "react"
import useSWR from "swr"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"

import { getUserEthNFTActivity } from "./get-user-nft-activity"

export const useUserEthNFTTransactions = () => {
  const { address } = useEthAddress()
  const { data, error, isValidating } = useSWR(
    "user-eth-nft-transactions",
    getUserEthNFTActivity,
  )

  const transactions = useMemo(() => {
    return data?.activities.map(
      (activity) =>
        ({
          asset: "NFT",
          quantity: 1,
          date: format(new Date(), "MMM dd, yyyy - hh:mm:ss aaa"),
          from: activity.from.replace("ETHEREUM:", ""),
          to: activity.to.replace("ETHEREUM:", ""),
          type:
            activity.to.replace("ETHEREUM:", "").toLowerCase() ===
            address?.toLowerCase()
              ? "received"
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
