import { Activity } from "packages/ui/src/organisms/activity"
import { fetchActiveTokens } from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { swapTransactionService } from "frontend/integration/icpswap/service/transaction-service"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import { useActivityPagination } from "./hooks/pagination"

const ActivityPage = () => {
  const [hasUncompletedSwap, setHasUncompletedSwap] = useState(false)
  const [triedToComplete, setTriedToComplete] = useState(false)
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: activeTokens = [] } = useSWR("activeTokens", fetchActiveTokens)

  const checkUncompletedTransactionsExist = async () => {
    const transactions = await swapTransactionService.getTransactions()

    setHasUncompletedSwap(
      transactions.some((tx) => tx.getStage() !== SwapStage.Completed),
    )
  }

  useEffect(() => {
    checkUncompletedTransactionsExist()
  }, [])

  return (
    <Activity
      activityData={data}
      tokens={activeTokens}
      triedToComplete={setTriedToComplete}
    />
  )
}

export default ActivityPage
