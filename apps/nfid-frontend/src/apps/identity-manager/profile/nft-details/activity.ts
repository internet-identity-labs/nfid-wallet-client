import { format } from "date-fns"
import React, { useState } from "react"

import { getETHTokenActivity } from "frontend/features/non-fungable-token/eth/get-tokens"
import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap/fungible-transactions"

import { ITransaction, mapTransactionsForUI } from "./utils"

const ACTIVITY_TARGET = 5

export const useNFTActivity = (nft?: UserNonFungibleToken) => {
  const [NFTActivity, setNFTActivity] = useState<ITransaction[]>([])
  const [isActivityFetching, setIsActivityFetching] = useState<boolean>(true)

  const fetchICTokenHistory = React.useCallback(
    async (i: number) => {
      if (!nft?.contractId || !nft?.tokenId) return
      let result

      try {
        result = await getTokenTxHistoryOfTokenIndex(
          nft?.contractId,
          nft?.tokenId,
          i * 10 - 10,
          i * 10,
        )
        console.debug(`fetchTokenHistory_${i}`, { result, NFTActivity })
      } catch (e) {
        console.error("fetchTokenHistory", e)
      }

      if (!result) {
        setIsActivityFetching(false)
        return
      }

      const prettifiedTransactions = mapTransactionsForUI(result.txHistory)
      prettifiedTransactions.length &&
        setNFTActivity(NFTActivity.concat(prettifiedTransactions))

      if (!result.isLastPage && NFTActivity.length < ACTIVITY_TARGET)
        fetchICTokenHistory(i + 1)
      else setIsActivityFetching(false)
    },
    [NFTActivity, nft?.contractId, nft?.tokenId],
  )

  const fetchETHTokenHistory = React.useCallback(async () => {
    if (!nft?.contractId || !nft?.tokenId) return
    const transactions = await getETHTokenActivity(
      nft.contractId,
      nft.tokenId,
      ACTIVITY_TARGET,
    )
    setNFTActivity(
      transactions.activities.map(
        (t) =>
          ({
            type: t.type,
            datetime: format(new Date(t.date), "MMM dd, yyyy - hh:mm:ss aaa"),
            from: t.from,
            to: t.to,
            price: t.price ? `${t.price} ETH` : "",
          } as ITransaction),
      ),
    )
    setIsActivityFetching(false)
  }, [nft?.contractId, nft?.tokenId])

  React.useEffect(() => {
    if (NFTActivity.length) return

    if (nft?.blockchain === "Internet Computer") fetchICTokenHistory(1)
    if (nft?.blockchain === "Ethereum") fetchETHTokenHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const transactions = React.useMemo(() => {
    return NFTActivity.sort((a, b) => Number(b.datetime) - Number(a.datetime))
  }, [NFTActivity])
  console.log({ transactions, NFTActivity, nft })

  return {
    transactions,
    isActivityFetching,
  }
}
